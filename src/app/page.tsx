"use client";

import { Counter } from "@/components/counter";
import { WaitlistForm } from "@/components/waitlist-form";
import SplitText from "@/components/ui/split-text";
import Link from "next/link";
import { useEffect, useState } from 'react';
import TicketButton from '@/components/TicketButton';

export default function Home() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showButton, setShowButton] = useState(false);
  const [globalFontSize, setGlobalFontSize] = useState<string>('text-base');

  useEffect(() => {
    console.log("[Home Page] Checking for user email in localStorage");
    const email = localStorage.getItem("steerUserEmail");
    console.log("[Home Page] Email from localStorage:", email);
    
    if (email) {
      setUserEmail(email);
      setShowButton(true);
      console.log("[Home Page] User is logged in, will show TicketButton");
    } else {
      console.log("[Home Page] User is not logged in, will not show TicketButton");
    }

    // Load global font size
    const savedFontSize = localStorage.getItem('globalFontSize');
    if (savedFontSize) {
      setGlobalFontSize(savedFontSize);
    }
  }, []);

  console.log("[Home Page] Rendering with userEmail:", userEmail, "showButton:", showButton);

  return (
    <>
      <div className="flex flex-col min-h-screen items-center text-center pt-28">
        <div className="mb-8">
          <SplitText className="text-5xl tracking-tighter font-medium">
            Search with Steer
          </SplitText>
          <SplitText className="tracking-tight text-xl">
            Request an invite to our private beta
          </SplitText>
        </div>
        <WaitlistForm />
        
        <div className="mt-4">
          <Counter />
        </div>
      </div>
      {showButton && userEmail && (
        <>
          {console.log("[Home Page] Rendering TicketButton for user:", userEmail)}
          <TicketButton userEmail={userEmail} globalFontSize={globalFontSize} />
        </>
      )}
    </>
  );
}
