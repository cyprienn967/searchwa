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
  const initializedRef = useRef(false);

  // Only set the query from initialQuery on first render
  // This prevents the input from being cleared when the component re-renders
  useEffect(() => {
    if (!initializedRef.current) {
      setQuery(initialQuery);
      initializedRef.current = true;
    }
  }, [initialQuery]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim() && !disabled) {
      onSearch(query.trim());
      // Don't clear input after submitting so query remains visible
    }
  };

  return (
    <div className={`w-full ${isConversationMode ? '' : 'space-y-4'}`}>
      <form onSubmit={handleSubmit} className={`search-container ${isConversationMode ? 'conversation' : ''} flex justify-center`}>
        <div className={`relative w-full border border-gray-200 dark:border-gray-700 shadow-sm ${centered ? 'shadow-lg' : 'shadow-sm'} rounded-xl bg-white dark:bg-gray-900`}>
          <div className="relative">
            {/* Placeholder text - only shown when input is empty */}
            {!query && !disabled && (
              <div className="absolute top-3 left-4 text-gray-400 pointer-events-none">
                Ask anything...
              </div>
            )}
            {/* Actual input field */}
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={`
                search-input
                ${centered ? 'h-24' : 'h-10'} rounded-xl border-none px-4 pr-12 ${centered ? 'text-lg' : 'text-base'} w-full 
                ${disabled 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800' 
                  : 'bg-white dark:bg-gray-900'} 
                transition-colors
                focus:outline-none focus:ring-0
              `}
              placeholder={disabled ? "Search limit reached" : ""}
              disabled={disabled}
              aria-label="Search"
              style={{ 
                fontFamily: 'Inter, sans-serif'
              }}
            />
          </div>
          <button
            type="submit"
            className={`absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center p-0 m-0 ${centered ? 'h-9 w-9' : 'h-7 w-7'} bg-transparent border-none ${
              disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            aria-label="Search"
            tabIndex={-1}
            disabled={disabled}
          >
            <SearchIcon />
          </button>
        </div>
      </form>
    </div>
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
      className="w-5 h-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
      />
    </svg>
  );
} 