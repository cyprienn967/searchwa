'use client';

import { FormEvent, useState, useEffect, useRef } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  initialQuery?: string;
  isConversationMode?: boolean;
  disabled?: boolean;
  centered?: boolean;
}

export default function SearchBar({ 
  onSearch, 
  initialQuery = '', 
  isConversationMode = false,
  disabled = false,
  centered = false
}: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const initializedRef = useRef(false);
  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check if Speech Recognition is supported
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      setIsSupported(!!SpeechRecognition);
      
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setQuery(transcript);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Only set the query from initialQuery on first render
  useEffect(() => {
    if (!initializedRef.current) {
      setQuery(initialQuery);
      initializedRef.current = true;
    }
  }, [initialQuery]);

  // Auto-resize textarea (only for main search bar)
  useEffect(() => {
    if (!isConversationMode && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const minHeight = centered ? 96 : 80; // min-h-24 or min-h-20
      const maxHeight = 200; // max height before scrolling
      textareaRef.current.style.height = `${Math.min(Math.max(scrollHeight, minHeight), maxHeight)}px`;
    }
  }, [query, centered, isConversationMode]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim() && !disabled) {
      onSearch(query.trim());
    }
  };

  const toggleVoiceRecording = () => {
    if (!isSupported || disabled) return;

    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  // Render compact follow-up search bar
  if (isConversationMode) {
    return (
      <div className="w-full">
        <form onSubmit={handleSubmit} className="search-container conversation flex justify-center">
          <div className="relative w-full rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="relative">
              {/* Placeholder text for follow-up */}
              {!query && !disabled && (
                <div className="absolute top-3 left-12 text-gray-400 pointer-events-none text-base">
                  {isListening ? 'Listening...' : 'Ask a follow-up...'}
                </div>
              )}
              
              {/* Microphone button - left side */}
              {isSupported && (
                <button
                  type="button"
                  onClick={toggleVoiceRecording}
                  className={`absolute left-2 top-1/2 -translate-y-1/2 flex items-center justify-center h-8 w-8 rounded-full transition-all duration-200 ${
                    disabled 
                      ? 'opacity-50 cursor-not-allowed' 
                      : isListening 
                        ? 'text-red-500 bg-red-50 dark:bg-red-900/20 animate-pulse' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800'
                  }`}
                  aria-label={isListening ? "Stop recording" : "Start voice recording"}
                  disabled={disabled}
                  title={isListening ? "Click to stop recording" : "Click to start voice recording"}
                >
                  <MicrophoneIcon isListening={isListening} />
                </button>
              )}
              
              {/* Compact input field */}
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className={`
                  w-full h-12 rounded-xl border-none outline-none bg-transparent
                  ${isSupported ? 'pl-12' : 'pl-4'} pr-12 text-base
                  ${disabled 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-gray-900 dark:text-gray-100'
                  }
                  focus:outline-none focus:ring-0
                `}
                placeholder=""
                disabled={disabled}
                aria-label="Search"
                style={{ 
                  fontFamily: 'Inter, sans-serif',
                  paddingTop: '0.875rem',
                  paddingBottom: '0.875rem'
                }}
              />

              {/* Search button - right side */}
              <button
                type="submit"
                className={`absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center h-8 w-8 rounded-full transition-all duration-200 ${
                  disabled 
                    ? 'opacity-50 cursor-not-allowed' 
                    : query.trim()
                      ? 'text-white bg-blue-600 hover:bg-blue-700'
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                aria-label="Search"
                disabled={disabled || !query.trim()}
                title={query.trim() ? "Search" : "Enter a query to search"}
              >
                <SearchIcon />
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  // Render Perplexity-style main search bar
  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="search-container flex justify-center">
        <div className="relative w-full rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="relative">
            {/* Placeholder text - positioned at top-left when empty */}
            {!query && !disabled && (
              <div className={`absolute top-4 left-4 text-gray-400 pointer-events-none ${centered ? 'text-lg' : 'text-base'} leading-relaxed`}>
                {isListening ? 'Listening...' : 'Ask anything...'}
              </div>
            )}
            
            {/* Main textarea */}
            <textarea
              ref={textareaRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className={`
                w-full resize-none border-none outline-none bg-transparent
                ${centered ? 'min-h-24 text-lg' : 'min-h-20 text-base'}
                pt-4 pb-12 px-4 leading-relaxed
                ${disabled 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-gray-900 dark:text-gray-100'
                }
                placeholder-transparent
              `}
              placeholder=""
              disabled={disabled}
              aria-label="Search"
              style={{ 
                fontFamily: 'Inter, sans-serif',
                lineHeight: '1.6'
              }}
            />

            {/* Bottom buttons container */}
            <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
              {/* Microphone button - bottom left */}
              {isSupported && (
                <button
                  type="button"
                  onClick={toggleVoiceRecording}
                  className={`flex items-center justify-center h-8 w-8 rounded-full transition-all duration-200 ${
                    disabled 
                      ? 'opacity-50 cursor-not-allowed' 
                      : isListening 
                        ? 'text-red-500 bg-red-50 dark:bg-red-900/20 animate-pulse' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800'
                  }`}
                  aria-label={isListening ? "Stop recording" : "Start voice recording"}
                  disabled={disabled}
                  title={isListening ? "Click to stop recording" : "Click to start voice recording"}
                >
                  <MicrophoneIcon isListening={isListening} />
                </button>
              )}

              {/* Spacer for when microphone is not supported */}
              {!isSupported && <div className="h-8 w-8" />}

              {/* Search button - bottom right */}
              <button
                type="submit"
                className={`flex items-center justify-center h-8 w-8 rounded-full transition-all duration-200 ${
                  disabled 
                    ? 'opacity-50 cursor-not-allowed' 
                    : query.trim()
                      ? 'text-white bg-blue-600 hover:bg-blue-700'
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                aria-label="Search"
                disabled={disabled || !query.trim()}
                title={query.trim() ? "Search" : "Enter a query to search"}
              >
                <SearchIcon />
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

function MicrophoneIcon({ isListening }: { isListening: boolean }) {
  if (isListening) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        viewBox="0 0 24 24"
        className="w-4 h-4"
      >
        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
        <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
      </svg>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className="w-4 h-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 1a4 4 0 014 4v6a4 4 0 01-8 0V5a4 4 0 014-4zM19 10v1a7 7 0 01-14 0v-1m7 12v-2"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className="w-4 h-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
      />
    </svg>
  );
} 