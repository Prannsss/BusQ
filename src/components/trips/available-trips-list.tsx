"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { CeresBusIcon } from "@/components/ui/ceres-bus-icon";
import { computeBusOperationalStatus } from "@/lib/data";
import type { BusOperationalStatus, Trip } from "@/types";

function formatTravelDuration(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes <= 0) {
    return "N/A";
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins}m`;
  }

  if (mins === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${mins}m`;
}

interface AvailableTripsListProps {
  trips: Trip[];
  selectedTerminal: string;
  selectedDate?: string;
}

export function AvailableTripsList({ trips, selectedTerminal, selectedDate }: AvailableTripsListProps) {
  const [nowTimestamp, setNowTimestamp] = useState<number>(Date.now());

  useEffect(() => {
    const intervalId = setInterval(() => setNowTimestamp(Date.now()), 30_000);
    return () => clearInterval(intervalId);
  }, []);

  const tripsWithStatus = useMemo(
    () => trips.map((trip) => ({ trip, status: computeBusOperationalStatus(trip, nowTimestamp) })),
    [trips, nowTimestamp],
  );

  const getStatusClassName = (status: BusOperationalStatus): string => {
    if (status === "On Standby") {
      return "bg-amber-100 text-amber-700 border border-amber-200";
    }

    if (status === "Travelling") {
      return "bg-emerald-100 text-emerald-700 border border-emerald-200";
    }

    return "bg-slate-200 text-slate-600 border border-slate-300";
  };

  if (trips.length === 0) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white p-10 text-center">
        <p className="text-sm font-black uppercase tracking-widest text-slate-400">No trips match your filters</p>
        <p className="mt-2 text-sm font-semibold text-slate-500">Try another bus type or liner.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {tripsWithStatus.map(({ trip, status }) => {
        const price = trip.price ?? 300;
        const availableSeats = trip.availableSeats ?? 40;
        const isPromo = price < 250;
        const isBookable = status === "On Standby";
        const isCeresYellow =
          trip.busLiner?.includes("Ceres") ??
          (trip.direction === "North_Terminal_to_Destination" || price > 300);
        const computedDurationMinutes =
          trip.travelDurationMins ?? Math.round((trip.arrivalTimestamp - trip.departureTimestamp) / 60000);
        const tripDuration = formatTravelDuration(computedDurationMinutes);

        const cardClassName = `group relative block overflow-hidden rounded-3xl border-2 border-slate-100 bg-white p-5 shadow-[0_4px_20px_rgb(0,0,0,0.05)] transition-all md:p-6 ${
          isBookable
            ? "hover:border-[#ff6802]/50 hover:shadow-[0_8px_30px_rgb(255,104,2,0.15)]"
            : "opacity-80"
        }`;

        const content = (
          <>
            <div className="pointer-events-none absolute right-[-5%] top-[10%] h-40 w-40 opacity-[0.03] transition-all group-hover:scale-110 group-hover:opacity-[0.05]">
              <CeresBusIcon isCeresYellow={isCeresYellow} />
            </div>

            {isPromo && (
              <div className="absolute right-6 top-0 rounded-b-xl bg-[#ff6802] px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-md md:px-4 md:py-1.5 md:text-xs">
                Super Saver
              </div>
            )}

            <div className="relative z-10 mb-6 flex items-start justify-between">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 p-2 md:h-16 md:w-16">
                  <CeresBusIcon isCeresYellow={isCeresYellow} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold leading-tight text-[#1d348a] md:text-xl">{trip.busType}</h3>
                  <span
                    className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${getStatusClassName(status)}`}
                  >
                    {status}
                  </span>
                  <div className="mt-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 md:text-sm">
                    <span>{trip.busLiner ?? "Bus Liner"}</span>
                    <span>•</span>
                    <span>{trip.busPlateNumber}</span>
                    <span>•</span>
                    <span className={availableSeats <= 15 ? "text-red-500" : "text-[#ff6802]"}>
                      {availableSeats} Seats Left
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="block text-xl font-black leading-none text-[#1d348a] md:text-3xl">₱{price}</span>
              </div>
            </div>

            <div className="relative z-10 flex items-center rounded-2xl border border-slate-100/50 bg-slate-50 p-4 md:p-5">
              <div className="flex w-1/3 flex-col gap-1">
                <span className="text-lg font-black text-[#1d348a] md:text-xl">{trip.departureTime}</span>
                <span className="truncate text-[10px] font-bold uppercase tracking-widest text-slate-500 md:text-xs" title={trip.origin}>
                  {trip.origin}
                </span>
              </div>

              <div className="relative flex h-10 flex-1 flex-col items-center justify-center px-2">
                <span className="absolute -top-5 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-500">
                  Est. travel: {tripDuration}
                </span>
                <div className="flex w-full items-center">
                  <div className="z-10 h-2 w-2 rounded-full border-2 border-[#1d348a] bg-white"></div>
                  <div className="h-[2px] flex-1 border-t-2 border-dashed border-slate-300 bg-slate-200"></div>
                  <div className="absolute left-1/2 top-1/2 mt-0.5 -translate-x-1/2 -translate-y-1/2 bg-slate-50 px-2">
                    <MapPin className="mx-auto mb-1 h-4 w-4 text-[#ff6802]" />
                  </div>
                  <div className="z-10 h-2 w-2 rounded-full border-2 border-[#1d348a] bg-[#1d348a]"></div>
                </div>
              </div>

              <div className="flex w-1/3 flex-col gap-1 text-right">
                <span className="text-lg font-black text-[#1d348a] md:text-xl">{trip.arrivalTime}</span>
                <span
                  className="truncate text-[10px] font-bold uppercase tracking-widest text-slate-500 md:text-xs"
                  title={trip.destination}
                >
                  {trip.destination}
                </span>
              </div>
            </div>
          </>
        );

        if (!isBookable) {
          return (
            <div key={trip.id} className={cardClassName} aria-disabled="true">
              {content}
            </div>
          );
        }

        return (
          <Link
            href={{
              pathname: `/client/trips/${trip.id}/seats`,
              query: {
                terminal: selectedTerminal,
                tripDate: selectedDate ?? trip.tripDate,
                origin: trip.origin,
                destination: trip.destination,
                departureTime: trip.departureTime,
                arrivalTime: trip.arrivalTime,
                busType: trip.busType,
                fare: String(price),
                direction: trip.direction,
                busLiner: trip.busLiner ?? "",
              },
            }}
            key={trip.id}
            className={cardClassName}
          >
            {content}
          </Link>
        );
      })}
    </div>
  );
}
