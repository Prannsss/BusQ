import { SignupForm } from "@/components/auth/signup-form";
import Link from "next/link";
import { Ticket } from "lucide-react";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-[#1d348a] font-sans selection:bg-[#ff6802] selection:text-white p-4">
      <div className="w-full max-w-2xl flex flex-col items-center justify-center">
        <Link href="/" className="mb-8 hover:scale-105 transition-transform">
          <Ticket className="h-16 w-16 text-[#ff6802]" strokeWidth={2.5} />
        </Link>
        <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter text-[#1d348a] mb-4 text-center">
          Create <span className="text-[#ff6802]">Account</span>
        </h1>
        <p className="text-lg md:text-xl text-zinc-600 font-medium mb-12 uppercase tracking-wide text-center">
          Register to book seats and track buses.
        </p>
        
        <div className="w-full relative z-10 bg-transparent">
          <SignupForm />
          
          <p className="mt-12 text-center text-sm md:text-base text-zinc-600 font-medium uppercase tracking-wide">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-bold text-[#ff6802] hover:text-[#1d348a] transition-colors hover:underline">
              Log in instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
