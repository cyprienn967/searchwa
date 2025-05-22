import React from 'react';

interface HistoryItem {
  query: string;
  summary?: string;
  timestamp: number;
}

interface SearchHistorySidebarProps {
  open: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
}

const SearchHistorySidebar: React.FC<SearchHistorySidebarProps> = ({ open, onClose, history, onSelect }) => {
  return (
    <div
      className={`fixed top-0 left-0 h-full z-40 transition-transform duration-300 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-lg w-72 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      style={{ minWidth: 260, maxWidth: 320 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <span className="font-semibold text-lg text-gray-800 dark:text-gray-100">Search History</span>
        <button
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      {/* History List */}
      <div className="overflow-y-auto h-[calc(100%-56px)] py-2">
        {history.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400 px-4 py-8 text-center">No search history yet.</div>
        ) : (
          <ul>
            {history.slice().reverse().map((item, idx) => (
              <li
                key={item.timestamp}
                className="px-4 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-800"
                onClick={() => onSelect(item)}
              >
                <div className="font-medium text-gray-800 dark:text-gray-100 truncate">{item.query}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">{item.summary ? item.summary.slice(0, 60) + (item.summary.length > 60 ? '...' : '') : ''}</div>
                <div className="text-[10px] text-gray-400 mt-1">{new Date(item.timestamp).toLocaleString()}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SearchHistorySidebar; 