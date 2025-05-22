'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { SearchHistoryItem } from '@/lib/types';

interface HistoryContextType {
  history: SearchHistoryItem[];
  setHistory: (history: SearchHistoryItem[]) => void;
  addHistoryItem: (item: SearchHistoryItem) => void;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export function HistoryProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [initialized, setInitialized] = useState(false);

  const addHistoryItem = (item: SearchHistoryItem) => {
    setHistory(prev => {
      // Check if this item already exists (based on timestamp or query)
      const exists = prev.some(existingItem => 
        existingItem.timestamp === item.timestamp || 
        (existingItem.query === item.query && existingItem.answer === item.answer)
      );
      
      // If it exists, don't add it again
      if (exists) return prev;
      
      // Otherwise, add to the beginning of the array
      return [item, ...prev];
    });
  };

  // Debug logging to track history changes
  useEffect(() => {
    console.log('History state changed:', history.length, 'items');
  }, [history]);

  return (
    <HistoryContext.Provider value={{ history, setHistory, addHistoryItem }}>
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  const context = useContext(HistoryContext);
  if (context === undefined) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
} 