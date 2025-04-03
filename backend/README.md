# AI Presentation Analyzer - Backend

This is the backend for the AI Presentation Analyzer coding challenge. It's a FastAPI application that processes documents, extracts text, analyzes content using mock AI services, and provides real-time progress updates via WebSockets.

## Tech Stack

- Python 3.9+
- FastAPI for API routes and WebSockets
- Async I/O for efficient processing
- WebSockets for real-time updates

## Setup and Running

```bash
# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server with auto-reload
uvicorn app.main:app --reload

# Run tests
pytest
```

## Implementation Tasks

To complete this challenge, you need to implement the following components and functionality:

### 1. Document Processor (`app/services/document_processor.py`)

- [ ] Implement the `chunk_document` function to split documents into manageable parts
- [ ] Complete the `process_document` function to process documents through the analysis pipeline
- [ ] Implement the `get_document_status` function to retrieve document status

### 2. API Endpoints (`app/main.py`)

- [ ] Implement the document upload endpoint
- [ ] Complete the document status endpoint
- [ ] Create the WebSocket endpoint for real-time updates
- [ ] Add proper error handling and response formatting

## Project Structure

- `/app`: Main application package
  - `/models`: Pydantic schemas
  - `/services`: Core business logic
  - `main.py`: API routes and WebSocket endpoints
- `/tests`: Test modules

## API Endpoints

The application should expose the following endpoints:

- `POST /api/documents`: Upload a document for processing

  - Accepts multipart/form-data with a file field
  - Returns document ID and initial status

- `GET /api/documents/{document_id}`: Get document status and results

  - Returns current status, progress, and results if available

- `WebSocket /ws/documents/{document_id}`: Real-time progress updates
  - Sends JSON messages with progress updates

## Mock AI Services

The `ai_service.py` module provides mock implementations of AI functionality:

- `extract_text_from_document`: Simulates text extraction from documents
- `analyze_text_chunk`: Simulates analyzing text with an AI model
- `extract_key_insights`: Simulates extracting key insights from text

These functions include artificial delays and occasional errors to simulate real-world AI services.

## Document Processing Pipeline

The document processing flow should be:

1. Extract text from the uploaded document
2. Split the text into manageable chunks
3. Process each chunk with the AI service
4. Extract key insights from the complete text
5. Combine results and send the final analysis

Throughout this process, the application should send progress updates to connected clients via WebSocket.

## Evaluation Criteria

Your implementation will be evaluated based on:

1. **Functionality**: Does it work as expected? Can it process documents and return results?
2. **Code Quality**: Is the code well-organized, readable, and maintainable?
3. **Performance**: Does it efficiently handle concurrency and resource management?
4. **Error Handling**: Does it gracefully handle errors and edge cases?
5. **Real-time Updates**: Does it effectively use WebSockets for progress reporting?

## Stretch Goals

If you complete the core requirements and have time remaining, consider implementing:

- [ ] Add document validation (size, type) with meaningful error messages
- [ ] Implement caching to avoid reprocessing
- [ ] Add more advanced error handling and retry mechanisms
- [ ] Implement batching for multiple parallel document processing
- [ ] Add more comprehensive tests

Good luck with your implementation!
