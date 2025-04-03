import React from 'react';
import { KeyInsight } from '../types';

interface KeyInsightsProps {
  insights: KeyInsight[];
}

const KeyInsights: React.FC<KeyInsightsProps> = ({ insights }) => {
  // TODO: Implement the key insights component
  // The component should:
  // 1. Display a list of insights with confidence scores
  // 2. Group insights by category if available
  // 3. Show empty state if no insights available

  if (!insights || insights.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 text-center">
        <p className="text-gray-500">No insights available</p>
      </div>
    );
  }

  // Group insights by category
  const groupedInsights: Record<string, KeyInsight[]> = {};

  insights.forEach((insight) => {
    const category = insight.category || 'General';
    if (!groupedInsights[category]) {
      groupedInsights[category] = [];
    }
    groupedInsights[category].push(insight);
  });

  // Sort categories alphabetically, but keep "General" at the top
  const sortedCategories = Object.keys(groupedInsights).sort((a, b) => {
    if (a === 'General') return -1;
    if (b === 'General') return 1;
    return a.localeCompare(b);
  });

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
        <h3 className="text-lg font-semibold text-white">Key Insights</h3>
        <p className="text-blue-100 text-sm">
          AI-generated highlights from your document
        </p>
      </div>

      <div className="p-4">
        {sortedCategories.map((category) => (
          <div key={category} className="mb-6 last:mb-0">
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              {category}
            </h4>

            <ul className="space-y-3">
              {groupedInsights[category].map((insight, index) => (
                <li key={index} className="flex items-start">
                  <div className="flex-shrink-0 mt-0.5">
                    <div
                      className={`w-2 h-2 rounded-full mr-3 ${
                        insight.confidence >= 0.9
                          ? 'bg-green-500'
                          : insight.confidence >= 0.7
                          ? 'bg-blue-500'
                          : 'bg-yellow-500'
                      }`}
                    />
                  </div>

                  <div className="flex-1">
                    <p className="text-gray-700">{insight.text}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Confidence: {Math.round(insight.confidence * 100)}%
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KeyInsights;
