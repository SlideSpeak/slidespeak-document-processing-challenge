"""
Tests for the document processing service
"""

import pytest
import asyncio
from unittest.mock import AsyncMock, patch

from app.services.document_processor import chunk_document, process_document
from app.models.schemas import ProgressUpdate


@pytest.mark.asyncio
async def test_chunk_document():
    """Test document chunking functionality"""
    # Test with a simple document
    test_document = (
        "This is a test document.\nIt has multiple lines.\nEach line is a sentence."
    )
    chunks = await chunk_document(test_document, chunk_size=20)

    # Check that we get reasonable chunks
    assert len(chunks) > 0

    # Check that all text is preserved
    combined = " ".join(chunks)
    for word in test_document.split():
        assert word in combined

    # Test with a longer document
    long_doc = "This is a longer test document. " * 50
    chunks = await chunk_document(long_doc, chunk_size=100)

    # Check that chunks are roughly the requested size
    for chunk in chunks:
        assert len(chunk) <= 150  # Allow some flexibility for sentence boundaries


@pytest.mark.asyncio
async def test_process_document():
    """Test the document processing pipeline"""
    # Create a mock for progress callback
    mock_callback = AsyncMock()

    # Create a simple test document as bytes
    test_document = b"This is a test document for AI analysis.\n" * 10
    document_id = "test-123"
    filename = "test.txt"

    # Process the document
    with patch(
        "app.services.ai_service.extract_text_from_document",
        return_value="This is extracted text",
    ):
        result = await process_document(
            test_document, filename, document_id, mock_callback
        )

    # Check that the callback was called with progress updates
    assert mock_callback.call_count > 0

    # Verify the result structure
    assert result.document_id == document_id
    assert result.filename == filename
    assert result.word_count > 0
    assert result.processing_time_seconds > 0
    assert len(result.key_insights) > 0

    # Verify that progress updates were sent
    # First call should be for initialization
    first_call_args = mock_callback.call_args_list[0][0][0]
    assert first_call_args.progress == 0.0
    assert first_call_args.status == "processing"

    # Last call should be for completion
    last_call_args = mock_callback.call_args_list[-1][0][0]
    assert last_call_args.progress == 1.0
    assert last_call_args.status == "complete"


@pytest.mark.asyncio
async def test_process_document_error_handling():
    """Test error handling in document processing"""
    # Create a mock for progress callback
    mock_callback = AsyncMock()

    # Mock the AI service to raise an exception
    with patch(
        "app.services.ai_service.extract_text_from_document",
        side_effect=Exception("Test error"),
    ):
        # Process a document
        test_document = b"This will cause an error in processing.\n" * 5
        document_id = "test-error-123"
        filename = "error.txt"

        # Process should complete but with errors
        result = await process_document(
            test_document, filename, document_id, mock_callback
        )

        # Check that error info is in the result
        assert result.error is not None
        assert "error" in result.error.lower()

        # Check that at least one error update was sent
        error_updates = [
            call[0][0]
            for call in mock_callback.call_args_list
            if call[0][0].status == "error"
        ]
        assert len(error_updates) > 0
