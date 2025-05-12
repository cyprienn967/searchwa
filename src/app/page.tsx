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
    </div>
  );
}
