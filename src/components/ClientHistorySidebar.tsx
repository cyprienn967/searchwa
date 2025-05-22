'use client';

import { useRouter, usePathname } from 'next/navigation';
import HistorySidebar from './HistorySidebar';

export default function ClientHistorySidebar() {
  const router = useRouter();
  const pathname = usePathname();
  
  const handleSelectHistoryItem = (query: string) => {
    // If we're already on the account page, we don't need to navigate away
    if (pathname.includes('/account')) {
      // Find any search input field and set its value, then dispatch a form submit event
      const searchInput = document.querySelector('.search-input') as HTMLInputElement;
      if (searchInput) {
        // Set the value and trigger an input event to update React state
        searchInput.value = query;
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        
        // Find the form and submit it
        const form = searchInput.closest('form');
        if (form) {
          form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        }
      }
    } else {
      // Otherwise navigate to search page with the query parameter
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };
  
  return <HistorySidebar onSelectHistoryItem={handleSelectHistoryItem} />;
} 