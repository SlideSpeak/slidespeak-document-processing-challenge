import React from 'react';

interface ProgressBarProps {
  progress: number; // 0 to 1
  status: string;
  isConnected: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  status,
  isConnected,
}) => {
  // TODO: Implement the progress bar component
  // The component should:
  // 1. Show progress visually
  // 2. Display status text
  // 3. Handle different statuses (processing, analyzing, complete, error)
  // 4. Show connection status indicator

  const normalizedProgress = Math.min(Math.max(progress, 0), 1);
  const percent = Math.round(normalizedProgress * 100);

  // Map status to display text and styles
  const statusConfig = {
    processing: {
      label: 'Processing Document',
      color: 'bg-blue-500',
      textColor: 'text-blue-700',
    },
    analyzing: {
      label: 'Analyzing Content',
      color: 'bg-indigo-500',
      textColor: 'text-indigo-700',
    },
    complete: {
      label: 'Analysis Complete',
      color: 'bg-green-500',
      textColor: 'text-green-700',
    },
    error: {
      label: 'Processing Error',
      color: 'bg-red-500',
      textColor: 'text-red-700',
    },
  };

  // Default to processing if status is not recognized
  const currentStatus =
    statusConfig[status as keyof typeof statusConfig] ||
    statusConfig.processing;

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Connection status indicator */}
      <div className="flex items-center mb-2">
        <div
          className={`w-2 h-2 rounded-full mr-2 ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`}
        />
        <span className="text-xs text-gray-500">
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      {/* Status label */}
      <div className="flex justify-between items-center mb-1">
        <span className={`text-sm font-medium ${currentStatus.textColor}`}>
          {currentStatus.label}
        </span>
        <span className="text-sm font-medium text-gray-700">{percent}%</span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
        <div
          className={`h-2.5 rounded-full ${currentStatus.color} transition-all duration-300 ease-in-out`}
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Status message */}
      {status === 'processing' && (
        <div className="text-center text-xs text-gray-500">
          <p>Extracting text from your document...</p>
        </div>
      )}

      {status === 'analyzing' && (
        <div className="text-center text-xs text-gray-500">
          <p>AI is analyzing your content for key insights...</p>
        </div>
      )}

      {status === 'complete' && (
        <div className="text-center text-xs text-gray-600">
          <p>Your document has been fully analyzed!</p>
        </div>
      )}

      {status === 'error' && (
        <div className="text-center text-xs text-red-500">
          <p>There was an error processing your document. Please bear with us while we retry.</p>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
