import React from "react";
import { ArrowRight, Smartphone, LayoutGrid, QrCode, MapPin, Monitor, Map, TrendingUp, Users, Ticket, Menu } from "lucide-react";
import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { BackToTop } from "@/components/ui/back-to-top";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-[#1d348a] selection:bg-[#ff6802] selection:text-white font-sans overflow-x-hidden">
      
      {/* Nav / Header */}
      <header className="px-4 md:px-8 py-4 md:py-6 border-b-2 border-[#1d348a] flex justify-between items-center relative z-50 bg-white">
        <Link href="/" className="flex items-center gap-2">
          <Ticket className="h-8 w-8 text-[#ff6802]" strokeWidth={2.5} />
          <div className="font-extrabold text-2xl uppercase tracking-tighter">BusQ</div>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/client/trips" className="font-bold uppercase tracking-tight text-zinc-600 hover:text-[#ff6802] transition-colors">
            Trips
          </Link>
          <Link href="/client/tracking" className="font-bold uppercase tracking-tight text-zinc-600 hover:text-[#ff6802] transition-colors">
            Track Bus
          </Link>
          <Link href="/auth/login" className="font-bold uppercase tracking-tight text-white hover:text-[#1d348a] transition-colors bg-[#1d348a] px-4 py-2 hover:bg-zinc-200 rounded-none border-2 border-[#1d348a]">
            Sign In
          </Link>
        </nav>
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <button type="button" aria-label="Open menu" className="p-2 text-[#1d348a] hover:text-[#ff6802] transition-colors focus:outline-none">
                <Menu className="h-8 w-8" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-white border-l-2 border-[#1d348a] p-8 max-w-sm rounded-none">
              <SheetHeader className="text-left">
                <SheetTitle className="sr-only">Mobile Navigation</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-8 mt-12">
                <Link href="/client/trips" className="text-3xl font-black uppercase tracking-tighter text-[#1d348a] hover:text-[#ff6802] transition-colors">
                  Trips
                </Link>
                <Link href="/client/tracking" className="text-3xl font-black uppercase tracking-tighter text-[#1d348a] hover:text-[#ff6802] transition-colors">
                  Track Bus
                </Link>
                <div className="h-0.5 w-1/4 bg-[#1d348a] my-2"></div>
                <Link href="/auth/login" className="text-3xl font-black uppercase tracking-tighter text-[#ff6802] hover:text-[#1d348a] transition-colors">
                  Sign In →
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main className="flex flex-col">
        {/* HERO SECTION */}
        <section className="px-4 md:px-8 py-20 md:py-32 flex flex-col items-start gap-8 relative overflow-hidden lg:overflow-visible">
          {/* Orange continuous brush stroke background effect (Desktop) */}
          <svg 
            className="hidden lg:block absolute top-0 -right-10 w-[40vw] h-[120%] -translate-y-[10%] pointer-events-none z-0 text-[#ff6802] opacity-15" 
            viewBox="0 0 400 1000" 
            preserveAspectRatio="xMidYMid slice"
          >
            {/* Main thick curvy "road" stroke */}
            <path 
              d="M 200 -100 C 50 150, 380 400, 200 650 C 20 900, 350 1150, 200 1400" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="100" 
              strokeLinecap="round"
            />
            {/* Outline/accent to give it movement and detail */}
            <path 
              d="M 270 -100 C 120 150, 450 400, 270 650 C 90 900, 420 1150, 270 1400" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="20" 
              strokeLinecap="round"
              className="opacity-50"
            />
          </svg>

          <div className="relative z-10 w-full">
            <h1 className="text-[clamp(3.5rem,12vw,14rem)] leading-[0.8] font-black uppercase tracking-tighter max-w-[95vw]">
              BusQ
              <br />
              <span className="text-[#ff6802]">Transport</span>
            </h1>
            
            <div className="max-w-2xl mt-8">
              <p className="text-xl md:text-2xl text-zinc-600 uppercase tracking-wide font-medium leading-tight">
                Book in seconds. Board in one scan. 
                Real-time bus reservation, zero queues, and digital fleet management.
              </p>
            </div>

            <div className="flex flex-row w-full md:w-auto gap-2 md:gap-4 mt-8">
              <Link 
                href="/auth/signup" 
                className="group relative overflow-hidden flex flex-1 md:flex-none items-center justify-center h-14 sm:h-16 md:h-20 px-2 sm:px-6 md:px-12 bg-[#ff6802] text-white font-bold uppercase tracking-tighter text-sm sm:text-lg md:text-xl border-2 border-[#1d348a] hover:scale-105 active:scale-95 transition-transform rounded-none text-center"
              >
                <span className="whitespace-nowrap relative z-10">Book Now</span> 
                <ArrowRight className="ml-1 sm:ml-2 md:ml-4 h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 relative z-10 hidden sm:block" />
                {/* Shine effect */}
                <div className="absolute top-0 -left-[100%] h-full w-[50%] bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-[-20deg] group-hover:animate-shine z-0"></div>
              </Link>
              <Link 
                href="#ecosystem" 
                className="flex flex-1 md:flex-none items-center justify-center h-14 sm:h-16 md:h-20 px-2 sm:px-6 md:px-12 bg-transparent text-[#1d348a] font-bold uppercase tracking-tighter text-sm sm:text-lg md:text-xl border-2 border-[#1d348a] hover:bg-[#1d348a] hover:text-white transition-colors rounded-none text-center relative z-10"
              >
                <span className="whitespace-nowrap hidden sm:inline">Explore Ecosystem</span>
                <span className="whitespace-nowrap sm:hidden">Explore</span>
              </Link>
            </div>
          </div>
        </section>

        {/* MARQUEE SECTION */}
        <div className="w-full border-y-2 border-[#1d348a] bg-[#ff6802] text-white py-4 overflow-hidden flex whitespace-nowrap">
            <div className="animate-marquee inline-block font-black uppercase text-4xl md:text-6xl tracking-tighter">
              <span className="mx-4">NORTH BUS TERMINAL</span> • 
              <span className="mx-4">SOUTH BUS TERMINAL</span> • 
              <span className="mx-4">LIVE GPS TRACKING</span> • 
              <span className="mx-4">SINGLE SCAN BOARDING</span> • 
              <span className="mx-4">NORTH BUS TERMINAL</span> • 
              <span className="mx-4">SOUTH BUS TERMINAL</span> • 
              <span className="mx-4">LIVE GPS TRACKING</span> • 
              <span className="mx-4">SINGLE SCAN BOARDING</span> • 
            </div>
        </div>

        {/* ECOSYSTEM SECTION - ORDERED */}
        <section id="ecosystem" className="px-4 md:px-8 py-24 md:py-32 flex flex-col gap-20 relative bg-zinc-100 border-b-2 border-[#1d348a]">
          <div className="flex flex-col gap-10">
            <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter">
              For Commuters
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 w-full">
              {[
                { title: "Mobile-First", desc: "Seamless seat reservation anywhere.", icon: <Smartphone className="h-8 w-8 mb-4 text-[#ff6802] group-hover:text-white transition-colors duration-300" /> },
                { title: "Interactive Hub", desc: "Pick your exact seat with A-E layouts.", icon: <LayoutGrid className="h-8 w-8 mb-4 text-[#ff6802] group-hover:text-white transition-colors duration-300" /> },
                { title: "Digital Ticket", desc: "Single-scan boarding with secure QR.", icon: <QrCode className="h-8 w-8 mb-4 text-[#ff6802] group-hover:text-white transition-colors duration-300" /> },
                { title: "Live Updates", desc: "Real-time bus location and arrival ETA.", icon: <MapPin className="h-8 w-8 mb-4 text-[#ff6802] group-hover:text-white transition-colors duration-300" /> },
              ].map((item, i) => (
                <RevealOnScroll
                  key={item.title}
                  delayClassName={i === 0 ? "" : i === 1 ? "delay-100" : i === 2 ? "delay-200" : "delay-300"}
                >
                  <div className="group border-2 border-[#1d348a] bg-white p-8 hover:bg-[#ff6802] transition-colors duration-300 rounded-none relative overflow-hidden flex flex-col justify-start">
                    <div className="relative z-10 flex flex-col h-full gap-4">
                      {item.icon}
                      <h3 className="text-2xl font-bold uppercase tracking-tighter text-[#1d348a]">
                        {item.title}
                      </h3>
                      <p className="text-lg text-zinc-700 group-hover:text-[#1d348a] font-medium transition-colors duration-300">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </RevealOnScroll>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-10">
            <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter">
              Core Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 w-full">
              {[
                { title: "Seat Control", desc: "See seat availability instantly and lock your preferred spot.", icon: <LayoutGrid className="h-8 w-8 mb-4 text-[#ff6802] group-hover:text-white transition-colors duration-300" /> },
                { title: "Quick Boarding", desc: "Board faster through one-scan QR ticket verification.", icon: <QrCode className="h-8 w-8 mb-4 text-[#ff6802] group-hover:text-white transition-colors duration-300" /> },
                { title: "Route Visibility", desc: "Track routes live with dynamic updates and stop-level ETA.", icon: <Map className="h-8 w-8 mb-4 text-[#ff6802] group-hover:text-white transition-colors duration-300" /> },
                { title: "Smart Discounts", desc: "Automated discounted fares for students, seniors, and PWDs.", icon: <TrendingUp className="h-8 w-8 mb-4 text-[#ff6802] group-hover:text-white transition-colors duration-300" /> },
              ].map((item, i) => (
                <RevealOnScroll
                  key={item.title}
                  delayClassName={i === 0 ? "delay-100" : i === 1 ? "delay-200" : i === 2 ? "delay-300" : "delay-500"}
                >
                  <div className="group border-2 border-[#1d348a] bg-white p-8 hover:bg-[#ff6802] transition-colors duration-300 rounded-none relative overflow-hidden flex flex-col justify-start">
                    <div className="relative z-10 flex flex-col h-full gap-4">
                      {item.icon}
                      <h3 className="text-2xl font-bold uppercase tracking-tighter text-[#1d348a]">
                        {item.title}
                      </h3>
                      <p className="text-lg text-zinc-700 group-hover:text-[#1d348a] font-medium transition-colors duration-300">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </RevealOnScroll>
              ))}
            </div>
          </div>

          <div className="w-full">
            <RevealOnScroll delayClassName="delay-300">
              <div className="bg-[#1d348a] border-2 border-[#1d348a] text-white p-8 md:p-12 lg:p-16 relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-8">
                <div className="absolute top-[-45%] left-[-8%] w-[45vw] h-[190%] bg-white/10 rotate-12 pointer-events-none z-0"></div>
                <div className="relative z-10 max-w-3xl">
                  <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">
                    Ready To Ride With BusQ?
                  </h3>
                  <p className="mt-3 text-lg md:text-xl text-zinc-200 font-medium">
                    Create your account and reserve your next trip in seconds.
                  </p>
                </div>
                <Link
                  href="/auth/signup"
                  className="group relative z-10 overflow-hidden flex items-center justify-center h-14 md:h-16 px-8 md:px-10 bg-[#ff6802] text-white font-bold uppercase tracking-tighter text-base md:text-lg border-2 border-white hover:scale-105 active:scale-95 transition-transform rounded-none"
                >
                  <span className="relative z-10">Sign Up</span>
                  <ArrowRight className="ml-2 h-5 w-5 relative z-10" />
                  <div className="absolute top-0 -left-[100%] h-full w-[50%] bg-gradient-to-r from-transparent via-white/60 to-transparent skew-x-[-20deg] group-hover:animate-shine z-0"></div>
                </Link>
              </div>
            </RevealOnScroll>
          </div>

          <div className="flex flex-col gap-10">
            <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter">
              For Bus Liners
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 w-full">
              {[
                { title: "Command Center", desc: "Fleet dispatching with operator-level oversight.", icon: <Monitor className="h-8 w-8 mb-4 text-[#1d348a] group-hover:text-white transition-colors duration-300" /> },
                { title: "Asset Tracking", desc: "Live GPS monitoring for buses and active routes.", icon: <Map className="h-8 w-8 mb-4 text-[#1d348a] group-hover:text-white transition-colors duration-300" /> },
                { title: "Revenue Insights", desc: "Performance analytics for trips, loads, and demand.", icon: <TrendingUp className="h-8 w-8 mb-4 text-[#1d348a] group-hover:text-white transition-colors duration-300" /> },
                { title: "Queue Elimination", desc: "Single-scan validation to reduce terminal congestion.", icon: <Users className="h-8 w-8 mb-4 text-[#1d348a] group-hover:text-white transition-colors duration-300" /> },
              ].map((item, i) => (
                <RevealOnScroll
                  key={item.title}
                  delayClassName={i === 0 ? "delay-100" : i === 1 ? "delay-200" : i === 2 ? "delay-300" : "delay-500"}
                >
                  <div className="group border-2 border-[#1d348a] bg-white p-8 hover:bg-[#1d348a] transition-colors duration-300 rounded-none relative overflow-hidden flex flex-col justify-start">
                    <div className="relative z-10 flex flex-col h-full gap-4">
                      {item.icon}
                      <h3 className="text-2xl font-bold uppercase tracking-tighter text-[#1d348a] group-hover:text-white transition-colors duration-300">
                        {item.title}
                      </h3>
                      <p className="text-lg text-zinc-700 group-hover:text-zinc-300 font-medium transition-colors duration-300">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </RevealOnScroll>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-10">
            <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter">
              Core Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 w-full">
              {[
                { title: "Bookings Console", desc: "From admin/bookings: monitor active reservations and boarding flow.", icon: <Ticket className="h-8 w-8 mb-4 text-[#1d348a] group-hover:text-white transition-colors duration-300" /> },
                { title: "Tracking Console", desc: "From admin/tracking: supervise bus movement and status in real-time.", icon: <MapPin className="h-8 w-8 mb-4 text-[#1d348a] group-hover:text-white transition-colors duration-300" /> },
                { title: "Reports Dashboard", desc: "From admin/reports: inspect demand, trip performance, and revenues.", icon: <TrendingUp className="h-8 w-8 mb-4 text-[#1d348a] group-hover:text-white transition-colors duration-300" /> },
                { title: "Schedule + Settings", desc: "From admin/schedule and admin/settings: configure trips, rates, and ops rules.", icon: <LayoutGrid className="h-8 w-8 mb-4 text-[#1d348a] group-hover:text-white transition-colors duration-300" /> },
              ].map((item, i) => (
                <RevealOnScroll
                  key={item.title}
                  delayClassName={i === 0 ? "delay-100" : i === 1 ? "delay-200" : i === 2 ? "delay-300" : "delay-500"}
                >
                  <div className="group border-2 border-[#1d348a] bg-white p-8 hover:bg-[#1d348a] transition-colors duration-300 rounded-none relative overflow-hidden flex flex-col justify-start">
                    <div className="relative z-10 flex flex-col h-full gap-4">
                      {item.icon}
                      <h3 className="text-2xl font-bold uppercase tracking-tighter text-[#1d348a] group-hover:text-white transition-colors duration-300">
                        {item.title}
                      </h3>
                      <p className="text-lg text-zinc-700 group-hover:text-zinc-300 font-medium transition-colors duration-300">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </RevealOnScroll>
              ))}
            </div>
          </div>

          <div className="w-full">
            <RevealOnScroll delayClassName="delay-300">
              <div className="bg-[#ff6802] border-2 border-[#1d348a] text-white p-8 md:p-16 lg:p-20 relative overflow-hidden flex flex-col items-center text-center gap-8">
                <div className="absolute top-[-50%] right-[-10%] w-[50vw] h-[200%] bg-white/10 -rotate-12 pointer-events-none z-0"></div>
                <h2 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter relative z-10 max-w-4xl">
                  Partner With BusQ
                </h2>
                <p className="text-xl md:text-2xl text-white/90 font-medium max-w-3xl relative z-10">
                  Bring cleaner terminals, live fleet control, and faster boarding to your routes with one connected platform.
                </p>
                <Link
                  href="/onboarding"
                  className="mt-4 relative overflow-hidden flex items-center justify-center h-16 md:h-20 px-8 md:px-12 bg-[#1d348a] text-white font-bold uppercase tracking-tighter text-lg md:text-2xl border-2 border-white hover:scale-105 active:scale-95 transition-transform rounded-none z-10 group"
                >
                  <span className="relative z-10">Partner With BusQ</span>
                  <div className="absolute top-0 -left-[100%] h-full w-[50%] bg-gradient-to-r from-transparent via-white/60 to-transparent skew-x-[-20deg] group-hover:animate-shine z-0"></div>
                </Link>
              </div>
            </RevealOnScroll>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="w-full border-t-2 border-[#1d348a] bg-white py-8 px-4 md:px-8 relative z-10">
        <div className="mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[#1d348a] font-bold uppercase tracking-tight text-sm">
            &copy; {new Date().getFullYear()} BusQ. All rights reserved.
          </p>
          <div className="text-[#ff6802] font-black uppercase tracking-tighter text-xl">
            Group Temu
          </div>
        </div>
      </footer>
      
      <BackToTop />
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 15s linear infinite;
        }
        @keyframes shine {
          0% { left: -100%; }
          100% { left: 125%; }
        }
        .animate-shine {
          animation: shine 0.75s ease-in-out;
        }
      `}} />
    </div>
  );
}
