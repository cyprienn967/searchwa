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
      className="bg-white border border-gray-300 shadow-lg rounded-lg p-6"
    >
      <input
        ref={inputRef}
        type="text"
        className="w-48 rounded px-3 py-2 text-lg focus:outline-none m-0"
        placeholder=""
        onKeyDown={e => {
          if (e.key === "Enter") {
            onClose();
          }
        }}
      />
    </div>
  );
} 