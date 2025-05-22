'use client';

import { useState, useEffect } from 'react';
import { FiClock, FiChevronLeft, FiChevronRight, FiTrash2 } from 'react-icons/fi';
import { SearchHistoryItem } from '@/lib/types';
import { toast } from 'sonner';
import { useHistory } from '@/context/HistoryContext';

interface HistorySidebarProps {
  onSelectHistoryItem?: (query: string) => void;
}

export default function HistorySidebar({ onSelectHistoryItem }: HistorySidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { history, clearHistory, isLoading, isLoggedIn } = useHistory();

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

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleClearHistory = async () => {
    try {
      await clearHistory();
      toast.success('Search history cleared');
    } catch (error) {
      toast.error('Failed to clear history');
    }
  };

  // Don't render anything if user is not logged in
  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className={`fixed top-[52px] bottom-0 left-0 transition-all duration-300 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-10 flex ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      {/* Content */}
      <div className="w-64 h-full overflow-y-auto p-4">
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
          <div className="space-y-4">
            {history.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No search history yet
              </p>
            ) : (
              history.map((item) => (
                <div 
                  key={item.id} 
                  className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition"
                  onClick={() => onSelectHistoryItem?.(item.query)}
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

      {/* Toggle button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-8 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-r-md h-16 w-8 flex items-center justify-center"
        aria-label={isOpen ? "Close history sidebar" : "Open history sidebar"}
      >
        {isOpen ? <FiChevronLeft /> : <FiChevronRight />}
      </button>
    </div>
  );
} 