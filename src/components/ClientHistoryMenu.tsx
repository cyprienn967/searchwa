'use client';

import { useRouter, usePathname } from 'next/navigation';
import HistoryMenu from './HistoryMenu';
import { useHistory } from '@/context/HistoryContext';

export default function ClientHistoryMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const { history } = useHistory();
  
  const handleSelectHistoryItem = (item: { query: string; answer: string; timestamp: number }) => {
    // If we're already on the account page, update the state to show the history item
    if (pathname.includes('/account')) {
      // Find any search input field and update its value for UI consistency
      const searchInput = document.querySelector('.search-input') as HTMLInputElement;
      if (searchInput) {
        // Set the value and trigger an input event to update React state
        searchInput.value = item.query;
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      
      // Save the selected history item to sessionStorage so the account page can display it
      sessionStorage.setItem('selectedHistoryItem', JSON.stringify({
        query: item.query,
        answer: item.answer,
        timestamp: item.timestamp
      }));
      
      // Dispatch a custom event that the account page can listen for
      window.dispatchEvent(new CustomEvent('historyItemSelected', { 
        detail: { 
          query: item.query, 
          answer: item.answer, 
          timestamp: item.timestamp 
        } 
      }));
      
      // If we have a form, submit it to show the content immediately
      const form = document.querySelector('form') as HTMLFormElement;
      if (form && false) { // Disabled form submission to prevent new search
        setTimeout(() => {
          const fakeSubmitEvent = new Event('submit', { bubbles: true, cancelable: true });
          form.dispatchEvent(fakeSubmitEvent);
        }, 100);
      }
    } else {
      // If not on account page, navigate to search page with query parameter
      // and store the answer in sessionStorage for retrieval
      sessionStorage.setItem('historyItemAnswer', item.answer);
      router.push(`/search?q=${encodeURIComponent(item.query)}`);
    }
  };
  
  return <HistoryMenu externalHistory={history} onSelectHistoryItem={handleSelectHistoryItem} />;
} 