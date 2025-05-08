'use client';

import { FormEvent, useState, useEffect } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  initialQuery?: string;
  isConversationMode?: boolean;
}

export default function SearchBar({ onSearch, initialQuery = '', isConversationMode = false }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <div className={`w-full ${isConversationMode ? '' : 'space-y-4'}`}>
      <form onSubmit={handleSubmit} className={`search-container ${isConversationMode ? 'conversation' : ''} flex justify-center`}>
        <div className={`relative ${!isConversationMode ? 'max-w-xl w-full' : 'w-full'}`}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={`
              search-input 
              ${isConversationMode ? 'conversation' : ''} 
              ${!isConversationMode ? 'h-12 rounded-full shadow-md border border-gray-200 dark:border-gray-700 focus:shadow-lg' : 'py-4'} 
              px-4 pr-14 text-base w-full
            `}
            placeholder={
              isConversationMode ?
                "Ask a follow-up question..." :
                "Search the web..."
            }
            aria-label="Search"
            style={{ fontFamily: 'Inter, sans-serif' }}
          />
          <button
            type="submit"
            className={`
              search-button 
              ${isConversationMode ? 'conversation' : ''} 
              ${!isConversationMode ? 'h-12 right-0 flex items-center justify-center' : 'right-0'} 
              px-3
            `}
            style={{ aspectRatio: '1/1' }}
            aria-label="Search"
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