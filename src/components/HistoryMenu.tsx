'use client';

import { useState, useEffect, useRef } from 'react';
import { FiClock, FiMenu, FiTrash2, FiX } from 'react-icons/fi';
import { SearchHistoryItem } from '@/lib/types';
import { toast } from 'sonner';
import { useHistory } from '@/context/HistoryContext';

interface HistoryMenuProps {
  onSelectHistoryItem?: (item: { query: string; answer: string; timestamp: number }) => void;
  externalHistory?: SearchHistoryItem[]; // Allow passing history directly
}

export default function HistoryMenu({ 
  onSelectHistoryItem,
  externalHistory 
}: HistoryMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { history: contextHistory, clearHistory, isLoading: contextLoading, isLoggedIn } = useHistory();
  
  // Use external history if provided, otherwise use context history
  const history = externalHistory || contextHistory;
  const isLoading = externalHistory ? false : contextLoading;

  // Handle clicks outside to close the menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleClearHistory = async () => {
    try {
      await clearHistory();
      toast.success('Search history cleared');
    } catch (error) {
      toast.error('Failed to clear history');
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return diffInHours === 0 
        ? 'Less than an hour ago' 
        : `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Don't render anything if user is not logged in and no external history
  if (!isLoggedIn && !externalHistory) {
    return null;
  }

  return (
    <div className="fixed top-[12px] left-4 z-50" ref={menuRef}>
      {/* Menu Button */}
      <button
        onClick={toggleMenu}
        className="p-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label={isOpen ? "Close history menu" : "Open history menu"}
      >
        {isOpen ? <FiX size={20} /> : <FiMenu size={20} />}
      </button>
      
      {/* Dropdown Content */}
      {isOpen && (
        <div className="absolute top-12 left-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg w-[320px] z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center">
                <FiClock className="mr-2" /> 
                Search History
              </h2>
              {history.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                  aria-label="Clear history"
                  title="Clear history"
                >
                  <FiTrash2 />
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 dark:border-gray-100"></div>
              </div>
            ) : (
              <div className="space-y-3 max-h-[70vh] overflow-y-auto">
                {history.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    No search history yet
                  </p>
                ) : (
                  history.map((item) => (
                    <div 
                      key={item.id} 
                      className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition"
                      onClick={() => {
                        onSelectHistoryItem?.({
                          query: item.query,
                          answer: item.answer,
                          timestamp: item.timestamp
                        });
                        setIsOpen(false); // Close menu after selection
                      }}
                    >
                      <div className="font-medium truncate mb-1">{item.query}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 truncate mb-1">
                        {typeof item.answer === 'string' ? 
                          item.answer.substring(0, 60) + '...' :
                          'Answer not available'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500">
                        {formatTimestamp(item.timestamp)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 