import React, { useState, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import ProgressBar from './components/ProgressBar';
import ResultsView from './components/ResultsView';
import ErrorAlert from './components/ErrorAlert';
import { uploadDocument, getDocumentStatus } from './services/api';
import { useDocumentProgress } from './hooks/useWebSocket';
import { DocumentStatus, AnalysisResult } from './types';

const App: React.FC = () => {
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [documentStatus, setDocumentStatus] = useState<DocumentStatus | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  // Connect to WebSocket for real-time updates
  const {
    updates,
    isConnected,
    error: wsError,
  } = useDocumentProgress(documentId);

  // Handle file upload
  const handleUpload = async (file: File) => {
    setIsUploading(true);
    setError(null);

    try {
      // TODO: Implement upload logic using the API service
      // 1. Call uploadDocument from api.ts
      // 2. Set the documentId from the response
      // 3. Set initial document status
    } catch (err) {
      setError('Failed to upload document. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Poll for document status when not connected to WebSocket
  useEffect(() => {
    if (!documentId || isConnected) return;

    const pollInterval = setInterval(async () => {
      try {
        const status = await getDocumentStatus(documentId);
        setDocumentStatus(status);

        // Stop polling if processing is complete
        if (status.status === 'complete' || status.status === 'error') {
          clearInterval(pollInterval);
        }
      } catch (err) {
        console.error('Error polling document status:', err);
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [documentId, isConnected]);

  // Update status from WebSocket progress updates
  useEffect(() => {
    if (!updates || !documentStatus) return;

    setDocumentStatus((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        status: updates.status,
        progress: updates.progress,
      };
    });

    // If processing is complete, fetch the full result
    if (updates.status === 'complete') {
      getDocumentStatus(updates.document_id)
        .then((status) => setDocumentStatus(status))
        .catch((err) => console.error('Error fetching final result:', err));
    }
  }, [updates]);

  // Reset the app
  const handleReset = () => {
    setDocumentId(null);
    setDocumentStatus(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-lg font-semibold text-gray-900">
            AI Presentation Analyzer
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Error message */}
        {(error || wsError) && (
          <div className="mb-6">
            <ErrorAlert
              message={error || wsError || 'An error occurred'}
              onDismiss={() => setError(null)}
            />
          </div>
        )}

        <div className="px-4 py-6 sm:px-0">
          {!documentId ? (
            // Upload screen
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">
                Upload a Document for Analysis
              </h2>
              <p className="text-gray-500 text-center mb-6">
                Our AI will analyze your document and extract key insights
              </p>

              <FileUpload onUpload={handleUpload} isLoading={isUploading} />
            </div>
          ) : (
            // Processing/Results screen
            <div className="space-y-8">
              {documentStatus && documentStatus.status !== 'complete' ? (
                // Show progress during processing
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
                    Analyzing your document
                  </h2>

                  <ProgressBar
                    progress={documentStatus.progress}
                    status={documentStatus.status}
                    isConnected={isConnected}
                  />

                  <p className="text-sm text-gray-500 text-center mt-6">
                    This may take a minute depending on document size
                  </p>
                </div>
              ) : null}

              {documentStatus && documentStatus.result && (
                // Show results when complete
                <div>
                  <ResultsView result={documentStatus.result} />

                  <div className="mt-6 text-center">
                    <button
                      onClick={handleReset}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Analyze Another Document
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-500 text-center">
            AI Presentation Analyzer Challenge
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
