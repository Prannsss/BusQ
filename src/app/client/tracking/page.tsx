"use client";

import dynamic from "next/dynamic";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CeresBusIcon } from "@/components/ui/ceres-bus-icon";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createTrackedBusesFromTrips, resolveLiveBusState } from "@/lib/route-tracking/utils";
import { routes } from "@/lib/route-tracking/routes";
import type { RouteTerminal } from "@/lib/route-tracking/types";
import { getDynamicTripsForAllTerminals } from "@/lib/data";
import { useIsMobile } from "@/hooks/use-mobile";

const TrackingMap = dynamic(() => import("@/components/tracking/tracking-map"), { ssr: false });

function formatClock(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString("en-PH", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatRemaining(minutes: number): string {
  const safeMinutes = Math.max(0, Math.round(minutes));
  const hours = Math.floor(safeMinutes / 60);
  const mins = safeMinutes % 60;
  if (hours === 0) {
    return `${mins}m`;
  }
  return `${hours}h ${mins}m`;
}

export default function TrackingPage() {
  const isMobile = useIsMobile();
  const [now, setNow] = useState<number>(Date.now());
  const [terminal, setTerminal] = useState<RouteTerminal | undefined>(undefined);
  const [isPanelHiddenMobile, setIsPanelHiddenMobile] = useState(false);

  useEffect(() => {
    const intervalId = setInterval(() => setNow(Date.now()), 5_000);
    return () => clearInterval(intervalId);
  }, []);

  const dayKey = useMemo(() => {
    const current = new Date(now);
    return `${current.getFullYear()}-${current.getMonth()}-${current.getDate()}`;
  }, [now]);

  const trackingTrips = useMemo(() => {
    const [year, month, day] = dayKey.split("-").map(Number);
    const currentDate = new Date(year, month, day);
    return getDynamicTripsForAllTerminals(currentDate);
  }, [dayKey]);

  const trackedBuses = useMemo(() => createTrackedBusesFromTrips(trackingTrips, now), [trackingTrips, now]);

  const liveBuses = useMemo(
    () => trackedBuses.map((bus) => resolveLiveBusState(bus, now)),
    [trackedBuses, now],
  );

  const busesByTerminal = useMemo(
    () => (terminal ? liveBuses.filter((busState) => busState.bus.terminal === terminal) : []),
    [liveBuses, terminal],
  );

  const [selectedBusId, setSelectedBusId] = useState<string>("");

  useEffect(() => {
    if (selectedBusId && !busesByTerminal.find((entry) => entry.bus.id === selectedBusId)) {
      setSelectedBusId("");
    }
  }, [busesByTerminal, selectedBusId]);

  const selectedBusState = busesByTerminal.find((entry) => entry.bus.id === selectedBusId);
  const selectedRoute =
    selectedBusState?.route ??
    routes.find((route) => route.terminal === terminal) ??
    routes[0];

  const panelStatus = selectedBusState ? selectedBusState.busOperationalStatus : "NO BUS";

  const panelStatusClassName =
    panelStatus === "Travelling"
      ? "text-emerald-700 bg-emerald-50 border-emerald-100"
      : panelStatus === "Arrived"
        ? "text-slate-700 bg-slate-100 border-slate-200"
        : panelStatus === "On Standby"
          ? "text-amber-700 bg-amber-50 border-amber-100"
          : "text-slate-500 bg-slate-100 border-slate-200";

  return (
    <div className="relative min-h-[100dvh] text-[#1d348a] font-sans overflow-hidden z-0">
      <main className="relative h-[100dvh] w-full z-0">
        <div className="absolute inset-0 z-0">
          <TrackingMap
            route={selectedRoute}
            buses={selectedBusState ? [selectedBusState] : []}
            selectedBusId={selectedBusState?.bus.id ?? ""}
            selectedTerminal={terminal}
          />
        </div>

        <div className="absolute top-4 left-4 right-4 md:right-auto md:w-[24rem] lg:w-[26rem] z-20 space-y-4">
          <header className="flex items-center justify-between bg-white/95 backdrop-blur-sm rounded-3xl shadow-[0_8px_30px_rgb(29,52,138,0.14)] border border-white px-4 py-3">
              <div className="flex items-center gap-3">
                <Link
                  href="/client"
                  className="text-[#ff6802] w-12 h-12 rounded-full hover:bg-slate-200/50 transition-colors flex items-center justify-center border-2 border-transparent hover:border-[#ff6802]/20"
                >
                  <ArrowLeft className="w-6 h-6 stroke-[3]" />
                </Link>
                <h1 className="text-xl md:text-2xl font-black tracking-tight text-[#1d348a]">
                  Live Tracking
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center overflow-hidden p-1.5">
                  <CeresBusIcon isCeresYellow={false} />
                </div>
                {isMobile ? (
                  <button
                    type="button"
                    onClick={() => setIsPanelHiddenMobile((prev) => !prev)}
                    aria-label={isPanelHiddenMobile ? "Show tracking panel" : "Hide tracking panel"}
                    className="h-9 w-9 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 flex items-center justify-center"
                  >
                    {isPanelHiddenMobile ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                  </button>
                ) : null}
              </div>
          </header>

          {(!isMobile || !isPanelHiddenMobile) ? (
          <section className="bg-white/95 backdrop-blur-sm rounded-[2.5rem] p-6 md:p-8 shadow-[0_10px_40px_rgb(29,52,138,0.15)] border border-white relative">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Terminal</p>
                  <Select
                    value={terminal}
                    onValueChange={(value) => {
                      setTerminal(value as RouteTerminal);
                      setSelectedBusId("");
                    }}
                  >
                    <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-slate-50 font-bold text-[#1d348a]">
                      <SelectValue placeholder="Select from which terminal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="North Bus Terminal">North Bus Terminal</SelectItem>
                      <SelectItem value="South Bus Terminal">South Bus Terminal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Bus To Track</p>
                  <Select value={selectedBusId || undefined} onValueChange={setSelectedBusId}>
                    <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-slate-50 font-bold text-[#1d348a]">
                      <SelectValue placeholder="Select a Bus" />
                    </SelectTrigger>
                    <SelectContent>
                      {busesByTerminal.map((busState) => (
                        <SelectItem key={busState.bus.id} value={busState.bus.id}>
                          {busState.bus.code} • {busState.busOperationalStatus}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedBusState ? (
                <>
              <div className="flex justify-between items-start mb-6 mt-6">
                <div>
                  <span className={`text-[10px] md:text-xs font-black tracking-widest px-3 py-1 rounded-xl uppercase mt-1 inline-block mb-3 border ${panelStatusClassName}`}>
                    {panelStatus}
                  </span>
                  <h2 className="text-xl md:text-2xl font-black text-[#1d348a]">
                    {selectedBusState.route.path[selectedBusState.route.path.length - 1]} Bound
                  </h2>
                  <p className="text-xs md:text-sm text-slate-500 mt-1 font-bold">
                    Bus: <span className="font-extrabold text-[#1d348a]">{selectedBusState.bus.code}</span>
                  </p>
                  <p className="text-xs md:text-sm text-slate-500 mt-1 font-bold">
                    Expected Arrival:{" "}
                    <span className="font-extrabold text-[#1d348a]">
                      {formatClock(selectedBusState.expectedArrivalTimestamp)}
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-black text-3xl md:text-4xl text-[#ff6802]">
                    {formatRemaining(selectedBusState.remainingMinutes)}
                  </div>
                  <span className="text-[10px] md:text-xs font-black tracking-widest text-slate-400 uppercase">
                    Remaining
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 mb-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Route</p>
                <p className="text-sm font-extrabold text-[#1d348a] mt-1">{selectedBusState.route.name}</p>
                <p className="text-xs text-slate-500 mt-1">Next Stop: <span className="font-black text-[#ff6802]">{selectedBusState.nextStop}</span></p>
              </div>

              <div className="relative pl-6 mt-6 border-l-[3px] border-slate-200 space-y-6 max-h-[38vh] overflow-y-auto pr-2">
                {selectedBusState.stopStates.map((stop) => (
                  <div className="relative" key={stop.municipality}>
                    <div
                      className={`absolute -left-[32px] md:-left-[35px] top-0 w-6 h-6 rounded-full border-4 border-white shadow-sm ${
                        stop.status === "passed"
                          ? "bg-red-500"
                          : stop.status === "current"
                            ? "bg-[#ff6802]"
                            : stop.municipality === selectedBusState.nextStop
                              ? "bg-green-500 animate-pulse"
                              : "bg-slate-200"
                      }`}
                    />
                    <h3
                      className={`text-base md:text-lg leading-none ${
                        stop.status === "upcoming" ? "font-bold text-slate-400" : "font-black text-[#1d348a]"
                      }`}
                    >
                      {stop.municipality}
                    </h3>
                    <span
                      className={`text-[10px] md:text-xs font-bold tracking-widest uppercase mt-1.5 block ${
                        stop.status === "current"
                          ? "text-[#ff6802]"
                          : stop.status === "passed"
                            ? "text-slate-500"
                            : "text-slate-400"
                      }`}
                    >
                      {stop.status === "current" ? "Current Stop" : stop.status === "passed" ? "Passed" : "ETA"} • {formatClock(stop.etaTimestamp)}
                    </span>
                  </div>
                ))}
              </div>
                </>
              ) : (
                <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm font-bold text-slate-500">
                  No active buses for this terminal.
                </div>
              )}
          </section>
          ) : null}
        </div>
      </main>
    </div>
  );
}
