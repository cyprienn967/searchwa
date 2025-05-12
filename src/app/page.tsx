import { Counter } from "@/components/counter";
import { WaitlistForm } from "@/components/waitlist-form";
import SplitText from "@/components/ui/split-text";
import Link from "next/link";

export default function Home() {
  return (
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
      
      {/* Demo CTA Button - Now below counter */}
      <div className="mt-6 mb-6">
        <Link href="/use-cases" className="group relative inline-flex items-center justify-center">
          <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 opacity-70 blur-sm transition-all duration-300 group-hover:opacity-100 group-hover:blur-md"></div>
          <button className="relative rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 text-white transition-all duration-200 hover:shadow-lg">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Try the Interactive Demo</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </div>
          </button>
        </Link>
      </div>
    </div>
  );
}
