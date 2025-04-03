export interface ProgressUpdate {
  document_id: string;
  progress: number; // 0.0 to 1.0
  status: 'processing' | 'analyzing' | 'complete' | 'error';
  message?: string;
  timestamp: string;
}

export interface KeyInsight {
  text: string;
  confidence: number; // 0.0 to 1.0
  category?: string;
}

export interface AnalysisResult {
  document_id: string;
  filename: string;
  word_count: number;
  processing_time_seconds: number;
  key_insights: KeyInsight[];
  sentiment_score?: number;
  topics?: string[];
  error?: string;
  completed_at: string;
}

export interface DocumentStatus {
  document_id: string;
  filename: string;
  status: string;
  progress: number;
  started_at: string;
  completed_at?: string;
  result?: AnalysisResult;
}

export interface ApiError {
  status: number;
  message: string;
}
