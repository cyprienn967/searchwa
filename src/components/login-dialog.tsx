"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Placeholder credentials for development
const PLACEHOLDER_EMAIL = "test@example.com";
const PLACEHOLDER_INVITE = "STEER-2025";

export function LoginDialog() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !inviteCode) {
      toast.error("Please enter both email and invite code");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Check with backend if account exists in Redis
      const res = await fetch('/api/check-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, inviteCode }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error || "Account not found or invite code incorrect");
        setIsLoading(false);
        return;
      }
      // Store login state in localStorage
      localStorage.setItem("steerLoggedIn", "true");
      localStorage.setItem("steerUserEmail", email);
      localStorage.setItem("steerInviteCode", inviteCode);
      
      toast.success("Login successful!");
      setIsOpen(false);
      
      // Redirect to account page
      router.push("/account");
    } catch (error) {
      toast.error("Login failed. Please check your credentials and try again.");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center text-base text-black hover:bg-gray-100 px-3 py-1.5 rounded transition"
        style={{ fontFamily: "Times New Roman, Times, serif" }}
      >
        Login
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative animate-in fade-in duration-300">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              aria-label="Close dialog"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            
            <h2 className="text-2xl font-bold mb-6 text-center" style={{ fontFamily: "Times New Roman, Times, serif" }}>
              Login to Steer
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="your@email.com"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="invite-code" className="block text-sm font-medium text-gray-700">
                  Invite Code
                </label>
                <input
                  id="invite-code"
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="XXXX-XXXX-XXXX"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full px-4 py-2 text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-md font-medium
                  ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg'}`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  "Login"
                )}
              </button>
            </form>
            
            <div className="mt-4 text-xs text-gray-500 text-center space-y-1">
              <p>
                Need an invite? Request one on our home page.
              </p>
              <p className="text-indigo-500 pt-2 border-t border-gray-200 mt-2">
                <b>Development credentials:</b> {PLACEHOLDER_EMAIL} / {PLACEHOLDER_INVITE}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 