"""
Document processor service - NEEDS IMPLEMENTATION

This module contains the core document processing logic.
Candidates should implement the functions below to create an efficient
document processing pipeline.
"""
import asyncio
from asyncio import Task
from datetime import datetime
from typing import List, Dict, Any, Callable, Coroutine, Optional
import time
import logging
import itertools

# Document chunking
from langchain.text_splitter import RecursiveCharacterTextSplitter

# Models and downstream services
from app.models.schemas import ProgressUpdate, AnalysisResult, KeyInsight, DocumentStatus
from app.services.ai_service import (
    analyze_text_chunk,
    extract_key_insights,
    extract_text_from_document,
)

# Error handling
from app.utils.error_handlers import call_func_with_retries

logger = logging.getLogger(__name__)

# In-memory storage for document results
# In a real application, this would be a database
document_store: Dict[str, Any] = {}

DOCUMENT_CACHE = {}

class DOCUMENT_STATUS_PROGRESS:
    def __init__(self, status, progress):
        self.status = status
        self.progress = progress


class DOCUMENT_STATUSES:
    """
    Class to pair statuses and progress indicators for status updates
    """
    PROCESSING = DOCUMENT_STATUS_PROGRESS('processing', 0.0)
    ANALYZING = DOCUMENT_STATUS_PROGRESS('analyzing', 0.5)
    EXTRACT_KEY_INSIGHTS = DOCUMENT_STATUS_PROGRESS('analyzing', 0.75)
    COMPLETE = DOCUMENT_STATUS_PROGRESS('complete', 1)
    ERROR = DOCUMENT_STATUS_PROGRESS('error', 1)

class DocumentCacheItem:
    def __init__(self, file_content: bytes, result: Optional[AnalysisResult] = None):
        self.file_content = file_content
        self.result = result


def get_document_update(document_id: str,
                        filename: str,
                        started_at,
                        document_status: DOCUMENT_STATUS_PROGRESS,
                        message: Optional[str] = None,
                        result: Optional[AnalysisResult] = None,
                        completed_at: Optional[datetime] = None) -> ProgressUpdate:
    """
    Creates a ProgressUpdate object to provide real-time status updates for a document.
    Creates and stores a DocumentStatus object to be stored in the document store

    Args:
        document_id (str): The unique identifier of the document.
        filename (str): The name of the document file.
        started_at: The timestamp when the document processing started.
        document_status (DOCUMENT_STATUS_PROGRESS): The current status of the document processing.
        message (str, optional): Optional error message to include in the update. Defaults to None.
        result (AnalysisResult, optional): Optional analysis result to include in the update. Defaults to None.
        completed_at (datetime, optional): Optional timestamp when the document processing completed. Defaults to None.

    Returns:
        ProgressUpdate: A ProgressUpdate object containing the latest status and information about the document.
    """
    doc_status: ProgressUpdate = ProgressUpdate(document_id=document_id,
                                                progress=document_status.progress,
                                                status=document_status.status,
                                                message=message)
    document_store[document_id] = DocumentStatus(document_id=document_id,
                                                 filename=filename,
                                                 progress=doc_status.progress,
                                                 status=doc_status.status,
                                                 started_at=started_at,
                                                 result=result,
                                                 completed_at=completed_at)
    return doc_status


# TODO: Implement this function
async def chunk_document(text: str, chunk_size: int = 1000) -> List[str]:
    """
    Split document text into manageable chunks for processing

    Args:
        text: The full document text
        chunk_size: Approximate size of each chunk in characters

    Returns:
        List of text chunks
    """
    # Determine chunk overlap size based on chunk size
    chunk_overlap = int(chunk_size * 0.2)
    splitter = RecursiveCharacterTextSplitter(chunk_size=chunk_size,
                                              chunk_overlap=chunk_overlap)
    chunks = splitter.split_text(text)
    return chunks


def file_validation(file_name: str, file_content: bytes):
    allowed_file_extensions = ['docx', 'pdf', 'txt']
    file_size_liit = 10 #MB

    if file_name.split('.')[1] not in allowed_file_extensions:
        raise Exception(f'Only the file types {", ".join(allowed_file_extensions)} are allowed.')
    if (len(file_content) / 1024 / 1024) > file_size_liit:
        raise Exception(f'File size exceeds file size limit of {file_size_liit}MB.')


# TODO: Implement this function
async def process_document(
    file_content: bytes,
    filename: str,
    document_id: str,
    progress_callback: Callable[[ProgressUpdate], Coroutine[Any, Any, None]],
) -> AnalysisResult:
    """
    Process a document through the entire pipeline:
    1. Extract text from document
    2. Split into chunks
    3. Analyze each chunk
    4. Extract key insights
    5. Combine results

    Args:
        file_content: Raw bytes of the uploaded file
        filename: Original filename of the document
        document_id: Unique ID for the document
        progress_callback: Async function to call with progress updates

    Returns:
        AnalysisResult object with the complete analysis
    """
    # Start performance timer
    start_time = time.perf_counter()
    # Check if the document is in the cache by filename and then bytes
    doc_from_cache: DocumentCacheItem = DOCUMENT_CACHE.get(filename)
    if doc_from_cache and doc_from_cache.file_content == file_content:
        # Document has already been processed, send the result from cache after updating the times and document id
        result: AnalysisResult = doc_from_cache.result
        result.processing_time_seconds = time.perf_counter() - start_time
        result.completed_at = datetime.now()
        result.document_id = document_id
        await progress_callback(get_document_update(document_id,
                                                    filename,
                                                    start_time,
                                                    DOCUMENT_STATUSES.COMPLETE,
                                                    result=result,
                                                    completed_at=datetime.now()))
        return result

    result: AnalysisResult = AnalysisResult(document_id=document_id,
                            filename=filename,
                            word_count=0,
                            processing_time_seconds=0,
                            key_insights=[])
    try:
        # Get file text
        file_text: str = await call_func_with_retries(extract_text_from_document, file_content=file_content)

        # Split document text into chunks
        await progress_callback(get_document_update(document_id, filename, start_time, DOCUMENT_STATUSES.PROCESSING))
        chunk_size: int = max(500, min(len(file_text), 2000)) if len(file_text) > 700 else 1
        text_chunks: List[str] = await call_func_with_retries(chunk_document, chunk_size=chunk_size, text=file_text)

        # Analyze document chunks
        await progress_callback(get_document_update(document_id, filename, start_time, DOCUMENT_STATUSES.ANALYZING))
        chunks_analysis_tasks: List[Task] = [asyncio.create_task(call_func_with_retries(analyze_text_chunk, chunk)) for chunk in text_chunks]
        chunks_analysis: List[Dict[str, Any]] = await asyncio.gather(*chunks_analysis_tasks)

        # Extract key insights from the whole document
        await progress_callback(get_document_update(document_id, filename, start_time, DOCUMENT_STATUSES.EXTRACT_KEY_INSIGHTS))
        key_insights: List[KeyInsight] = await call_func_with_retries(extract_key_insights, file_text)

        # End performance counter
        end_time = time.perf_counter()
        processing_time_seconds = end_time - start_time

        # Prepare and save result
        result.word_count = sum(chunk['word_count'] for chunk in chunks_analysis)
        result.processing_time_seconds = processing_time_seconds
        result.key_insights = key_insights
        result.sentiment_score = sum(chunk['sentiment_score'] for chunk in chunks_analysis) / len(chunks_analysis)
        result.topics = set(itertools.chain(*[chunk['topics'] for chunk in chunks_analysis]))
        result.completed_at = datetime.now()

        await progress_callback(get_document_update(document_id,
                                                    filename,
                                                    start_time,
                                                    DOCUMENT_STATUSES.COMPLETE,
                                                    result=result,
                                                    completed_at=datetime.now()))
        DOCUMENT_CACHE[filename] = DocumentCacheItem(file_content=file_content,
                                                     result=result)

    except Exception as ex:
        # An error occurred
        logger.exception(f'There was an exception {ex}')
        end_time = time.perf_counter()
        processing_time_seconds = end_time - start_time


        # Prepare and save error result
        result.word_count = 0
        result.processing_time_seconds = processing_time_seconds
        result.key_insights = None
        result.error = str(ex)
        result.completed_at = datetime.now()
        await progress_callback(get_document_update(document_id,
                                                    filename,
                                                    start_time,
                                                    DOCUMENT_STATUSES.ERROR,
                                                    message=str(ex),
                                                    result=result,
                                                    completed_at=datetime.now()))
    finally:
        return result


# TODO: Implement this function
async def get_document_status(document_id: str) -> DocumentStatus:
    """
    Get the current status of a document

    Args:
        document_id: The document ID to check

    Returns:
        Document status information
    """
    doc_process_result = document_store[document_id]
    return doc_process_result
