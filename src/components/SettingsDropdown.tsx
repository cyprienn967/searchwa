"use client";

import { useState, useEffect, useRef } from 'react';
import { SettingsIcon, ChevronDownIcon } from 'lucide-react';

interface SettingsDropdownProps {
  currentFontSize: string;
  onFontSizeChange: (size: string) => void;
}

const fontSizeOptions = [
  { label: 'Extra Small', value: 'text-xs' }, // 12px
  { label: 'Small', value: 'text-sm' }, // 14px
  { label: 'Medium', value: 'text-base' }, // 16px (default)
  { label: 'Large', value: 'text-lg' }, // 18px
  { label: 'Extra Large', value: 'text-xl' }, // 20px
  { label: 'XXL', value: 'text-2xl' } // 24px
];

export default function SettingsDropdown({ currentFontSize, onFontSizeChange }: SettingsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getCurrentLabel = () => {
    return fontSizeOptions.find(option => option.value === currentFontSize)?.label || 'Medium';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="inline-flex items-center justify-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
        aria-haspopup="true"
        aria-expanded={isOpen}
        title={`Font Size: ${getCurrentLabel()}`}
      >
        <SettingsIcon className="h-5 w-5" />
        <span className="ml-2 text-xs">{getCurrentLabel()}</span>
        <ChevronDownIcon className={`h-4 w-4 ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Global Font Size</div>
            {fontSizeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onFontSizeChange(option.value);
                  setIsOpen(false);
                }}
                className={`block w-full text-left px-4 py-2 text-sm 
                  ${currentFontSize === option.value 
                    ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'}
                `}
                role="menuitem"
              >
                <span className={option.value}>{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 