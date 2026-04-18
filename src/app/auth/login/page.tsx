import { LoginForm } from "@/components/auth/login-form";
import Link from "next/link";
import { Ticket } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-[#1d348a] font-sans selection:bg-[#ff6802] selection:text-white p-4">
      <div className="w-full max-w-2xl flex flex-col items-center justify-center">
        <Link href="/" className="mb-8 hover:scale-105 transition-transform">
          <Ticket className="h-16 w-16 text-[#ff6802]" strokeWidth={2.5} />
        </Link>
        <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter text-[#1d348a] mb-4 text-center">
          Welcome <span className="text-[#ff6802]">Back</span>
        </h1>
        <p className="text-lg md:text-xl text-zinc-600 font-medium mb-12 uppercase tracking-wide text-center">
          Enter your credentials to access the system.
        </p>
        
        <div className="w-full relative z-10 bg-transparent">
          <LoginForm />
          
          <p className="mt-12 text-center text-sm md:text-base text-zinc-600 font-medium uppercase tracking-wide">
            Don't have an account?{" "}
            <Link href="/auth/signup" className="font-bold text-[#ff6802] hover:text-[#1d348a] transition-colors hover:underline">
              Sign up now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
