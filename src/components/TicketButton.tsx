import { useState, useRef, useEffect } from 'react';
import { XIcon } from 'lucide-react';

interface TicketButtonProps {
  userEmail: string;
  globalFontSize?: string;
}

export default function TicketButton({ userEmail, globalFontSize = 'text-base' }: TicketButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Helper function to get font size classes based on text type
  const getFontSizeClass = (type: 'header' | 'text' | 'small' = 'text') => {
    const baseSizes = {
      'text-xs': { header: 'text-sm', text: 'text-xs', small: 'text-xs' },
      'text-sm': { header: 'text-base', text: 'text-sm', small: 'text-xs' },
      'text-base': { header: 'text-lg', text: 'text-base', small: 'text-sm' },
      'text-lg': { header: 'text-xl', text: 'text-lg', small: 'text-base' },
      'text-xl': { header: 'text-2xl', text: 'text-xl', small: 'text-lg' },
      'text-2xl': { header: 'text-3xl', text: 'text-2xl', small: 'text-xl' }
    };
    
    return baseSizes[globalFontSize as keyof typeof baseSizes]?.[type] || baseSizes['text-base'][type];
  };

  // Close the modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus the textarea when the modal opens
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!message.trim()) return;

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': userEmail
        },
        body: JSON.stringify({
          message,
          email: userEmail
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setFeedback('Thank you for your feedback!');
        setMessage('');
        
        // Close the modal after 2 seconds
        setTimeout(() => {
          setIsOpen(false);
          setFeedback(null);
        }, 2000);
      } else {
        setFeedback('Failed to send feedback. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting ticket:', error);
      setFeedback('An error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating button at the bottom right */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-colors z-50"
        aria-label="Submit feedback"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div 
            ref={modalRef} 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md overflow-hidden"
          >
            <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
              <h3 className={`${getFontSizeClass('header')} font-semibold text-gray-900 dark:text-white`}>
                Submit Feedback
              </h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4">
              {feedback ? (
                <div className={`p-3 rounded-md mb-4 ${getFontSizeClass('text')} ${feedback.includes('Thank you') ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'}`}>
                  {feedback}
                </div>
              ) : (
                <p className={`text-gray-600 dark:text-gray-300 mb-4 ${getFontSizeClass('text')}`}>
                  We appreciate your feedback! Please share any issues, suggestions, or complaints you have.
                </p>
              )}

              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What's on your mind?"
                className={`w-full h-32 p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none ${getFontSizeClass('text')}`}
                disabled={isSubmitting || !!feedback}
              />

              <div className="mt-4 flex justify-end space-x-3">
                <button
                  onClick={() => setIsOpen(false)}
                  className={`px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 ${getFontSizeClass('text')}`}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed ${getFontSizeClass('text')}`}
                  disabled={!message.trim() || isSubmitting || !!feedback}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 