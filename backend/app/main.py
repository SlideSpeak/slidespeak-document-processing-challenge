"""
Main application module for the AI Document Analyzer API

This module defines the FastAPI application and endpoints.
You will need to implement the core functionality for document processing,
concurrent task management, and real-time updates.
"""
import uuid
from datetime import datetime
from typing import Dict
import logging

# FastAPI imports
from fastapi import FastAPI, UploadFile, WebSocket, HTTPException, BackgroundTasks, Request, status, \
    WebSocketException, WebSocketDisconnect
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

# Models and tasks
from app.services.document_processor import process_document, get_document_status, file_validation
from app.models.schemas import DocumentStatus, ProgressUpdate

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(title="AI Document Analyzer API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Queue for unprocessed status updates. To be sent via the WebSocket on reconnection
unprocessed_status_updates = {}


@app.exception_handler(HTTPException)
async def document_processor_exception_handler(request: Request, ex: HTTPException):
    return JSONResponse(status_code=ex.status_code,
                        content={"error": ex.detail})


class WSConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, document_id: str):
        await websocket.accept()
        self.active_connections[document_id] = websocket

    def disconnect(self, document_id: str):
        if document_id in self.active_connections:
            self.active_connections.pop(document_id)

    async def send_message(self, document_id: str, message: ProgressUpdate):
        try:
            websocket = self.active_connections[document_id]
            await websocket.send_json(message.model_dump_json())
        except KeyError:
            logger.error(f"No WebSocket connection found for document id {document_id}.")
            # Place message on the unprocessed queue to be sent upon reconnection
            unprocessed_status_updates.setdefault(document_id, []).append(message)
        except RuntimeError:
            logger.error(f"Failure sending update for {document_id}.")
            # Place message on the unprocessed queue to be sent upon reconnection
            unprocessed_status_updates.setdefault(document_id, []).append(message)


ws_connection_manager = WSConnectionManager()


@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "ok", "service": "AI Document Analyzer API"}


# 1. Document upload endpoint
# POST /api/documents
# This should accept a file upload and start processing it
@app.post('/api/documents')
async def document_upload(file: UploadFile, background_tasks: BackgroundTasks) -> Dict[str,str]:
    document_id = uuid.uuid4().hex
    logger.debug(f'Received document to process with file name {file.filename}, assigning document id {document_id}')
    file_bytes = await file.read()

    # Validate file
    try:
        file_validation(file_name=file.filename,
                        file_content=file_bytes)
    except Exception as ex:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail=str(ex))

    # Callback method for status updates via WebSocket connection
    async def send_status_update(message: ProgressUpdate):
        await ws_connection_manager.send_message(document_id, message)

    # Assign document processing to background task
    background_tasks.add_task(process_document, file_bytes, file.filename, document_id, send_status_update)

    # Initial document status to be sent as a response
    initial_status = DocumentStatus(document_id=document_id,
                                    filename=file.filename,
                                    status='processing',
                                    progress=0.0,
                                    started_at=datetime.now())
    return {"document_id": document_id, "status": initial_status.model_dump_json()}


# 2. Document status endpoint
# GET /api/documents/{document_id}
# This should return the current status of a document
@app.get('/api/documents/{document_id}', response_model=DocumentStatus)
async def get_document_result(document_id: str):
    try:
        document_status: DocumentStatus = await get_document_status(document_id)
        return document_status
    except:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Error, document with ID {document_id} not found")


# 3. WebSocket endpoint for real-time updates
# WebSocket /ws/documents/{document_id}
# This should provide real-time progress updates
@app.websocket('/ws/documents/{document_id}')
async def ws_document_status(websocket: WebSocket, document_id: str):
    await ws_connection_manager.connect(document_id=document_id,
                                        websocket=websocket)
    try:
        # First check if there are status messages for this document id and send the status updates
        if document_id in unprocessed_status_updates:
            for message in unprocessed_status_updates.pop(document_id):
                await ws_connection_manager.send_message(document_id, message.model_dump_json())
        while True:
            # Keep the WebSocket connection alive
            try:
                await websocket.receive_text()
            except Exception:
                break
    except WebSocketDisconnect or WebSocketException:
        logger.error(f"Client disconnected for document {document_id}")
        ws_connection_manager.disconnect(document_id)

# Additional considerations:
# - How will you handle concurrent document processing?
# - How will you manage task prioritization?
# - How will you implement retries for failed operations?
# - How will you ensure the system remains responsive under load?


