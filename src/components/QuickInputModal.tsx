import { useRef, useEffect } from "react";

export default function QuickInputModal({ onClose, position }: { onClose: () => void, position: { x: number, y: number } }) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        zIndex: 1000,
        transform: 'translate(-50%, -50%)',
      }}
      className="bg-white border border-gray-300 shadow-lg rounded-lg p-4 w-64 h-48 relative"
    >
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        aria-label="Close feedback"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      <input
        ref={inputRef}
        type="text"
        className="w-full rounded px-3 py-2 text-base focus:outline-none m-0"
        placeholder="ENTER to submit feedback"
        onKeyDown={e => {
          if (e.key === "Enter") {
            onClose();
          }
        }}
      />
    </div>
  );
} 