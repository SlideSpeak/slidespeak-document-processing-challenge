"""
Tests for the FastAPI endpoints
"""

import pytest
from fastapi.testclient import TestClient
import asyncio
from unittest.mock import patch, MagicMock

from app.main import app
from app.models.schemas import AnalysisResult, KeyInsight
import json

client = TestClient(app)


def test_root_endpoint():
    """Test the health check endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "AI Document Analyzer API"}


@patch("app.main.process_document")
def test_upload_document(mock_process):
    """Test document upload endpoint"""
    # Mock the process_document function to avoid actual processing
    mock_result = AnalysisResult(
        document_id="test-123",
        filename="test.txt",
        word_count=100,
        processing_time_seconds=2.5,
        key_insights=[KeyInsight(text="Test insight", confidence=0.9, category="test")],
    )
    mock_process.return_value = mock_result

    # Create a test file
    test_file_content = b"Test document content"
    files = {"file": ("test.txt", test_file_content, "text/plain")}

    # Test the upload endpoint
    response = client.post("/api/documents", files=files)

    # Check response
    assert response.status_code == 200
    assert "document_id" in response.json()
    assert json.loads(response.json()['status'])['status'] == "processing"


@patch("app.main.get_document_status")
def test_get_document_status(mock_get_status):
    """Test document status endpoint"""
    # Mock the get_document_status function
    mock_get_status.return_value = {
        "document_id": "test-123",
        "filename": "test.txt",
        "status": "complete",
        "progress": 1.0,
        "started_at": "2023-01-01T12:00:00",
        "completed_at": "2023-01-01T12:01:00",
        "result": {
            "document_id": "test-123",
            "filename": "test.txt",
            "word_count": 100,
            "processing_time_seconds": 2.5,
            "key_insights": [
                {"text": "Test insight", "confidence": 0.9, "category": "test"}
            ],
            "sentiment_score": 0.5,
            "topics": ["test"],
            "completed_at": "2023-01-01T12:01:00",
        },
    }

    # Test the status endpoint
    response = client.get("/api/documents/test-123")

    # Check response
    assert response.status_code == 200
    assert response.json()["document_id"] == "test-123"
    assert response.json()["status"] == "complete"
    assert "result" in response.json()


@patch("app.main.get_document_status")
def test_get_nonexistent_document(mock_get_status):
    """Test retrieving a document that doesn't exist"""
    # Mock the function to raise an exception
    mock_get_status.side_effect = KeyError("Document not found")

    # Test the status endpoint with a non-existent document
    response = client.get("/api/documents/nonexistent-id")

    # Check response is a 404 error
    assert response.status_code == 404
    assert "error" in response.json()


# Note: WebSocket testing is more complex and typically requires
# specific WebSocket testing tools. For the purposes of this challenge,
# we'll omit detailed WebSocket tests, but in a real application
# they would be essential.
