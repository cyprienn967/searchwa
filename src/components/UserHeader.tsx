'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function UserHeader() {
  const [userEmail, setUserEmail] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const router = useRouter();
  
  // Get user email and name on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const email = localStorage.getItem("steerUserEmail");
    if (email) {
      setUserEmail(email);
      
      // Fetch user data to get the name
      fetch('/api/get-user-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
        .then(res => res.json())
        .then(response => {
          if (response.success && response.data.name) {
            setUserName(response.data.name);
          }
        })
        .catch(error => {
          console.error('Error fetching user data:', error);
        });
    }
  }, []);
  
  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem("steerUserEmail");
    localStorage.removeItem("steerLoggedIn");
    localStorage.removeItem("steerUserId");
    localStorage.removeItem("steerInviteCode");
    
    // Update state
    setUserEmail("");
    setUserName("");
    
    // Dispatch auth state change event
    window.dispatchEvent(new Event('authStateChanged'));
    
    // Force a full page refresh to ensure all components re-render
    window.location.href = "/";
  };
  
  return (
    <header className="w-full py-4 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link 
            href="/"
            className="text-2xl font-semibold text-black"
            style={{ fontFamily: "Times New Roman, Times, serif" }}
          >
            steer
          </Link>
          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md">
            Beta
          </span>
        </div>
        
        {userEmail && (
          <div className="flex items-center">
            <span className="text-sm text-gray-600 mr-4 font-semibold">
              {userName || userEmail}
            </span>
            <button 
              className="text-sm font-medium text-red-600 hover:text-red-500"
              onClick={handleLogout}
            >
              Log Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
} 