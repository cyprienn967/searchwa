import { useRef, useEffect, useState } from "react";

interface QuickInputModalProps {
  onClose: () => void;
  position: { x: number, y: number };
  userEmail: string;
  lastQuery: string;
  lastAnswer: string;
  globalFontSize?: string;
}

export default function QuickInputModal({ 
  onClose, 
  position, 
  userEmail, 
  lastQuery, 
  lastAnswer, 
  globalFontSize = 'text-base'
}: QuickInputModalProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [feedbackText, setFeedbackText] = useState("");

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleFeedbackSubmit = async () => {
    const trimmedFeedback = feedbackText.trim();

    // Close the modal immediately
    onClose();

    if (!trimmedFeedback) {
      // If feedback was empty, we've already closed, so just return
      return;
    }

    try {
      // Perform the submission in the background
      await fetch('/api/save-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          feedbackText: trimmedFeedback,
          query: lastQuery,
          answer: lastAnswer
        })
      });
      // Optional: console.log("Feedback submitted successfully in the background");
    } catch (error) {
      console.error("Failed to submit feedback in the background:", error);
      // User won't see this error directly as modal is closed.
      // Consider logging to an external service if critical.
    }
    // No 'finally' block needed for onClose as it's called at the beginning.
  };

  return (
    <div
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        zIndex: 1000,
        transform: 'translate(-50%, -50%)',
      }}
      className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 shadow-xl rounded-lg p-4 w-80 relative flex flex-col"
    >
      <button
        onClick={onClose} // This button will also close immediately
        className="absolute top-2.5 right-2.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
        aria-label="Close feedback"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      <p className={`mb-2 text-sm font-medium text-gray-700 dark:text-gray-300 ${globalFontSize}`}>Provide feedback:</p>
      <textarea
        ref={textareaRef}
        value={feedbackText}
        onChange={(e) => setFeedbackText(e.target.value)}
        className={`w-full flex-grow rounded-md p-2.5 border border-gray-300 dark:border-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none ${globalFontSize}`}
        placeholder="Type feedback... Enter to submit, Shift+Enter for new line."
        onKeyDown={async e => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault(); // Prevent new line on Enter
            await handleFeedbackSubmit(); // Modal will close immediately due to onClose() at start of handleFeedbackSubmit
          }
        }}
        rows={5} // Adjust initial height
      />
      <button
        onClick={handleFeedbackSubmit} // Modal will close immediately
        className={`mt-3 w-full px-4 py-2 rounded-md text-white ${globalFontSize} font-medium bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors`}
      >
        Confirm
      </button>
    </div>
  );
} 