"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import SearchBar from "@/components/SearchBar";
import SearchResults from "@/components/SearchResults";
import { SearchResult } from "@/lib/types";
import Link from "next/link";
import ProfileModal from '@/components/ProfileModal';
import QuickInputModal from '@/components/QuickInputModal';
import { use } from "react";
import { getUserById } from "@/lib/redis";

type UserPageProps = {
  params: {
    username: string // This is now actually the user ID, not username
  }
}

export default function UserPage({ params }: UserPageProps) {
  const router = useRouter();
  
  // Use React.use to properly extract the user ID parameter
  const userId = use(params).username;
  
  const [userEmail, setUserEmail] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [userLocation, setUserLocation] = useState<string>("");
  const [userAge, setUserAge] = useState<string>("");
  const [userAbout, setUserAbout] = useState<string>("");
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
  const [quickInputPosition, setQuickInputPosition] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const MAX_SEARCHES = 5;
  const remainingSearches = MAX_SEARCHES - searchCount;
  
  // Check authentication on mount and restore saved search state
  useEffect(() => {
    const checkAuth = () => {
      try {
        if (typeof window === 'undefined') {
          setIsLoading(false);
          return;
        }

        const isLoggedIn = localStorage.getItem("steerLoggedIn") === "true";
        const email = localStorage.getItem("steerUserEmail");
        
        if (!isLoggedIn || !email) {
          router.push("/");
          return;
        }
        
        // Fetch user data by ID
        fetch(`/api/user/${userId}`)
          .then(response => {
            if (!response.ok) {
              throw new Error('User not found');
            }
            return response.json();
          })
          .then(userData => {
            if (!userData.success || !userData.user) {
              throw new Error('Invalid user data');
            }
            
            // Check if the logged-in user can access this page
            if (userData.user.email !== email) {
              console.error('Unauthorized: User does not match logged-in user');
              router.push(`/account`); // Redirect to their own account page
              return;
            }
            
            // Set user data
            setUserEmail(userData.user.email);
            setUserName(userData.user.name || '');
            setUserAge(userData.user.age || '');
            setUserLocation(userData.user.location || '');
            setUserAbout(userData.user.about || '');
            
            // Restore previous search state from localStorage if available, but only for this user
            try {
              const savedQuery = localStorage.getItem(`steerLastQuery:${email}`);
              const savedResults = localStorage.getItem(`steerLastResults:${email}`);
              const savedAnswer = localStorage.getItem(`steerLastAnswer:${email}`);
              
              if (savedQuery) setSearchQuery(savedQuery);
              if (savedResults) setSearchResults(JSON.parse(savedResults));
              if (savedAnswer) setAnswer(savedAnswer);
            } catch (error) {
              console.error("Error restoring search state:", error);
              setSearchQuery("");
              setSearchResults([]);
              setAnswer("");
            }
          })
          .catch(error => {
            console.error("Error fetching user data:", error);
            router.push('/');
          })
          .finally(() => {
            setIsLoading(false);
          });
      } catch (error) {
        console.error("Error checking authentication:", error);
        setIsLoading(false);
      }
    };
    
    // Short delay to ensure localStorage is available (client-side)
    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [router, userId]);

  // Clean up the abort controller when component unmounts
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Track mouse position for quick input
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (window.innerHeight - e.clientY < 150 && e.clientX > window.innerWidth / 2) {
        setQuickInputPosition({
          x: Math.min(e.clientX, window.innerWidth - 300),
          y: Math.min(e.clientY, window.innerHeight - 100)
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt+S or Option+S to focus search
      if ((e.altKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        const searchInput = document.querySelector('.search-input') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
      
      // Ctrl+I to show quick input (feedback window)
      // Check both by key and keyCode for better cross-browser support
      // KeyCode 73 is for 'i'
      if (e.ctrlKey && (e.key === 'i' || e.keyCode === 73)) {
        console.log('Ctrl+I detected, opening feedback window');
        e.preventDefault();
        e.stopPropagation(); // Stop event propagation
        setShowQuickInput(true);
      }
    };

    // Add the event listener to document for better capture
    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, []);

  const handleSearch = async (query: string) => {
    if (isSearching) return;
    
    if (searchLimitReached) {
      setError("You've reached your search limit for today. Please try again tomorrow.");
      return;
    }

    setSearchQuery(query);
    setIsSearching(true);
    setError(null);
    setAnswer("");
    
    // Save query to localStorage
    localStorage.setItem(`steerLastQuery:${userEmail}`, query);
    
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create a new abort controller for this request
    abortControllerRef.current = new AbortController();
    
    try {
      // First, get search results
      const resultsResponse = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': userEmail
        },
        body: JSON.stringify({ query, userContext: { email: userEmail } }),
        signal: abortControllerRef.current.signal
      });
      
      if (!resultsResponse.ok) {
        const errorText = await resultsResponse.text();
        throw new Error(`Error fetching search results: ${errorText}`);
      }
      
      // Handle streaming response
      const reader = resultsResponse.body?.getReader();
      if (!reader) {
        throw new Error("Failed to get stream reader");
      }

      let fullAnswer = '';
      
      // Process the stream
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        // Convert the Uint8Array to a string
        const chunk = new TextDecoder().decode(value);
        
        // Split by newlines to get individual JSON objects
        const lines = chunk.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            
            if (data.type === 'results') {
              // Handle search results
              setSearchResults(data.data.results || []);
              localStorage.setItem(`steerLastResults:${userEmail}`, JSON.stringify(data.data.results || []));
            } else if (data.type === 'chunk') {
              // Handle answer chunks
              fullAnswer += data.data;
              setAnswer(fullAnswer);
              localStorage.setItem(`steerLastAnswer:${userEmail}`, fullAnswer);
            } else if (data.type === 'error') {
              throw new Error(data.data || 'Unknown error');
            }
          } catch (parseError) {
            console.error('Error parsing JSON chunk:', parseError, line);
          }
        }
      }
      
      // Update search count
      setSearchCount(prevCount => {
        const newCount = prevCount + 1;
        if (newCount >= MAX_SEARCHES) {
          setSearchLimitReached(true);
        }
        return newCount;
      });
      
      // Scroll to results
      if (resultsRef.current) {
        window.scrollTo({
          top: resultsRef.current.offsetTop - 100,
          behavior: 'smooth'
        });
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Search request aborted');
        return;
      }
      
      console.error('Search error:', error);
      setError(`Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setAnswer("");
    setError(null);
    
    // Clear saved search from localStorage
    localStorage.removeItem(`steerLastQuery:${userEmail}`);
    localStorage.removeItem(`steerLastResults:${userEmail}`);
    localStorage.removeItem(`steerLastAnswer:${userEmail}`);
  };

  const handleSaveProfile = async (profileData: any) => {
    setProfileLoading(true);
    
    try {
      // First save the profile
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': userEmail
        },
        body: JSON.stringify(profileData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to save profile');
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Unknown error');
      }

      // After successful profile save, generate tailored prompt
      const promptRes = await fetch('/api/generate-tailored-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          about: profileData.about,
          age: profileData.age,
          location: profileData.location
        }),
      });

      if (!promptRes.ok) {
        console.error('Failed to generate prompt:', await promptRes.text());
        // Don't throw error here as profile was saved successfully
      }
      
      // Update local state with the new profile data
      setUserName(profileData.name || '');
      setUserAge(profileData.age || '');
      setUserLocation(profileData.location || '');
      setUserAbout(profileData.about || '');
      
      setShowProfileModal(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setProfileLoading(false);
    }
  };

  // Function to show the feedback window
  const openFeedbackWindow = () => {
    console.log('Opening feedback window');
    setShowQuickInput(true);
  };

  // Add a global keyboard event handler that works outside of React lifecycle
  useEffect(() => {
    // Define the handler function for Ctrl+I
    function globalKeyHandler(e: KeyboardEvent) {
      if (e.ctrlKey && (e.key === 'i' || e.keyCode === 73)) {
        console.log('Global Ctrl+I detected');
        e.preventDefault();
        e.stopPropagation();
        openFeedbackWindow();
        return false;
      }
    }

    // Add the event listener to the document
    document.addEventListener('keydown', globalKeyHandler, true);

    // Clean up
    return () => {
      document.removeEventListener('keydown', globalKeyHandler, true);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <SearchBar 
        onSearch={handleSearch}
        onClear={handleClearSearch}
        initialQuery={searchQuery}
        isSearching={isSearching}
        disabled={isSearching || searchLimitReached}
        remainingSearches={remainingSearches}
      />
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <div ref={resultsRef}>
        {(searchResults.length > 0 || answer) && (
          <SearchResults 
            results={searchResults} 
            answer={answer}
            query={searchQuery}
          />
        )}
      </div>
      
      {/* Profile Modal */}
      <ProfileModal
        onSubmit={handleSaveProfile}
        onClose={() => setShowProfileModal(false)}
        loading={profileLoading}
        userEmail={userEmail}
        inviteCode={localStorage.getItem('steerInviteCode') || ''}
      />
      
      {/* Quick Input Modal */}
      <QuickInputModal
        isOpen={showQuickInput}
        onClose={() => setShowQuickInput(false)}
        onSearch={handleSearch}
        position={quickInputPosition}
        userEmail={userEmail}
        lastQuery={searchQuery}
        lastAnswer={answer}
      />
    </div>
  );
} 