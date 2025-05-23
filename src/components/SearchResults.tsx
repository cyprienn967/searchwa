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
  hideQueryHeader?: boolean;
  globalFontSize?: string;
}

export default function SearchResults({ results, answer, citations, searchQuery, hideQueryHeader, globalFontSize = 'text-base' }: SearchResultsProps) {
  const sourceRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Helper function to get font size classes based on text type
  const getFontSizeClass = (type: 'header' | 'text' | 'small' | 'title' = 'text') => {
    const baseSizes = {
      'text-xs': { header: 'text-sm', text: 'text-xs', small: 'text-xs', title: 'text-xs' },
      'text-sm': { header: 'text-base', text: 'text-sm', small: 'text-xs', title: 'text-sm' },
      'text-base': { header: 'text-lg', text: 'text-base', small: 'text-sm', title: 'text-base' },
      'text-lg': { header: 'text-xl', text: 'text-lg', small: 'text-base', title: 'text-lg' },
      'text-xl': { header: 'text-2xl', text: 'text-xl', small: 'text-lg', title: 'text-xl' },
      'text-2xl': { header: 'text-3xl', text: 'text-2xl', small: 'text-xl', title: 'text-2xl' }
    };
    
    return baseSizes[globalFontSize as keyof typeof baseSizes]?.[type] || baseSizes['text-base'][type];
  };

  // Add console logging to debug citations
  console.log('SearchResults props:', { results, answer, citations, searchQuery });
  
  // Helper function to extract domain from URL for favicon
  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      // Fallback for invalid URLs
      return `https://www.google.com/s2/favicons?domain=google.com&sz=32`;
    }
  };

  // Helper to parse answer and replace markdown formatting and citations
  function renderAnswerWithCitations(text: string) {
    if (!text) return [];

    console.log('Rendering answer text:', text);
    
    // First, do a simple scan to find citation patterns
    // Common patterns in AI-generated text
    const simpleCitationRegex = /\[(\d+)\]/g;
    let hasCitations = simpleCitationRegex.test(text);
    console.log('Text has citations:', hasCitations);
    
    // If no citations are found with standard patterns, try to manually add them
    if (!hasCitations && results.length > 0) {
      // Check if there are any numbers that might be references
      const possibleCitationsRegex = /\b(\d+)\b/g;
      const matches = [...text.matchAll(possibleCitationsRegex)];
      const possibleCitations = matches
        .map(match => parseInt(match[1], 10))
        .filter(num => num > 0 && num <= results.length);
      
      console.log('Possible implicit citations:', possibleCitations);
      
      if (possibleCitations.length > 0) {
        // We found numbers that might be references, convert them to citation format
        let modifiedText = text;
        for (const num of possibleCitations) {
          // Find instances of this number
          const numRegex = new RegExp(`\\b${num}\\b`, 'g');
          modifiedText = modifiedText.replace(numRegex, `[${num}]`);
        }
        text = modifiedText;
        console.log('Modified text with citations:', text);
      }
    }
    
    // First, split the text by newlines to handle headers and paragraphs
    const lines = text.split('\n');
    const processedLines: React.ReactNode[] = [];
    let key = 0;

    lines.forEach((line, lineIndex) => {
      console.log(`Processing line ${lineIndex}:`, line);
      // Process headers first
      const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headerMatch) {
        const [_, headerMarks, headerContent] = headerMatch;
        const headerLevel = headerMarks.length;
        const headerClass = `${getFontSizeClass('header')} font-bold mt-${headerLevel === 1 ? '6' : '4'} mb-2`;
        
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
    // Basic citation pattern is [number]
    const simpleCitationRegex = /\[(\d+)\]/g;
    
    console.log('Checking line for citations:', line);
    
    const segments: { text: string; isCitation: boolean; citationNum?: number; originalText: string }[] = [];
    
    let lastIndex = 0;
    let match;
    
    // First look for simple [number] citations
    while ((match = simpleCitationRegex.exec(line)) !== null) {
      const idx = match.index;
      const citationNum = parseInt(match[1], 10);
      
      console.log(`Found citation: [${citationNum}]`);
      
      // Add text before citation
      if (idx > lastIndex) {
        segments.push({ text: line.slice(lastIndex, idx), isCitation: false, originalText: line.slice(lastIndex, idx) });
      }
      
      // Add citation
      segments.push({ text: match[0], isCitation: true, citationNum, originalText: match[0] });
      
      lastIndex = idx + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < line.length) {
      segments.push({ text: line.slice(lastIndex), isCitation: false, originalText: line.slice(lastIndex) });
    }
    
    console.log('Processed segments:', segments);
    
    // Process each text segment
    const parts: React.ReactNode[] = [];
    let key = startKey;
    
    segments.forEach(segment => {
      if (segment.isCitation && segment.citationNum !== undefined) {
        // Render citations as clickable buttons
        console.log(`Creating citation button for: ${segment.citationNum}`);
        
        // Adjust citation number to be within bounds
        const citationIndex = Math.min(Math.max(0, (segment.citationNum as number) - 1), results.length > 0 ? results.length - 1 : 0);
        
        parts.push(
          <button
            key={`citation-${key++}`}
            className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 mx-0.5 text-xs font-semibold rounded bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-800/30 dark:text-blue-400 dark:hover:bg-blue-800/50 cursor-pointer transition-colors"
            onClick={() => {
              // Only try to scroll if we have results
              if (results.length > 0) {
                const ref = sourceRefs.current[citationIndex];
                if (ref) {
                  // Highlight the source
                  ref.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  ref.classList.add('ring-2', 'ring-blue-400');
                  setTimeout(() => ref.classList.remove('ring-2', 'ring-blue-400'), 1200);
                  
                  // If the result has a URL, open it in a new tab
                  const result = results[citationIndex];
                  if (result && result.url) {
                    window.open(result.url, '_blank', 'noopener,noreferrer');
                  }
                }
              }
            }}
            title="Click to view source"
          >
            {segment.citationNum}
          </button>
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
      {searchQuery && !hideQueryHeader && (
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <div className="w-1 h-5 bg-purple-500 rounded-full mr-3"></div>
            <h3 className={`${getFontSizeClass('header')} font-medium text-gray-800 dark:text-gray-300`}>
              Search Results for
            </h3>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <p className={`${getFontSizeClass('text')} font-medium text-gray-900 dark:text-gray-100 break-words`}>
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
              <div className={`${getFontSizeClass('text')} leading-relaxed text-gray-800 dark:text-gray-200`}>
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
            <h3 className={`${getFontSizeClass('header')} font-medium text-gray-800 dark:text-gray-300`}>
              Sources
            </h3>
            <div className={`ml-auto ${getFontSizeClass('small')} text-gray-500 dark:text-gray-400`}>
              {results.length} {results.length === 1 ? 'source' : 'sources'} found
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {results.map((result, index) => (
              <div
                key={index}
                ref={setSourceRef(index)}
                className="transition-all group"
              >
                <a 
                  href={result.url}
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center h-[72px] p-3 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group-hover:border-blue-300 dark:group-hover:border-blue-700 group-hover:shadow-md"
                >
                  {/* Content area */}
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <div className="flex items-center gap-1 mb-1">
                      {/* Citation-style number badge */}
                      <span className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 text-xs font-semibold rounded bg-blue-100 text-blue-800 group-hover:bg-blue-200 dark:bg-blue-800/30 dark:text-blue-400 dark:group-hover:bg-blue-800/50 transition-colors flex-shrink-0">
                        {index + 1}
                      </span>
                      <div className={`${getFontSizeClass('title')} font-medium text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate`}>
                        {result.title}
                      </div>
                    </div>
                    <div className={`${getFontSizeClass('small')} text-gray-500 dark:text-gray-400 truncate ml-6`}>
                      {result.displayUrl}
                    </div>
                  </div>
                  
                  {/* Website favicon on the right */}
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center ml-3">
                    <img
                      src={getFaviconUrl(result.url)}
                      alt={`${result.title} favicon`}
                      className="w-6 h-6 rounded-sm"
                      onError={(e) => {
                        // Fallback to a generic icon if favicon fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    {/* Fallback icon */}
                    <div className="hidden w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-sm flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                      </svg>
                    </div>
                  </div>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 