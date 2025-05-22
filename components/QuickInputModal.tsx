import { useRef, useEffect } from "react";

interface QuickInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  position: { x: number, y: number };
  onSearch?: (query: string) => void;
  userEmail?: string;
  lastQuery?: string;
  lastAnswer?: string;
}

export default function QuickInputModal({ 
  isOpen, 
  onClose, 
  position, 
  onSearch,
  userEmail = localStorage.getItem("steerUserEmail") || "",
  lastQuery = "",
  lastAnswer = ""
}: QuickInputModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Focus the input when modal opens
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle keyboard events for closing modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  async function handleSubmitFeedback(feedbackText: string) {
    if (!feedbackText.trim()) return;
    
    try {
      console.log('Submitting feedback:', feedbackText);
      
      // For test@example.com, just log the feedback and close
      if (userEmail === 'test@example.com') {
        console.log('Test user feedback:', {
          feedbackText,
          query: lastQuery || '(no query)',
          answer: lastAnswer ? lastAnswer.substring(0, 50) + '...' : '(no answer)'
        });
        return;
      }
      
      // For other users, make the API call
      const response = await fetch('/api/save-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          feedbackText,
          query: lastQuery || 'No query',
          answer: lastAnswer?.substring(0, 500) || 'No answer'
        })
      });
      
      if (!response.ok) {
        console.error('Failed to save feedback:', await response.text());
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  }

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        zIndex: 1000,
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'white',
        width: '250px',
        height: '100px',
        padding: '10px',
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '5px',
          right: '5px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '2px',
        }}
        type="button"
        aria-label="Close"
      >
        ✕
      </button>
      
      <input
        ref={inputRef}
        type="text"
        style={{
          width: '100%',
          border: 'none',
          outline: 'none',
          fontSize: '16px',
          padding: '5px',
          marginTop: '20px',
        }}
        placeholder="Enter feedback..."
        onKeyDown={async e => {
          if (e.key === "Enter") {
            await handleSubmitFeedback(e.currentTarget.value);
            onClose();
          } else if (e.key === "Escape") {
            onClose();
          }
        }}
      />
    </div>
  );
} 