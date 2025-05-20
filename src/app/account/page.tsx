"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import SearchBar from "@/components/SearchBar";
import { SearchResult } from "@/lib/types";
import Link from "next/link";

export default function AccountPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [answer, setAnswer] = useState<string>("");
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingSummary, setStreamingSummary] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  
  // Check authentication on mount and restore saved search state
  useEffect(() => {
    const checkAuth = () => {
      const isLoggedIn = localStorage.getItem("steerLoggedIn") === "true";
      const email = localStorage.getItem("steerUserEmail");
      
      if (!isLoggedIn || !email) {
        router.push("/");
        return;
      }
      
      setUserEmail(email);
      
      // Restore previous search state from localStorage if available
      try {
        const savedQuery = localStorage.getItem("steerLastQuery");
        const savedResults = localStorage.getItem("steerLastResults");
        const savedAnswer = localStorage.getItem("steerLastAnswer");
        
        if (savedQuery) {
          setSearchQuery(savedQuery);
          setHasSearched(true);
        }
        
        if (savedResults) {
          setSearchResults(JSON.parse(savedResults));
        }
        
        if (savedAnswer) {
          setAnswer(savedAnswer);
        }
      } catch (error) {
        console.error("Error restoring search state:", error);
      }
      
      setIsLoading(false);
    };
    
    // Short delay to ensure localStorage is available (client-side)
    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [router]);

  // Clean up the abort controller when component unmounts
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);
  
  // Scroll to results when they become available
  useEffect(() => {
    if (searchResults.length > 0 && !isSearching && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [searchResults, isSearching]);
  
  // Save search state to localStorage when it changes
  useEffect(() => {
    if (searchQuery) {
      localStorage.setItem("steerLastQuery", searchQuery);
    }
    
    if (searchResults.length > 0) {
      localStorage.setItem("steerLastResults", JSON.stringify(searchResults));
    }
    
    if (answer) {
      localStorage.setItem("steerLastAnswer", answer);
    }
  }, [searchQuery, searchResults, answer]);

  const handleSearch = async (query: string) => {
    // Abort any in-progress request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create a new AbortController
    abortControllerRef.current = new AbortController();
    
    // Keep track of the search query
    setSearchQuery(query);
    
    setIsSearching(true);
    setIsStreaming(true);
    setStreamingSummary('');
    setError(null);
    
    // Only clear the previous results when starting a new search
    setAnswer('');
    setSearchResults([]);
    setSuggestedQuestions([]);
    setHasSearched(true);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query,
          userContext: {
            email: userEmail
          },
          streaming: true
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get stream reader');
      }
      
      // Set up streaming
      const decoder = new TextDecoder();
      let fullSummary = '';
      
      // Process the stream
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        // Convert the chunk to text
        const chunkText = decoder.decode(value, { stream: true });
        
        // Process each line (each line is a JSON object)
        const lines = chunkText.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          try {
            // Skip empty lines or malformed JSON
            if (!line || line.trim() === '') continue;
            
            // Safely parse JSON with extra validation
            let data;
            try {
              data = JSON.parse(line);
            } catch (parseError) {
              console.error('JSON parse error:', parseError, 'on line:', line);
              continue; // Skip this line and continue with the next one
            }
            
            // Skip if data isn't properly structured
            if (!data || typeof data !== 'object') continue;
            
            if (data.type === 'results' && data.data && data.data.results) {
              // Update search results when we get them
              setSearchResults(data.data.results);
              setIsSearching(false); // We got initial results, just streaming now
            } else if (data.type === 'chunk' && data.data) {
              // Incrementally update the answer as chunks arrive
              fullSummary += data.data;
              setStreamingSummary(fullSummary);
            } else if (data.type === 'error') {
              throw new Error(data.data || 'Unknown error');
            } else if (data.type === 'complete') {
              // Final data with suggested questions and full summary
              const completeData = JSON.parse(data.data);
              setAnswer(completeData.combinedSummary || fullSummary);
              setSuggestedQuestions(completeData.suggestedQuestions || []);
              setIsStreaming(false);
            }
          } catch (e) {
            console.error('Error processing stream chunk:', e);
            // Don't rethrow - just log and continue
          }
        }
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        console.log('Search request aborted');
      } else {
        setError('Failed to perform search. Please try again.');
        console.error('Search error:', err);
      }
    } finally {
      setIsSearching(false);
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  // Format streaming summary into paragraphs and lists for better readability
  const formatStreamingSummary = (text: string) => {
    if (!text) return null;

    // Function to process text and return properly formatted JSX
    const processText = (text: string) => {
      // Split by double newlines to get paragraphs
      return text.split(/\n\n+/).map((paragraph, i) => {
        // Check if paragraph starts with # for headings (markdown style)
        if (paragraph.trim().startsWith('#')) {
          const level = paragraph.trim().match(/^#+/)?.[0].length || 1;
          const headingText = paragraph.trim().replace(/^#+\s*/, '');
          const headingClasses = level === 1 
            ? "font-bold text-2xl mt-5 mb-3" 
            : "font-semibold text-xl mt-4 mb-3";
          return <h3 key={i} className={headingClasses}>{headingText}</h3>;
        }
        
        // Handle bullet list paragraphs (both • and - style bullets)
        const isBulletList = paragraph.trim().split('\n').some(line => 
          line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*')
        );
        
        if (isBulletList) {
          const listItems = paragraph.split('\n')
            .map(line => line.trim())
            .filter(Boolean);
          
          return (
            <ul key={i} className="list-disc pl-8 my-3">
              {listItems.map((item, j) => {
                // Clean up bullet points (handles •, -, and *)
                const cleanItem = item.replace(/^[•\-*]\s*/, '');
                // Make question items bold
                if (cleanItem.trim().endsWith('?')) {
                  return <li key={j} className="my-2 text-base font-semibold leading-relaxed">{cleanItem}</li>;
                }
                return <li key={j} className="my-2 text-base leading-relaxed">{cleanItem}</li>;
              })}
            </ul>
          );
        } 
        
        // Check if paragraph is a question but not a heading
        if (paragraph.trim().endsWith('?')) {
          return <p key={i} className="my-3 text-base font-semibold leading-relaxed">{paragraph}</p>;
        }
        
        // Check if this is a heading (short text that doesn't end with punctuation)
        const isHeading = paragraph.length < 100 && 
                         !paragraph.endsWith('.') && 
                         !paragraph.endsWith('!') && 
                         !paragraph.endsWith('?') &&
                         !paragraph.includes('•') &&
                         !paragraph.includes('-') &&
                         !paragraph.includes('*');
        
        if (isHeading) {
          return <h3 key={i} className="font-semibold text-xl mt-4 mb-3">{paragraph}</h3>;
        }
        
        // Regular paragraph
        return <p key={i} className="my-3 text-base leading-relaxed">{paragraph}</p>;
      });
    };

    return <div className="text-base">{processText(text)}</div>;
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header with user info */}
      <nav className="w-full bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/">
                  <span className="text-2xl font-semibold text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded transition" style={{ fontFamily: "Times New Roman, Times, serif" }}>
                    steer
                  </span>
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-600 dark:text-gray-300 mr-4">
                Logged in as <span className="font-semibold">{userEmail}</span>
              </span>
              <button
                onClick={() => {
                  localStorage.removeItem("steerLoggedIn");
                  localStorage.removeItem("steerUserEmail");
                  router.push("/");
                }}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main content */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center mb-8">Search with Steer</h1>
          
          {/* Search interface */}
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8">
            <SearchBar 
              onSearch={handleSearch} 
              initialQuery={searchQuery}
              isConversationMode={true}
              disabled={isSearching}
            />
          </div>
        </div>
        
        {/* Error display */}
        {error && (
          <div className="mb-8">
            <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-4 rounded-lg shadow">
              <p>{error}</p>
            </div>
          </div>
        )}
        
        {/* Loading state */}
        {isSearching && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        {/* Search results container - preserved with ref for scrolling */}
        <div ref={resultsRef}>
          {/* Search results */}
          {searchResults.length > 0 && (
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8">
              <div className="prose dark:prose-dark max-w-none">
                {/* Display streaming or final answer */}
                {isStreaming ? (
                  <div>
                    {formatStreamingSummary(streamingSummary)}
                    <span className="inline-block ml-1 animate-pulse">▎</span>
                  </div>
                ) : (
                  <>
                    {answer && formatStreamingSummary(answer)}
                  </>
                )}
              </div>
              
              {/* Source citations */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Sources</h3>
                <div className="grid grid-cols-1 gap-4">
                  {searchResults.map((result, index) => (
                    <div key={index} className="flex items-start">
                      <div className="w-6 h-6 flex items-center justify-center bg-blue-100 dark:bg-blue-900 rounded-full text-blue-800 dark:text-blue-200 text-xs font-medium mr-3 flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <a 
                          href={result.url}
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                        >
                          {result.title}
                        </a>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{result.displayUrl}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* No results state - only show if a search was performed */}
          {hasSearched && searchResults.length === 0 && !isSearching && !error && (
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">No results found. Try another search query.</p>
            </div>
          )}
          
          {/* Suggested questions */}
          {suggestedQuestions.length > 0 && (
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Related Questions</h3>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(question)}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full text-sm text-gray-800 dark:text-gray-200 transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 