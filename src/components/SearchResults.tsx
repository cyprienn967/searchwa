'use client';

import React, { useRef } from 'react';
import { SearchResult } from '@/lib/types';

interface SearchResultsProps {
  results: SearchResult[];
  answer?: string;
  citations?: Array<{
    title: string;
    url: string;
  }>;
}

export default function SearchResults({ results, answer, citations }: SearchResultsProps) {
  const sourceRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Helper to parse answer and replace [n] with clickable spans
  function renderAnswerWithCitations(text: string) {
    // Match [1], [2], [10], etc.
    const regex = /\[(\d+)\]/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;
    let key = 0;
    while ((match = regex.exec(text)) !== null) {
      const idx = match.index;
      const citationNum = parseInt(match[1], 10);
      // Push text before citation
      if (idx > lastIndex) {
        parts.push(text.slice(lastIndex, idx));
      }
      // Push clickable citation
      parts.push(
        <span
          key={`citation-${key++}`}
          className="text-blue-600 dark:text-blue-400 cursor-pointer hover:underline font-semibold"
          onClick={() => {
            const ref = sourceRefs.current[citationNum - 1];
            if (ref) {
              ref.scrollIntoView({ behavior: 'smooth', block: 'center' });
              ref.classList.add('ring-2', 'ring-blue-400');
              setTimeout(() => ref.classList.remove('ring-2', 'ring-blue-400'), 1200);
            }
          }}
        >
          [{citationNum}]
        </span>
      );
      lastIndex = idx + match[0].length;
    }
    // Push remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }
    return parts;
  }

  if (results.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6 w-full max-w-none">
      {/* Generated answer */}
      {answer && (
        <div className="card p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 mb-6">
          <div className="prose dark:prose-dark max-w-none">
            <div className="text-base leading-relaxed text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
              {renderAnswerWithCitations(answer)}
            </div>
          </div>
        </div>
      )}

      {/* Sources section */}
      <div>
        <div className="flex items-center mb-2 px-2 pb-2 border-b border-gray-200 dark:border-gray-700">
          <div className="w-1 h-5 bg-blue-500 rounded-full mr-3"></div>
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-300">
            Sources
          </h3>
          <div className="ml-auto text-sm text-gray-500 dark:text-gray-400">
            {results.length} {results.length === 1 ? 'source' : 'sources'} found
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1.5">
          {results.map((result, index) => (
            <div
              key={index}
              ref={el => (sourceRefs.current[index] = el)}
              className="transition-all"
            >
              <a 
                href={result.url}
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center p-2 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="w-5 h-5 overflow-hidden rounded-sm border border-gray-100 dark:border-gray-600 bg-white flex-shrink-0">
                  <img 
                    src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(result.url)}&sz=32`}
                    alt=""
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/favicon.ico';
                    }}
                  />
                </div>
                <div className="ml-2 flex-1 min-w-0">
                  <div className="text-sm font-medium truncate text-gray-800 dark:text-gray-200">
                    {result.title}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {result.displayUrl}
                  </div>
                </div>
                <span className="ml-2 text-xs text-gray-400">[{index + 1}]</span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 