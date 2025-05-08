import { Counter } from "@/components/counter";
import { WaitlistForm } from "@/components/waitlist-form";
import SplitText from "@/components/ui/split-text";

export default function Home() {
  return (
    <div className="flex flex-col h-screen justify-center items-center text-center">
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
