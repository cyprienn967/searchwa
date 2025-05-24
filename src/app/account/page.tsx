"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import SearchBar from "@/components/SearchBar";
import SearchResults from "@/components/SearchResults";
import { SearchResult } from "@/lib/types";
import Link from "next/link";
import ProfileModal from '@/components/ProfileModal';
import QuickInputModal from '@/components/QuickInputModal';
import TicketButton from '@/components/TicketButton';
import SettingsDropdown from '@/components/SettingsDropdown';

export default function AccountPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('lastSearchQuery') || "";
    }
    return "";
  });
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [answer, setAnswer] = useState<string>("");
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [showQuickInput, setShowQuickInput] = useState(false);
  const [quickInputPosition, setQuickInputPosition] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
  const [hasSearched, setHasSearched] = useState(false);
  const [globalFontSize, setGlobalFontSize] = useState<string>('text-base');
  
  // Add state to track all searches (simple array of search results)
  const [pastSearches, setPastSearches] = useState<Array<{
    query: string;
    results: SearchResult[];
    answer: string;
  }>>([]);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Initialize quickInputPosition after mount
  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      setQuickInputPosition({ 
        x: window.innerWidth / 2, 
        y: window.innerHeight / 2 
      });
    }
  }, []);

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
      
      // Fetch user data to get the name
      fetch('/api/get-user-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
        .then(res => res.json())
        .then(response => {
          if (response.success && response.data.name) {
            setUserName(response.data.name);
          }
          setIsLoading(false);
        })
        .catch(error => {
          console.error('Error fetching user data:', error);
          setIsLoading(false);
        });
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
    // Add mouseX and mouseY to Window interface
    interface WindowWithMouse extends Window {
      mouseX?: number;
      mouseY?: number;
    }
    
    const windowWithMouse = window as WindowWithMouse;
    
    const handler = (e: KeyboardEvent) => {
      // Ctrl+I
      if (e.ctrlKey && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        setQuickInputPosition({ 
          x: windowWithMouse.mouseX || window.innerWidth / 2, 
          y: windowWithMouse.mouseY || window.innerHeight / 2 
        });
        setShowQuickInput(true);
      }
    };
    // Track mouse position globally
    const mouseMove = (e: MouseEvent) => {
      windowWithMouse.mouseX = e.clientX;
      windowWithMouse.mouseY = e.clientY;
    };
    window.addEventListener('keydown', handler);
    window.addEventListener('mousemove', mouseMove);
    return () => {
      window.removeEventListener('keydown', handler);
      window.removeEventListener('mousemove', mouseMove);
    };
  }, []);

  // Add effect to persist search state
  useEffect(() => {
    if (searchQuery) {
      localStorage.setItem('lastSearchQuery', searchQuery);
    }
  }, [searchQuery]);

  useEffect(() => {
    localStorage.setItem('pastSearches', JSON.stringify(pastSearches));
  }, [pastSearches]);

  // Load font size from localStorage on mount
  useEffect(() => {
    const savedFontSize = localStorage.getItem('globalFontSize');
    if (savedFontSize) {
      setGlobalFontSize(savedFontSize);
    }
  }, []);

  const handleFontSizeChange = (size: string) => {
    setGlobalFontSize(size);
    localStorage.setItem('globalFontSize', size);
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    // If this is a search from the main search interface (centered search box), reset past searches
    if (!hasSearched || document.querySelector('.search-input.h-24')) {
      setPastSearches([]);
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

      // Save current results before starting a new search
      if (searchResults.length > 0 || answer) {
        setPastSearches(prev => [...prev, {
          query: searchQuery,
          results: searchResults,
          answer: answer
        }]);
      }

      // Reset current results for the new search
      setSearchResults([]);
      setAnswer('');

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

        // Scroll to the new results
        setTimeout(() => {
          bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
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
      
      // First save the profile
      const res = await fetch('/api/save-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: userEmail, 
          inviteCode, 
          name: data.name,
          age: data.age,
          location: data.location,
          about: data.about,
          interests: data.interests || [],
          feedback: data.feedback || [],
          flag: data.flag ?? false,
          prompt: data.prompt || ''
        }),
      });
      
      const responseData = await res.json();
      
      if (!res.ok || !responseData.success) {
        console.error('Failed to save profile:', responseData.error);
        return false;
      }

      // After successful profile save, generate tailored prompt
      const promptRes = await fetch('/api/generate-tailored-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          about: data.about,
          age: data.age,
          location: data.location
        }),
      });

      if (!promptRes.ok) {
        console.error('Failed to generate prompt:', await promptRes.text());
        // Don't return false here, as the profile was saved successfully
      }

      setShowProfileModal(false);
      return true;
    } catch (error) {
      console.error('Error saving profile:', error);
      return false;
    } finally {
      setProfileLoading(false);
    }
  };

  // Add a function to reset search state
  const resetSearch = () => {
    setHasSearched(false);
    setSearchQuery("");
    setSearchResults([]);
    setAnswer("");
    setPastSearches([]);
    // Clear from localStorage too
    localStorage.removeItem('lastSearchQuery');
    localStorage.removeItem('pastSearches');
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Helper function to get font size classes based on text type and global font size
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

  return (
    <main className="bg-gray-50 dark:bg-gray-900 flex flex-col min-h-screen overflow-x-hidden">
      {/* Header with user info */}
      <nav className="w-full flex items-center justify-between px-8 py-4 bg-white dark:bg-gray-800 sticky top-0 z-50" style={{ borderBottom: "none" }}>
        <div className="flex items-center">
          <Link href="/">
            <span className={`${getFontSizeClass('title')} font-semibold text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded transition`} style={{ fontFamily: "Times New Roman, Times, serif" }}>
              steer <span className={`ml-1 ${getFontSizeClass('small')} bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-200 px-2 py-0.5 rounded-md uppercase font-medium`}>beta</span>
            </span>
          </Link>
        </div>
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-1">
          <span className={`${getFontSizeClass('small')} text-gray-500 dark:text-gray-400`}>
            CTRL+I for feedback!
          </span>
          <button
            className="group relative inline-block"
            aria-label="Feedback information"
          >
            <svg 
              className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
            <div className="invisible group-hover:visible absolute left-1/2 -translate-x-1/2 top-full mt-2 w-64 p-2 bg-gray-600 text-white text-xs rounded shadow-lg z-50">
              Give feedback for steer's LLM to improve its responses to your queries.
              <div className="absolute left-1/2 -top-1 -translate-x-1/2 w-2 h-2 bg-gray-600 transform rotate-45"></div>
            </div>
          </button>
        </div>
        <div className="flex items-center gap-4">
          <span className={`${getFontSizeClass('small')} text-gray-600 dark:text-gray-300 font-semibold`}>
            {userName || userEmail}
          </span>
          <button
            onClick={() => {
              localStorage.removeItem("steerLoggedIn");
              localStorage.removeItem("steerUserEmail");
              localStorage.removeItem("globalFontSize");
              router.push("/");
            }}
            className={`inline-flex items-center px-3 py-1.5 border border-gray-300 ${getFontSizeClass('small')} font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700`}
          >
            Logout
          </button>
          <SettingsDropdown 
            currentFontSize={globalFontSize}
            onFontSizeChange={handleFontSizeChange}
          />
        </div>
      </nav>
      
      <div className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full relative">
        {/* Error display */}
        {error && (
          <div className="mb-8">
            <div className={`bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-4 rounded-lg shadow ${getFontSizeClass('text')}`}>
              <p>{error}</p>
            </div>
          </div>
        )}
        
        {/* Center search box when no search has been performed */}
        {!hasSearched && (
          <div className="flex flex-col items-center justify-center py-16">
            <h1 className={`${getFontSizeClass('header')} font-bold mb-12 text-gray-800 dark:text-gray-100`} style={{ fontFamily: "Times New Roman, Times, serif", fontSize: globalFontSize === 'text-xs' ? '2rem' : globalFontSize === 'text-sm' ? '2.5rem' : globalFontSize === 'text-base' ? '3rem' : globalFontSize === 'text-lg' ? '3.5rem' : globalFontSize === 'text-xl' ? '4rem' : '4.5rem' }}>
              search with steer
            </h1>
            <div className="w-full max-w-2xl">
              <div className="border-2 border-gray-300 dark:border-gray-600 shadow-md rounded-xl overflow-hidden">
                <SearchBar 
                  onSearch={handleSearch} 
                  initialQuery=""
                  isConversationMode={false}
                  centered={true}
                  disabled={isSearching}
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Search results container - only shown after search */}
        {hasSearched && (
          <div className="mb-20">
            {/* Display past searches */}
            {pastSearches.map((search, index) => (
              <div 
                key={index} 
                className="bg-white dark:bg-gray-800 p-6 pt-4 mx-auto max-w-4xl mb-6 border-b-4 border-gray-100 dark:border-gray-700 pb-6 relative rounded-lg"
              >
                <div className="sticky top-0 z-10 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm py-3 border-b border-gray-200 dark:border-gray-700 -mx-6 px-6 mb-6 shadow-sm">
                  <div className="flex items-center mb-2">
                    <button
                      onClick={resetSearch}
                      className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors mr-3"
                      title="New Search"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                    </button>
                    <div className="w-1 h-5 bg-purple-500 rounded-full mr-3"></div>
                    <h3 className={`${getFontSizeClass('header')} font-medium text-gray-800 dark:text-gray-300`}>
                      Search Results for
                    </h3>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <p className={`font-medium text-gray-900 dark:text-gray-100 break-words ${getFontSizeClass('text')}`}>
                      "{search.query}"
                    </p>
                  </div>
                </div>
                <div className="mt-6">
                  <SearchResults 
                    results={search.results}
                    answer={search.answer}
                    searchQuery={search.query}
                    hideQueryHeader={true}
                    globalFontSize={globalFontSize}
                  />
                </div>
              </div>
            ))}
            
            {/* Display current search results */}
            {(searchResults.length > 0 || answer) && (
              <div ref={resultsRef} className="bg-white dark:bg-gray-800 p-6 pt-4 mx-auto max-w-4xl mb-8 relative rounded-lg">
                <div className="sticky top-0 z-10 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm py-3 border-b border-gray-200 dark:border-gray-700 -mx-6 px-6 mb-6">
                  <div className="flex items-center mb-2">
                    <div className="w-1 h-5 bg-purple-500 rounded-full mr-3"></div>
                    <h3 className={`${getFontSizeClass('header')} font-medium text-gray-800 dark:text-gray-300`}>
                      Search Results for
                    </h3>
                    <div className="flex items-center gap-2 ml-auto">
                      <button
                        onClick={() => {
                          setQuickInputPosition({ 
                            x: window.innerWidth / 2, 
                            y: window.innerHeight / 2 
                          });
                          setShowQuickInput(true);
                        }}
                        className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title="Give Feedback"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                        </svg>
                      </button>
                      <button
                        onClick={resetSearch}
                        className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title="New Search"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <p className={`font-medium text-gray-900 dark:text-gray-100 break-words ${getFontSizeClass('text')}`}>
                      "{searchQuery}"
                    </p>
                  </div>
                </div>
                <div className="mt-6">
                  <SearchResults 
                    results={searchResults}
                    answer={answer}
                    searchQuery={searchQuery}
                    hideQueryHeader={true}
                    globalFontSize={globalFontSize}
                  />
                </div>
              </div>
            )}
            
            {/* Loading state */}
            {isSearching && (
              <div className="bg-white dark:bg-gray-800 p-6 pt-4 mx-auto max-w-4xl mb-8 rounded-lg">
                <div className="flex items-center mb-2">
                  <div className="w-1 h-5 bg-purple-500 rounded-full mr-3"></div>
                  <h3 className={`${getFontSizeClass('header')} font-medium text-gray-800 dark:text-gray-300`}>
                    Search Results for
                  </h3>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <p className={`font-medium text-gray-900 dark:text-gray-100 break-words ${getFontSizeClass('text')}`}>
                    "{searchQuery}"
                  </p>
                </div>
                <div className="mt-4 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              </div>
            )}
            
            {/* No results state - only show if a search was performed */}
            {pastSearches.length === 0 && searchResults.length === 0 && !answer && !isSearching && !error && (
              <div className={`bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8 text-center ${getFontSizeClass('text')}`}>
                <p className="text-gray-500 dark:text-gray-400">No results found. Try another search query.</p>
              </div>
            )}
          </div>
        )}

        {/* Just the search bar at the bottom - no padding, nothing around it */}
        {hasSearched && (
          <div className="fixed bottom-2 left-0 right-0 z-50 flex justify-center">
            <div className="w-full max-w-3xl mx-2">
              <div className="border-2 border-gray-300 dark:border-gray-600 shadow-md rounded-xl overflow-hidden bg-white dark:bg-gray-900">
                <SearchBar 
                  onSearch={handleSearch} 
                  initialQuery=""
                  isConversationMode={true}
                  disabled={isSearching}
                />
              </div>
            </div>
          </div>
        )}

        {/* Profile Modal */}
        {showProfileModal && (
          <ProfileModal
            onSubmit={handleProfileSubmit}
            onClose={() => setShowProfileModal(false)}
            loading={profileLoading}
            userEmail={userEmail}
            inviteCode={localStorage.getItem('steerInviteCode') || ''}
          />
        )}

        {showQuickInput && (
          <QuickInputModal 
            onClose={() => setShowQuickInput(false)} 
            position={quickInputPosition} 
            userEmail={userEmail} 
            lastQuery={searchQuery} 
            lastAnswer={answer}
            globalFontSize={globalFontSize}
          />
        )}
        
        {/* Feedback Ticket Button */}
        <TicketButton userEmail={userEmail} globalFontSize={globalFontSize} />
      </div>
    </main>
  );
} 