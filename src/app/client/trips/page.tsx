"use client";

import { ArrowLeft, Clock, SlidersHorizontal, Calendar as CalendarIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DEFAULT_TRIPS_FILTER_STATE,
  applyTripsFilters,
  filterTripsForTravelDate,
  getDynamicTripsByTerminal,
  parseLocalIsoDate,
} from "@/lib/data";
import {
  TERMINALS,
  getDestinationsByTerminal,
  type Terminal,
  type TerminalDestination,
} from "@/types";
import { TripsFilterSheet } from "@/components/trips/trips-filter-sheet";
import { AvailableTripsList } from "@/components/trips/available-trips-list";

function formatDateToLocalIso(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function TripsPage() {
  return (
    <Suspense fallback={<div>Loading trips...</div>}>
      <TripsPageContent />
    </Suspense>
  );
}

function TripsPageContent() {
  const searchParams = useSearchParams();
  const queryTerminal = searchParams.get("terminal");
  const queryDestination = searchParams.get("destination") as TerminalDestination | null;
  const queryDate = searchParams.get("date");
  const parsedQueryDate = parseLocalIsoDate(queryDate);
  const initialDate = parsedQueryDate ?? new Date();
  const initialTerminal: Terminal | "" =
    queryTerminal === TERMINALS.NORTH || queryTerminal === TERMINALS.SOUTH ? (queryTerminal as Terminal) : "";
  const initialDestination: TerminalDestination | "" =
    initialTerminal && queryDestination && getDestinationsByTerminal(initialTerminal).includes(queryDestination)
      ? queryDestination
      : "";

  const [date, setDate] = useState<Date | undefined>(initialDate);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [mobileDatePickerOpen, setMobileDatePickerOpen] = useState(false);
  const [selectedTerminal, setSelectedTerminal] = useState<Terminal | "">(initialTerminal);
  const [selectedDestination, setSelectedDestination] = useState<TerminalDestination | "">(initialDestination);
  const [filters, setFilters] = useState(DEFAULT_TRIPS_FILTER_STATE);
  const [nowTimestamp, setNowTimestamp] = useState<number>(Date.now());

  useEffect(() => {
    const intervalId = setInterval(() => setNowTimestamp(Date.now()), 30_000);
    return () => clearInterval(intervalId);
  }, []);

  const destinationOptions = selectedTerminal ? getDestinationsByTerminal(selectedTerminal) : [];
  const allTripsForSelection = useMemo(
    () => {
      if (!selectedTerminal || !selectedDestination) {
        return [];
      }

      return getDynamicTripsByTerminal(selectedTerminal, {
        date,
        destination: selectedDestination,
      });
    },
    [selectedTerminal, selectedDestination, date],
  );

  const terminalTrips = useMemo(
    () => filterTripsForTravelDate(allTripsForSelection, date ?? new Date(), nowTimestamp),
    [allTripsForSelection, date, nowTimestamp],
  );

  const filteredTrips = useMemo(
    () => applyTripsFilters(terminalTrips, filters, nowTimestamp),
    [terminalTrips, filters, nowTimestamp],
  );

  const travelDateLabel = (date ?? new Date()).toLocaleDateString("en-PH", {
    weekday: "short",
    month: "short",
    day: "2-digit",
    year: "numeric",
  });

  const shortTerminalLabel =
    selectedTerminal === TERMINALS.NORTH
      ? "North Bus Terminal"
      : selectedTerminal === TERMINALS.SOUTH
        ? "South Bus Terminal"
        : "Select a terminal";

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-[#1d348a] font-sans pb-32 overflow-x-hidden lg:overflow-x-visible">
      <main className="flex-1 w-full mx-auto px-4 md:px-8">

        {/* Sticky Header */}
        <header className="sticky top-0 z-50 pt-6 pb-4 bg-slate-50/90 backdrop-blur-xl border-b border-slate-200/50 mb-6 lg:mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/client"
                className="flex items-center justify-center text-[#ff6802] w-12 h-12 rounded-full hover:bg-slate-200/50 transition-colors border-2 border-transparent hover:border-[#ff6802]/20"
              >
                <ArrowLeft className="w-6 h-6 stroke-[3]" />
              </Link>
              <h1 className="text-2xl font-black tracking-tight text-[#1d348a]">
                Available Trips
              </h1>
            </div>
            <button
              onClick={() => setFiltersOpen(true)}
              className="flex items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 bg-white px-4 py-2 text-sm font-bold text-[#1d348a] shadow-sm transition-all hover:border-[#1d348a] hover:bg-slate-50"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>
        </header>

        <div className="lg:grid lg:grid-cols-12 lg:gap-6 xl:gap-10 lg:items-start space-y-6 lg:space-y-0">

          {/* Left Column: Fixed Search Parameters & Dates */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-6 lg:sticky lg:top-32">
            
            {/* Desktop Calendar picker shown above the blue card */}
            <div className="hidden lg:block bg-white rounded-3xl p-6 shadow-sm border-2 border-slate-100 relative overflow-hidden">
              <h3 className="font-extrabold text-[#1d348a] mb-4 text-base uppercase tracking-widest flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-[#ff6802]" />
                Select Date
              </h3>
              <div className="flex justify-center -mx-4">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md mx-auto"
                />
              </div>
            </div>

            {/* Search Parameter Card */}
            <section className="bg-[#1d348a] rounded-3xl p-6 shadow-lg text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>

          <div className="flex items-center justify-between relative z-10">
            <div className="flex flex-col flex-1">
              <span className="text-[10px] md:text-xs font-bold tracking-widest text-[#ff6802] uppercase mb-1">
                From
              </span>
              <h2 className="text-xl md:text-2xl font-black leading-tight line-clamp-1">{shortTerminalLabel}</h2>
            </div>
            <div className="flex-shrink-0 px-4">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md">
                 <ArrowLeft className="w-5 h-5 -rotate-180 text-[#ff6802]" strokeWidth={3} />
              </div>
            </div>
            <div className="flex flex-col flex-1 text-right">
              <span className="text-[10px] md:text-xs font-bold tracking-widest text-[#ff6802] uppercase mb-1">
                To
              </span>
              <h2 className="text-xl md:text-2xl font-black leading-tight line-clamp-1">
                {selectedDestination || "Select a Destination"}
              </h2>
            </div>
          </div>

          <div className="relative z-10 mt-6 grid grid-cols-1 gap-3 border-t border-white/10 pt-4 sm:grid-cols-2">
            <select
              title="Select terminal"
              aria-label="Select terminal"
              className="h-11 rounded-xl border border-white/20 bg-white/10 px-3 text-sm font-bold text-white outline-none"
              value={selectedTerminal}
              onChange={(event) => {
                const terminal = event.target.value as Terminal | "";
                setSelectedTerminal(terminal);
                setSelectedDestination("");
              }}
            >
              <option className="text-[#1d348a]" value="">
                Select a terminal
              </option>
              <option className="text-[#1d348a]" value={TERMINALS.NORTH}>
                {TERMINALS.NORTH}
              </option>
              <option className="text-[#1d348a]" value={TERMINALS.SOUTH}>
                {TERMINALS.SOUTH}
              </option>
            </select>

            <select
              title="Select destination"
              aria-label="Select destination"
              className="h-11 rounded-xl border border-white/20 bg-white/10 px-3 text-sm font-bold text-white outline-none"
              disabled={!selectedTerminal}
              value={selectedDestination}
              onChange={(event) => setSelectedDestination(event.target.value as TerminalDestination)}
            >
              <option className="text-[#1d348a]" value="">
                Select a Destination
              </option>
              {destinationOptions.map((destination) => (
                <option className="text-[#1d348a]" key={destination} value={destination}>
                  {destination}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-8 flex justify-between items-center relative z-10 border-t border-white/10 pt-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-sm">
                <Clock className="w-5 h-5 text-[#ff6802]" strokeWidth={2.5}/>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] md:text-xs font-bold tracking-widest text-slate-300 uppercase leading-none mb-1">
                  Travel Date
                </span>
                <span className="font-bold text-sm md:text-base leading-none">{travelDateLabel}</span>
              </div>
            </div>
            <button
              onClick={() => setMobileDatePickerOpen(true)}
              className="lg:hidden bg-white text-[#1d348a] font-extrabold px-5 py-2 rounded-xl text-sm md:text-base shadow-sm hover:bg-slate-100 transition-colors"
            >
              Edit
            </button>
          </div>
        </section>
          </div>

          {/* Right Column: Trip List */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col pt-2 lg:pt-0">
            <div className="flex items-center justify-between pb-2 mb-2 lg:mb-0">
              <span className="font-extrabold text-sm md:text-base text-slate-500 uppercase tracking-widest">{filteredTrips.length} Trips Available</span>
            </div>

            <AvailableTripsList
              trips={filteredTrips}
              selectedTerminal={selectedTerminal || ""}
              selectedDate={formatDateToLocalIso(date ?? new Date())}
            />
          </div>
        </div>

        <TripsFilterSheet
          open={filtersOpen}
          onOpenChange={setFiltersOpen}
          terminal={selectedTerminal || TERMINALS.NORTH}
          values={filters}
          onValuesChange={setFilters}
        />

        <Dialog open={mobileDatePickerOpen} onOpenChange={setMobileDatePickerOpen}>
          <DialogContent className="w-[calc(100%-2rem)] max-w-sm rounded-2xl p-4 sm:p-6 lg:hidden">
            <DialogHeader>
              <DialogTitle className="text-[#1d348a]">Select travel date</DialogTitle>
              <DialogDescription>
                Choose your preferred travel date to refresh available trips.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(nextDate) => {
                  setDate(nextDate);
                  if (nextDate) {
                    setMobileDatePickerOpen(false);
                  }
                }}
                className="rounded-md"
              />
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
