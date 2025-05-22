"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import SearchBar from "@/components/SearchBar";
import SearchResults from "@/components/SearchResults";
import { SearchResult } from "@/lib/types";
import Link from "next/link";
import ProfileModal from '@/components/ProfileModal';
import QuickInputModal from '@/components/QuickInputModal';

export default function AccountPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [answer, setAnswer] = useState<string>("");
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchCount, setSearchCount] = useState<number>(0);
  const [searchLimitReached, setSearchLimitReached] = useState<boolean>(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [showQuickInput, setShowQuickInput] = useState(false);
  const [quickInputPosition, setQuickInputPosition] = useState<{ x: number, y: number }>({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [hasSearched, setHasSearched] = useState(false);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const MAX_SEARCHES = 5;
  const remainingSearches = MAX_SEARCHES - searchCount;
  
  // Check authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      const isLoggedIn = localStorage.getItem("steerLoggedIn") === "true";
      const email = localStorage.getItem("steerUserEmail");
      
      if (!isLoggedIn || !email) {
        router.push("/");
        return;
      }
      
      setUserEmail(email);
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
  
  // Check profile flag on mount
  useEffect(() => {
    if (!userEmail) return;
    let cancelled = false;
    fetch('/api/check-profile-flag', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail }),
    })
      .then(res => res.json())
      .then(data => {
        if (!cancelled) {
          // Only show the modal if flag is explicitly false or missing
          setShowProfileModal(data.flag !== true);
        }
      });
    return () => { cancelled = true; };
  }, [userEmail]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ctrl+I
      if (e.ctrlKey && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        setQuickInputPosition({ x: window.mouseX || window.innerWidth / 2, y: window.mouseY || window.innerHeight / 2 });
        setShowQuickInput(true);
      }
    };
    // Track mouse position globally
    const mouseMove = (e: MouseEvent) => {
      window.mouseX = e.clientX;
      window.mouseY = e.clientY;
    };
    window.addEventListener('keydown', handler);
    window.addEventListener('mousemove', mouseMove);
    return () => {
      window.removeEventListener('keydown', handler);
      window.removeEventListener('mousemove', mouseMove);
    };
  }, []);

  const handleSearch = async (query: string) => {
    if (searchLimitReached || searchCount >= MAX_SEARCHES) {
      setError("You have reached the maximum number of searches. Please try again later.");
      setSearchLimitReached(true);
      return;
    }

    // Set hasSearched to true when a search is performed
    setHasSearched(true);

    // Abort any in-progress request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create a new AbortController
    abortControllerRef.current = new AbortController();
    
    setSearchQuery(query);
    setIsSearching(true);
    setError(null);

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
          }
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      // Check if the response is a stream
      if (response.headers.get('Content-Type')?.includes('text/event-stream')) {
        // Handle streaming response
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('Failed to get stream reader');
        }

        // Set loading to false, we'll show the incremental results
        setIsSearching(false);
        
        // For collecting the streamed answer
        let fullAnswer = '';
        
        // Process the stream
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          // Convert the chunk to text
          const chunkText = new TextDecoder().decode(value);
          
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
              } else if (data.type === 'chunk' && data.data) {
                // Incrementally update the answer as chunks arrive
                fullAnswer += data.data;
                setAnswer(fullAnswer);
              } else if (data.type === 'error') {
                throw new Error(data.data || 'Unknown error');
              }
            } catch (e) {
              console.error('Error processing stream chunk:', e);
              // Don't rethrow - just log and continue
            }
          }
        }
        
        // Increment search count and check if limit is reached
        const newSearchCount = searchCount + 1;
        setSearchCount(newSearchCount);
        if (newSearchCount >= MAX_SEARCHES) {
          setSearchLimitReached(true);
        }
      } else {
        // Fallback to non-streaming response (for backward compatibility)
        const data = await response.json();
        setSearchResults(data.results);
        setAnswer(data.answer);
        
        // Increment search count and check if limit is reached
        const newSearchCount = searchCount + 1;
        setSearchCount(newSearchCount);
        if (newSearchCount >= MAX_SEARCHES) {
          setSearchLimitReached(true);
        }
        
        setIsSearching(false);
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
      abortControllerRef.current = null;
    }
  };

  const handleProfileSubmit = async (data: any) => {
    setProfileLoading(true);
    try {
      const inviteCode = localStorage.getItem('steerInviteCode');
      const res = await fetch('/api/save-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, inviteCode, ...data }),
      });
      if (res.ok) {
        // Automatically generate tailored prompt after saving profile
        await fetch('/api/generate-tailored-prompt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userEmail }),
        });
        setShowProfileModal(false);
      }
    } finally {
      setProfileLoading(false);
    }
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header with user info */}
      <nav className="w-full flex items-center justify-between px-8 py-4 bg-white dark:bg-gray-800" style={{ borderBottom: "none" }}>
        <div className="flex items-center">
          <Link href="/">
            <span className="text-2xl font-semibold text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded transition" style={{ fontFamily: "Times New Roman, Times, serif" }}>
              steer
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Logged in as <span className="font-semibold">{userEmail}</span>
          </span>
          <button
            onClick={() => {
              localStorage.removeItem("steerLoggedIn");
              localStorage.removeItem("steerUserEmail");
              router.push("/");
            }}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            Logout
          </button>
        </div>
      </nav>
      
      <div className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Main content */}
        
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
        
        {/* Center search box when no search has been performed */}
        {!hasSearched && (
          <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center">
            <h1 className="text-5xl font-bold mb-12 text-gray-800 dark:text-gray-100" style={{ fontFamily: "Times New Roman, Times, serif" }}>
              steer
            </h1>
            <div className="w-full max-w-2xl">
              <SearchBar 
                onSearch={handleSearch} 
                initialQuery=""
                isConversationMode={true}
                centered={true}
                disabled={isSearching || searchLimitReached}
              />
            </div>
          </div>
        )}
        
        {/* Search results container - only shown after search */}
        {hasSearched && (
          <div ref={resultsRef} className="flex-1">
            {/* Search results */}
            {searchResults.length > 0 && (
              <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8">
                <SearchResults 
                  results={searchResults}
                  answer={answer}
                  searchQuery={searchQuery}
                />
              </div>
            )}
            
            {/* No results state - only show if a search was performed */}
            {searchQuery && searchResults.length === 0 && !isSearching && !error && (
              <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">No results found. Try another search query.</p>
              </div>
            )}
          </div>
        )}

        {/* Search bar at the bottom - only shown after search */}
        {hasSearched && (
          <div className="fixed bottom-0 left-0 right-0 flex justify-center items-end pointer-events-none" style={{zIndex: 50}}>
            <div className="w-full max-w-2xl px-4 pb-6 pointer-events-auto">
              <SearchBar 
                onSearch={handleSearch} 
                initialQuery={searchQuery}
                isConversationMode={true}
                disabled={isSearching || searchLimitReached}
              />
              {searchLimitReached && (
                <div className="mt-2 text-center text-red-600 text-sm">
                  You've reached the maximum of {MAX_SEARCHES} searches. Please try again later.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Profile Modal */}
        {showProfileModal && (
          <ProfileModal
            onSubmit={handleProfileSubmit}
            loading={profileLoading}
          />
        )}

        {showQuickInput && (
          <QuickInputModal onClose={() => setShowQuickInput(false)} position={quickInputPosition} userEmail={userEmail} lastQuery={searchQuery} lastAnswer={answer} />
        )}
      </div>
    </div>
  );
} 