import React from 'react';
import { AnalysisResult } from '../types';
import KeyInsights from './KeyInsights';

interface ResultsViewProps {
  result: AnalysisResult;
}

const ResultsView: React.FC<ResultsViewProps> = ({ result }) => {
  // TODO: Implement the results view component
  // The component should:
  // 1. Display document details (filename, word count, processing time)
  // 2. Show key insights using the KeyInsights component
  // 3. Display sentiment score with visual indicator
  // 4. Show topics as tags
  // 5. Include error state if result has an error

  if (result.error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <svg
          className="w-12 h-12 text-red-400 mx-auto mb-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="text-lg font-medium text-red-800 mb-2">
          Processing Error
        </h3>
        <p className="text-red-600">{result.error}</p>
      </div>
    );
  }

  // Format the date
  const completedDate = new Date(result.completed_at);
  const dateFormatted = completedDate.toLocaleString();

  // Determine sentiment class and label
  let sentimentClass = 'bg-gray-200 text-gray-700';
  let sentimentLabel = 'Neutral';

  if (result.sentiment_score !== undefined) {
    if (result.sentiment_score > 0.25) {
      sentimentClass = 'bg-green-100 text-green-800';
      sentimentLabel = 'Positive';
    } else if (result.sentiment_score < -0.25) {
      sentimentClass = 'bg-red-100 text-red-800';
      sentimentLabel = 'Negative';
    } else {
      sentimentClass = 'bg-gray-100 text-gray-800';
      sentimentLabel = 'Neutral';
    }
  }

  return (
    <div className="bg-white rounded-lg shadow divide-y divide-gray-200">
      {/* Header */}
      <div className="px-6 py-5">
        <h2 className="text-xl font-bold text-gray-900">{result.filename}</h2>
        <p className="text-sm text-gray-500 mt-1">
          Processed on {dateFormatted}
        </p>
      </div>

      {/* Document Statistics */}
      <div className="px-6 py-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div>
          <p className="text-sm font-medium text-gray-500">Word Count</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">
            {result.word_count.toLocaleString()}
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-500">Processing Time</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">
            {result.processing_time_seconds.toFixed(2)}s
          </p>
        </div>

        {result.sentiment_score !== undefined && (
          <div>
            <p className="text-sm font-medium text-gray-500">Sentiment</p>
            <span
              className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${sentimentClass}`}
            >
              {sentimentLabel} ({result.sentiment_score.toFixed(2)})
            </span>
          </div>
        )}
      </div>

      {/* Topics */}
      {result.topics && result.topics.length > 0 && (
        <div className="px-6 py-5">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Topics</h3>
          <div className="flex flex-wrap gap-2">
            {result.topics.map((topic, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Key Insights */}
      <div className="px-6 py-5">
        <KeyInsights insights={result.key_insights} />
      </div>
    </div>
  );
};

export default ResultsView;
