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
  searchQuery?: string;
}

export default function SearchResults({ results, answer, citations, searchQuery }: SearchResultsProps) {
  const sourceRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Helper to parse answer and replace markdown formatting and citations
  function renderAnswerWithCitations(text: string) {
    if (!text) return [];

    // First, split the text by newlines to handle headers and paragraphs
    const lines = text.split('\n');
    const processedLines: React.ReactNode[] = [];
    let key = 0;

    lines.forEach((line, lineIndex) => {
      // Process headers first
      const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headerMatch) {
        const [_, headerMarks, headerContent] = headerMatch;
        const headerLevel = headerMarks.length;
        const headerClass = `text-${headerLevel === 1 ? 'xl' : headerLevel === 2 ? 'lg' : 'md'} font-bold mt-${headerLevel === 1 ? '6' : '4'} mb-2`;
        
        // Process the header content for bold/italic
        const formattedHeader = processTextFormatting(headerContent, key);
        key += formattedHeader.length;
        
        processedLines.push(
          <div key={`header-${lineIndex}`} className={headerClass}>
            {formattedHeader}
          </div>
        );
      } else if (line.trim() === '') {
        // Add empty line for spacing
        processedLines.push(<div key={`empty-${lineIndex}`} className="h-4"></div>);
      } else {
        // Process regular text with citations and formatting
        const processedSegments = processLineWithCitations(line, key);
        key += processedSegments.keyCount;
        processedLines.push(
          <div key={`line-${lineIndex}`} className="mb-2">
            {processedSegments.nodes}
          </div>
        );
      }
    });

    return processedLines;
  }

  // Process a line of text, handling citations and text formatting
  function processLineWithCitations(line: string, startKey: number): { nodes: React.ReactNode[], keyCount: number } {
    // Split by citation markers to preserve them
    const citationRegex = /\[(\d+)\]/g;
    const segments: { text: string; isCitation: boolean; citationNum?: number }[] = [];
    
    let lastIndex = 0;
    let match;
    
    // Extract all citations and regular text segments
    while ((match = citationRegex.exec(line)) !== null) {
      const idx = match.index;
      const citationNum = parseInt(match[1], 10);
      
      // Add text before citation
      if (idx > lastIndex) {
        segments.push({ text: line.slice(lastIndex, idx), isCitation: false });
      }
      
      // Add citation
      segments.push({ text: `[${citationNum}]`, isCitation: true, citationNum });
      
      lastIndex = idx + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < line.length) {
      segments.push({ text: line.slice(lastIndex), isCitation: false });
    }
    
    // Process each text segment for markdown
    const parts: React.ReactNode[] = [];
    let key = startKey;
    
    segments.forEach(segment => {
      if (segment.isCitation) {
        // Render citations as clickable spans
        parts.push(
          <span
            key={`citation-${key++}`}
            className="text-blue-600 dark:text-blue-400 cursor-pointer hover:underline font-semibold"
            onClick={() => {
              const ref = sourceRefs.current[(segment.citationNum as number) - 1];
              if (ref) {
                ref.scrollIntoView({ behavior: 'smooth', block: 'center' });
                ref.classList.add('ring-2', 'ring-blue-400');
                setTimeout(() => ref.classList.remove('ring-2', 'ring-blue-400'), 1200);
              }
            }}
          >
            {segment.text}
          </span>
        );
      } else {
        // Process regular text for markdown formatting
        const formattedParts = processTextFormatting(segment.text, key);
        key += formattedParts.length;
        parts.push(...formattedParts);
      }
    });
    
    return { nodes: parts, keyCount: key - startKey };
  }

  // Process text formatting (bold, italic)
  function processTextFormatting(text: string, startKey: number): React.ReactNode[] {
    // Process text with markdown in order:
    // 1. First process bold text with double asterisks
    const boldRegex = /\*\*(.*?)\*\*/g;
    let boldMatch;
    let boldParts: React.ReactNode[] = [];
    let boldLastIndex = 0;
    let key = startKey;
    
    while ((boldMatch = boldRegex.exec(text)) !== null) {
      if (boldMatch.index > boldLastIndex) {
        boldParts.push(text.slice(boldLastIndex, boldMatch.index));
      }
      
      boldParts.push(
        <strong key={`bold-${key++}`}>{boldMatch[1]}</strong>
      );
      
      boldLastIndex = boldMatch.index + boldMatch[0].length;
    }
    
    if (boldLastIndex < text.length) {
      boldParts.push(text.slice(boldLastIndex));
    }
    
    // 2. Now process italic text within each part that's not already bold
    const processedParts: React.ReactNode[] = [];
    
    boldParts.forEach((part, partIndex) => {
      if (typeof part === 'string') {
        const italicRegex = /\*(.*?)\*/g;
        let italicMatch;
        let italicParts: React.ReactNode[] = [];
        let italicLastIndex = 0;
        
        while ((italicMatch = italicRegex.exec(part)) !== null) {
          if (italicMatch.index > italicLastIndex) {
            italicParts.push(part.slice(italicLastIndex, italicMatch.index));
          }
          
          italicParts.push(
            <em key={`italic-${key++}`}>{italicMatch[1]}</em>
          );
          
          italicLastIndex = italicMatch.index + italicMatch[0].length;
        }
        
        if (italicLastIndex < part.length) {
          italicParts.push(part.slice(italicLastIndex));
        }
        
        processedParts.push(...italicParts);
      } else {
        processedParts.push(part);
      }
    });
    
    return processedParts;
  }

  // Fix for proper ref callback usage
  const setSourceRef = (index: number) => (el: HTMLDivElement | null) => {
    sourceRefs.current[index] = el;
  };

  if (results.length === 0 && !answer) {
    return null;
  }

  return (
    <div className="space-y-6 w-full max-w-none">
      {/* Search query display */}
      {searchQuery && (
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <div className="w-1 h-5 bg-purple-500 rounded-full mr-3"></div>
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-300">
              Search Results for
            </h3>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-xl font-medium text-gray-900 dark:text-gray-100 break-words">
              "{searchQuery}"
            </p>
          </div>
        </div>
      )}

      {/* Generated answer */}
      {answer && (
        <div className="card bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 mb-6 overflow-hidden">
          <div className="p-6">
            <div className="prose dark:prose-dark max-w-none">
              <div className="text-base leading-relaxed text-gray-800 dark:text-gray-200">
                {renderAnswerWithCitations(answer)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sources section */}
      {results.length > 0 && (
        <div>
          <div className="flex items-center mb-4 px-2 pb-2 border-b border-gray-200 dark:border-gray-700">
            <div className="w-1 h-5 bg-blue-500 rounded-full mr-3"></div>
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-300">
              Sources
            </h3>
            <div className="ml-auto text-sm text-gray-500 dark:text-gray-400">
              {results.length} {results.length === 1 ? 'source' : 'sources'} found
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {results.map((result, index) => (
              <div
                key={index}
                ref={setSourceRef(index)}
                className="transition-all"
              >
                <a 
                  href={result.url}
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="w-6 h-6 overflow-hidden rounded-sm border border-gray-100 dark:border-gray-600 bg-white flex-shrink-0">
                    <img 
                      src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(result.url)}&sz=32`}
                      alt=""
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/favicon.ico';
                      }}
                    />
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="text-sm font-medium truncate text-gray-800 dark:text-gray-200">
                      {result.title}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {result.displayUrl}
                    </div>
                  </div>
                  <span className="ml-2 flex-shrink-0 w-6 h-6 flex items-center justify-center text-xs text-white bg-blue-500 rounded-full">{index + 1}</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 