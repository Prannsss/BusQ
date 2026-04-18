"use client";

import { useState } from "react";
import { ArrowRight, MapPin, Search } from "lucide-react";
import Link from "next/link";
import { CeresBusIcon } from "@/components/ui/ceres-bus-icon";
import {
  getDestinationsByTerminal,
  TERMINALS,
  type Terminal,
  type TerminalDestination,
} from "@/types";

function formatDateToLocalIso(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function ClientDashboardPage() {
  const [selectedTerminal, setSelectedTerminal] = useState<Terminal | "">("");
  const [selectedDestination, setSelectedDestination] = useState<TerminalDestination | "">("");
  const [travelDate, setTravelDate] = useState(() => formatDateToLocalIso(new Date()));
  const destinationOptions = selectedTerminal ? getDestinationsByTerminal(selectedTerminal) : [];

  return (
    <div className="flex min-h-[100vh] flex-col bg-slate-50 text-[#1d348a] font-sans pb-32">
      {/* Dynamic Header */}
      <header className="px-4 md:px-8 pb-6 pt-8 md:pt-12 bg-[#1d348a] text-white rounded-b-[2.5rem] shadow-lg relative overflow-hidden">
        {/* Soft background shape */}
        <div className="absolute top-[-50%] right-[-10%] w-[60vw] h-[150%] bg-white/5 blur-3xl rounded-full z-0 pointer-events-none"></div>
        
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight">
              Good morning,
              <br />
              <span className="text-[#ff6802]">User!</span>
            </h1>
            <p className="mt-3 flex items-center gap-2 text-sm md:text-base font-medium text-slate-200">
              <MapPin className="h-4 w-4 text-[#ff6802]" />
              Cebu City, Philippines
            </p>
          </div>
          <div className="w-16 h-16 md:w-24 md:h-24">
            <CeresBusIcon />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto flex w-full max-w-lg md:max-w-2xl flex-1 flex-col space-y-8 px-4 md:px-8 mt-[-1.5rem] relative z-20">
        
        {/* Search Widget - Soft Rounded Modern styling */}
        <section className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 flex flex-col gap-6">
          <h2 className="text-xl font-extrabold tracking-tight">Where are you heading?</h2>
          
          <div className="space-y-4 relative">
            <div className="space-y-1.5 focus-within:text-[#1d348a] transition-colors relative z-10">
              <label htmlFor="client-from" className="block text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-400">
                From Terminal
              </label>
              <div className="flex items-center rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 transition-all focus-within:border-[#ff6802] focus-within:bg-white">
                <select
                  id="client-from"
                  title="From Location"
                  className="w-full bg-transparent font-bold text-[#1d348a] outline-none appearance-none cursor-pointer"
                  value={selectedTerminal}
                  onChange={(event) => {
                    setSelectedTerminal(event.target.value as Terminal | "");
                    setSelectedDestination("");
                  }}
                >
                  <option value="">Select a terminal</option>
                  <option value={TERMINALS.NORTH}>{TERMINALS.NORTH}</option>
                  <option value={TERMINALS.SOUTH}>{TERMINALS.SOUTH}</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5 focus-within:text-[#1d348a] transition-colors relative z-10">
              <label htmlFor="client-to" className="block text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-400">
                To Destination
              </label>
              <div className="flex items-center rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 transition-all focus-within:border-[#ff6802] focus-within:bg-white">
                <select
                  id="client-to"
                  title="To Location"
                  className="w-full bg-transparent font-bold text-[#1d348a] outline-none appearance-none cursor-pointer"
                  value={selectedDestination}
                  disabled={!selectedTerminal}
                  onChange={(event) => {
                    setSelectedDestination(event.target.value as TerminalDestination);
                  }}
                >
                  <option value="" disabled>Select a Destination</option>
                  {destinationOptions.map((destination) => (
                    <option key={destination} value={destination}>
                      {destination}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5 focus-within:text-[#1d348a] transition-colors relative z-10 mt-6 pt-4 border-t border-slate-100">
              <label htmlFor="client-date" className="block text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-400">
                Travel Date
              </label>
              <div className="flex items-center rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 transition-all focus-within:border-[#ff6802] focus-within:bg-white">
                <input
                  id="client-date"
                  type="date"
                  title="Travel Date"
                  className="w-full bg-transparent font-bold text-[#1d348a] outline-none cursor-text"
                  value={travelDate}
                  onChange={(event) => setTravelDate(event.target.value)}
                />
              </div>
            </div>

            <Link
              href={{
                pathname: "/client/trips",
                query: {
                  terminal: selectedTerminal,
                  destination: selectedDestination,
                  date: travelDate,
                },
              }}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#ff6802] p-5 font-black text-white hover:bg-[#e05a00] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_8px_20px_rgb(255,104,2,0.3)] uppercase tracking-tighter text-lg"
              style={{
                pointerEvents: selectedTerminal && selectedDestination ? "auto" : "none",
                opacity: selectedTerminal && selectedDestination ? 1 : 0.6,
              }}
            >
              <Search className="h-6 w-6 stroke-[3]" />
              Find Buses
            </Link>
          </div>
        </section>

        {/* Promo Quick Actions */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
             <h3 className="font-bold text-xl tracking-tight">Cebu Hot Routes</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href={{
                pathname: "/client/trips",
                query: {
                  terminal: TERMINALS.NORTH,
                  destination: "Maya",
                  date: travelDate,
                },
              }}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1d348a] to-[#2a45a3] p-6 text-white shadow-md hover:shadow-lg transition-all group hover:-translate-y-1"
            >
              <div className="absolute right-[-10%] top-[20%] w-32 h-32 opacity-20 group-hover:scale-110 transition-transform">
                 <CeresBusIcon isCeresYellow={true} />
              </div>
              <div className="relative z-10 w-3/4">
                <span className="mb-3 inline-block rounded-full bg-white/20 px-3 py-1 text-[10px] font-extrabold tracking-widest text-white backdrop-blur-md">
                  NORTH BOUND
                </span>
                <h3 className="font-extrabold text-2xl tracking-tighter leading-tight">Maya Port</h3>
                <p className="mt-1 text-sm text-blue-200 font-medium">via Bogo • Aircon Only</p>
              </div>
            </Link>
            
            <Link
              href={{
                pathname: "/client/trips",
                query: {
                  terminal: TERMINALS.SOUTH,
                  destination: "Moalboal",
                  date: travelDate,
                },
              }}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#ff6802] to-[#e05a00] p-6 text-white shadow-md hover:shadow-lg transition-all group hover:-translate-y-1"
            >
              <div className="absolute right-[-10%] top-[20%] w-32 h-32 opacity-20 group-hover:scale-110 transition-transform">
                 <CeresBusIcon isCeresYellow={false} primaryColor="#ffffff" secondaryColor="#1d348a" />
              </div>
              <div className="relative z-10 w-3/4">
                <span className="mb-3 inline-block rounded-full bg-white/20 px-3 py-1 text-[10px] font-extrabold tracking-widest text-[#1d348a] backdrop-blur-md">
                  SOUTH BOUND
                </span>
                <h3 className="font-extrabold text-2xl tracking-tighter leading-tight drop-shadow-sm">Moalboal</h3>
                <p className="mt-1 text-sm text-orange-100 font-medium drop-shadow-sm">via Barili • Daily Trips</p>
              </div>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
