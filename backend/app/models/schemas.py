from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime


class ProgressUpdate(BaseModel):
    """Schema for progress updates sent over WebSocket"""

    document_id: str
    progress: float  # 0.0 to 1.0
    status: str  # "processing", "analyzing", "complete", "error"
    message: Optional[str] = None
    timestamp: datetime = datetime.now()


class KeyInsight(BaseModel):
    """Schema for key insights extracted from the document"""

    text: str
    confidence: float  # 0.0 to 1.0
    category: Optional[str] = None


class AnalysisResult(BaseModel):
    """Schema for the final analysis result"""

    document_id: str
    filename: str
    word_count: int
    processing_time_seconds: float
    key_insights: List[KeyInsight]
    sentiment_score: Optional[float] = None
    topics: Optional[List[str]] = None
    error: Optional[str] = None
    completed_at: datetime = datetime.now()


class DocumentStatus(BaseModel):
    """Schema for document status responses"""

    document_id: str
    filename: str
    status: str
    progress: float
    started_at: datetime
    completed_at: Optional[datetime] = None
    result: Optional[AnalysisResult] = None
