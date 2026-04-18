"use client";

import { useState, Suspense } from "react";
import { ArrowLeft, ArrowRight, Fan, Zap, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { MOCK_TRIPS } from "@/lib/data";
import { computeBusOperationalStatus } from "@/lib/data";
import { calculateTripFareSummary } from "@/lib/utils";
import { encodeBookingPayload, type BookingDraft } from "@/lib/booking-flow";
import { CeresBusIcon } from "@/components/ui/ceres-bus-icon";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  getDestinationsByDirection,
  passengerTypes,
  passengerTypeLabels,
  resolveTerminalByDirection,
  TERMINALS,
  type Trip,
  type TripDirection,
  type PassengerType,
  type TerminalDestination,
} from "@/types";

function parseLocalDateTime(dateIso: string, timeLabel: string): number | null {
  const dateMatch = dateIso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!dateMatch) {
    return null;
  }

  const year = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const day = Number(dateMatch[3]);

  const twelveHour = timeLabel.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (twelveHour) {
    const rawHour = Number(twelveHour[1]);
    const minute = Number(twelveHour[2]);
    const meridiem = twelveHour[3].toUpperCase();
    const hour24 = (rawHour % 12) + (meridiem === "PM" ? 12 : 0);
    return new Date(year, month - 1, day, hour24, minute, 0, 0).getTime();
  }

  const twentyFourHour = timeLabel.match(/^(\d{1,2}):(\d{2})$/);
  if (twentyFourHour) {
    const hour = Number(twentyFourHour[1]);
    const minute = Number(twentyFourHour[2]);
    return new Date(year, month - 1, day, hour, minute, 0, 0).getTime();
  }

  return null;
}

export default function SeatsPage() {
  return (
    <Suspense fallback={<div>Loading seats...</div>}>
      <SeatsPageContent />
    </Suspense>
  );
}

function SeatsPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const tripId = params.tripId as string;
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  const matchedTrip = MOCK_TRIPS.find((t) => t.id === tripId) || MOCK_TRIPS[0];

  const queryDirection = searchParams.get("direction") as TripDirection | null;
  const queryTerminal = searchParams.get("terminal");
  const resolvedDirection: TripDirection =
    queryDirection === "South_Terminal_to_Destination" || queryDirection === "North_Terminal_to_Destination"
      ? queryDirection
      : queryTerminal === TERMINALS.NORTH
        ? "North_Terminal_to_Destination"
        : queryTerminal === TERMINALS.SOUTH
          ? "South_Terminal_to_Destination"
          : matchedTrip.direction;

  const parsedFare = Number(searchParams.get("fare"));
  const queryTripDate = searchParams.get("tripDate") || matchedTrip.tripDate;
  const queryDepartureTime = searchParams.get("departureTime") || matchedTrip.departureTime;
  const queryArrivalTime = searchParams.get("arrivalTime") || matchedTrip.arrivalTime;
  const parsedDepartureTimestamp = parseLocalDateTime(queryTripDate, queryDepartureTime);
  const parsedArrivalTimestamp = parseLocalDateTime(queryTripDate, queryArrivalTime);
  const normalizedArrivalTimestamp =
    parsedDepartureTimestamp !== null &&
    parsedArrivalTimestamp !== null &&
    parsedArrivalTimestamp < parsedDepartureTimestamp
      ? parsedArrivalTimestamp + 24 * 60 * 60 * 1000
      : parsedArrivalTimestamp;

  const trip: Trip = {
    ...matchedTrip,
    id: tripId,
    direction: resolvedDirection,
    origin: searchParams.get("origin") || matchedTrip.origin,
    destination: searchParams.get("destination") || matchedTrip.destination,
    departureTime: queryDepartureTime,
    arrivalTime: queryArrivalTime,
    busType: (searchParams.get("busType") as Trip["busType"]) || matchedTrip.busType,
    tripDate: queryTripDate,
    busLiner: matchedTrip.busLiner,
    departureTimestamp: parsedDepartureTimestamp ?? matchedTrip.departureTimestamp,
    arrivalTimestamp: normalizedArrivalTimestamp ?? matchedTrip.arrivalTimestamp,
    price: Number.isFinite(parsedFare) && parsedFare > 0 ? parsedFare : (matchedTrip.price ?? 300),
  };

  const isCeresYellow = trip.direction === "North_Terminal_to_Destination" || (trip.price ?? 300) > 300;
  const dropoffOptions = getDestinationsByDirection(trip.direction);

  const queryDropoff = searchParams.get("destination") as TerminalDestination | null;
  const initialDropoffPoint =
    (queryDropoff && dropoffOptions.includes(queryDropoff) ? queryDropoff : null) ??
    dropoffOptions.find((destination) => destination === trip.destination) ??
    dropoffOptions[0];

  const [selectedDropoffPoint, setSelectedDropoffPoint] = useState<TerminalDestination>(initialDropoffPoint);
  const [selectedPassengerType, setSelectedPassengerType] = useState<PassengerType>("Regular");

  const fareSummary = calculateTripFareSummary({
    terminal: resolveTerminalByDirection(trip.direction),
    destination: selectedDropoffPoint,
    busType: trip.busType,
    passengerType: selectedPassengerType,
    seatCount: selectedSeats.length,
    fallbackFarePerSeat: trip.price ?? 300,
  });

  const bookingDraft: BookingDraft = {
    tripId,
    terminal: resolveTerminalByDirection(trip.direction),
    origin: trip.origin,
    destination: trip.destination,
    dropoffPoint: selectedDropoffPoint,
    tripDate: trip.tripDate,
    departureTime: trip.departureTime,
    arrivalTime: trip.arrivalTime,
    busType: trip.busType,
    busLiner: trip.busLiner ?? "BusQ Liner",
    passengerType: selectedPassengerType,
    selectedSeats,
    fare: {
      regularFarePerSeat: fareSummary.regularFarePerSeat,
      finalFarePerSeat: fareSummary.finalFarePerSeat,
      regularFareTotal: fareSummary.regularFareTotal,
      discountRate: fareSummary.discountRate,
      discountAmount: fareSummary.discountAmount,
      amountDue: fareSummary.amountDue,
    },
  };

  const paymentHref = `/client/payment?booking=${encodeBookingPayload(bookingDraft)}`;
  const operationalStatus = computeBusOperationalStatus(trip);
  const isTripBookable = operationalStatus === "On Standby";
  
  // A mock logic for occupied seats based on trip data to make it feel dynamic
  const occupiedSeats = ["C1", "D1", "C3", "D3", "A5", "C6", "B2", "D5", "A8", "C9"].slice(0, (trip.price ?? 200) % 8 + 2);
  const seatRows = Array.from({ length: 12 }, (_, i) => i + 1);
  const rearSeats = ["R1", "R2", "R3", "R4", "R5"];


  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-[#1d348a] font-sans relative">
      <main className="flex-1 w-full mx-auto px-4 md:px-8 pt-6 pb-24 lg:pb-12">
        
        {/* Desktop / Image-like Header */}
        <header className="flex flex-col items-center justify-center mb-10 text-center relative w-full pt-4">
          <Link
            href="/client/trips"
            className="absolute left-0 top-2 flex items-center justify-center text-[#ff6802] w-10 h-10 lg:w-12 lg:h-12 rounded-full hover:bg-slate-200/50 transition-colors border-2 border-transparent hover:border-[#ff6802]/20"
          >
            <ArrowLeft className="w-5 h-5 lg:w-6 lg:h-6 stroke-[3]" />
          </Link>
          
          <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center overflow-hidden p-1.5 mb-4">
             <CeresBusIcon isCeresYellow={isCeresYellow} />
          </div>
          <h1 className="text-2xl md:text-4xl font-black leading-tight">Select Seats & Passenger Details</h1>
          <h2 className="text-[#ff6802] font-black text-xl md:text-2xl mt-2">{trip.busType}</h2>
          
          <div className="text-slate-500 font-medium text-sm md:text-base mt-3 flex flex-col items-center gap-1">
            <p>Route: {trip.origin} &rarr; {trip.destination}</p>
            <p>Departure: {trip.departureTime} | Bus Type: {trip.busType}</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SECTION - Bus Layout */}
          <div className="lg:col-span-8 flex flex-col space-y-6">
            
            <section className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 flex flex-col relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl md:text-2xl font-black leading-tight">Bus Layout ({trip.busType})</h2>
                  <p className="text-xs md:text-sm text-slate-500 mt-1 font-bold">
                    Click on available seats to select them.
                  </p>
                </div>
                
                {/* Legend embedded in top of left card for Desktop mostly */}
                <div className="flex items-center gap-6 mt-4 md:mt-0">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md border-2 border-green-500 bg-white"></div>
                    <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-[#ff6802] shadow-sm flex items-center justify-center text-white">
                      <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                    </div>
                    <span className="text-[10px] font-black tracking-widest text-[#ff6802] uppercase">Selected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-red-100 border-2 border-red-200 text-red-500"></div>
                    <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Reserved</span>
                  </div>
                </div>
              </div>

              {/* Map Centering Wrapper */}
              <div className="max-w-sm mx-auto w-full">
                {/* Driver Cockpit Header */}
                <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-50">
                  <div className="flex flex-col items-start">
                    <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1">Driver</span>
                    <div className="w-5 h-5 bg-[#1d348a] rounded-md shadow-sm"></div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="square" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m0-16l-4 4m4-4l4 4" />
                    </svg>
                  </div>
                </div>

                <div className="text-center text-[10px] font-black tracking-widest text-slate-300 uppercase mb-4">
                  Front of Bus
                </div>

                <div className="flex justify-between relative">
                  {/* Left Column (A & B) */}
                  <div className="grid grid-cols-2 gap-2 md:gap-3 z-10 w-[38%]">
                    {seatRows.map((row) => {
                      return ["A", "B"].map((col) => {
                        const id = `${col}${row}`;
                        const isOccupied = occupiedSeats.includes(id);
                        const isSelected = selectedSeats.includes(id);

                        let baseClasses = "aspect-[4/5] rounded-xl flex items-center justify-center font-black text-xs md:text-sm transition-all focus:outline-none ";
                        if (!isTripBookable) {
                          baseClasses += "bg-slate-100 text-slate-400 border-2 border-slate-200 cursor-not-allowed";
                        } else if (isSelected) {
                          baseClasses += "bg-[#ff6802] text-white shadow-[0_6px_15px_rgb(255,104,2,0.3)] scale-110 z-10";
                        } else if (isOccupied) {
                          baseClasses += "bg-red-100 text-red-400 border-2 border-red-200 cursor-not-allowed";
                        } else {
                          baseClasses += "bg-white text-green-700 border-2 border-green-500 hover:border-[#ff6802]/50 hover:bg-orange-50 cursor-pointer";
                        }

                        return (
                          <button
                            key={id}
                            disabled={isOccupied || !isTripBookable}
                            onClick={() => {
                              setSelectedSeats(prev => {
                                if (prev.includes(id)) return prev.filter(s => s !== id);
                                if (prev.length >= 3) return prev;
                                return [...prev, id];
                              });
                            }}
                            className={baseClasses}
                          >
                            {id}
                          </button>
                        );
                      });
                    })}
                  </div>

                  {/* Aisle Spacer */}
                  <div className="w-[8%] border-x border-slate-100/50 bg-slate-50/50 rounded-full mx-1"></div>

                  {/* Right Column (C, D, E) */}
                  <div className="grid grid-cols-3 gap-2 md:gap-3 z-10 w-[54%]">
                    {seatRows.map((row) => {
                      return ["C", "D", "E"].map((col) => {
                        const id = `${col}${row}`;
                        const isOccupied = occupiedSeats.includes(id);
                        const isSelected = selectedSeats.includes(id);

                        let baseClasses = "aspect-[4/5] rounded-xl flex items-center justify-center font-black text-xs md:text-sm transition-all focus:outline-none ";
                        if (!isTripBookable) {
                          baseClasses += "bg-slate-100 text-slate-400 border-2 border-slate-200 cursor-not-allowed";
                        } else if (isSelected) {
                          baseClasses += "bg-[#ff6802] text-white shadow-[0_6px_15px_rgb(255,104,2,0.3)] scale-110 z-10";
                        } else if (isOccupied) {
                          baseClasses += "bg-red-100 text-red-400 border-2 border-red-200 cursor-not-allowed";
                        } else {
                          baseClasses += "bg-white text-green-700 border-2 border-green-500 hover:border-[#ff6802]/50 hover:bg-orange-50 cursor-pointer";
                        }

                        return (
                          <button
                            key={id}
                            disabled={isOccupied || !isTripBookable}
                            onClick={() => {
                              setSelectedSeats(prev => {
                                if (prev.includes(id)) return prev.filter(s => s !== id);
                                if (prev.length >= 3) return prev;
                                return [...prev, id];
                              });
                            }}
                            className={baseClasses}
                          >
                            {id}
                          </button>
                        );
                      });
                    })}
                  </div>
                </div>

                <div className="text-center text-[10px] font-black tracking-widest text-slate-300 uppercase mt-8 mb-4">
                  Rear Bench
                </div>

                {/* Rear Bench */}
                <div className="mb-4">
                   <div className="grid grid-cols-5 gap-2 md:gap-3 z-10 w-full">
                      {rearSeats.map((id) => {
                        const isOccupied = occupiedSeats.includes(id);
                        const isSelected = selectedSeats.includes(id);

                        let baseClasses = "aspect-[4/5] rounded-xl flex items-center justify-center font-black text-xs md:text-sm transition-all focus:outline-none ";
                        if (!isTripBookable) {
                          baseClasses += "bg-slate-100 text-slate-400 border-2 border-slate-200 cursor-not-allowed";
                        } else if (isSelected) {
                          baseClasses += "bg-[#ff6802] text-white shadow-[0_6px_15px_rgb(255,104,2,0.3)] scale-110 z-10";
                        } else if (isOccupied) {
                          baseClasses += "bg-red-100 text-red-400 border-2 border-red-200 cursor-not-allowed";
                        } else {
                          baseClasses += "bg-white text-green-700 border-2 border-green-500 hover:border-[#ff6802]/50 hover:bg-orange-50 cursor-pointer";
                        }

                        return (
                          <button
                            key={id}
                            disabled={isOccupied || !isTripBookable}
                            onClick={() => {
                              setSelectedSeats(prev => {
                                if (prev.includes(id)) return prev.filter(s => s !== id);
                                if (prev.length >= 3) return prev;
                                return [...prev, id];
                              });
                            }}
                            className={baseClasses}
                          >
                            {id}
                          </button>
                        );
                      })}
                   </div>
                </div>
                
                <div className="text-center pt-6 border-t border-slate-100">
                   <p className="text-slate-500 font-bold mb-1 text-sm">Selected Seats: <span className="text-[#1d348a]">{selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}</span></p>
                   <p className="text-slate-500 font-bold text-sm">Number of Seats: <span className="text-[#1d348a]">{selectedSeats.length}</span></p>
                </div>
              </div>
            </section>

            {/* Features (Bottom) */}
            <section className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 hover:border-[#ff6802]/30 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
                  <Fan className="w-5 h-5 text-[#1d348a]" />
                </div>
                <h3 className="font-extrabold text-[#1d348a] text-sm mb-1">Climate Control</h3>
                <p className="text-xs text-slate-500 font-bold leading-relaxed">Adjustable AC vents at each seat.</p>
              </div>
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 hover:border-[#ff6802]/30 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center mb-3">
                   <Zap className="w-5 h-5 text-[#ff6802]" />
                </div>
                <h3 className="font-extrabold text-[#1d348a] text-sm mb-1">Fast Charging</h3>
                <p className="text-xs text-slate-500 font-bold leading-relaxed">Type-C and USB charging ports.</p>
              </div>
            </section>
          </div>

          {/* RIGHT SECTION - Summaries and Actions (Desktop) */}
          <div className="lg:col-span-4 flex flex-col space-y-6 lg:sticky lg:top-6">
            
            {/* Trip & Fare Summary */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 relative">
               <h3 className="font-black text-lg text-[#1d348a] mb-5">Trip & Fare Summary</h3>
               <div className="space-y-3 text-sm font-semibold text-slate-600">
                 <div className="flex justify-between items-start">
                   <span className="text-slate-400">Bus:</span>
                   <span className="text-right">{trip.busType}</span>
                 </div>
                 <div className="flex justify-between items-start">
                   <span className="text-slate-400">Route:</span>
                   <span className="text-right">{trip.origin} &rarr; {trip.destination}</span>
                 </div>
                 <div className="flex justify-between items-start">
                   <span className="text-slate-400">Date:</span>
                   <span className="text-right">{trip.tripDate}</span>
                 </div>
                 <div className="flex justify-between items-start">
                   <span className="text-slate-400">Departure:</span>
                   <span className="text-right">{trip.departureTime}</span>
                 </div>
                 <div className="flex justify-between items-start">
                   <span className="text-slate-400">Status:</span>
                   <span className="text-right">{operationalStatus}</span>
                 </div>
                 <hr className="border-slate-100 my-2" />
                 <div className="flex justify-between items-start">
                   <span className="text-slate-400">Regular Fare/Seat:</span>
                   <span className="text-right">₱{fareSummary.regularFarePerSeat.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between items-start">
                   <span className="text-slate-400">Final Fare/Seat:</span>
                   <span className="text-right">₱{fareSummary.finalFarePerSeat.toFixed(2)}</span>
                 </div>
                 {fareSummary.discountApplied && (
                   <div className="flex justify-between items-start">
                     <span className="text-slate-400">Discount:</span>
                     <span className="text-right text-green-600">-{Math.round(fareSummary.discountRate * 100)}%</span>
                   </div>
                 )}
                 <div className="flex justify-between items-start">
                   <span className="text-slate-400">Drop-off:</span>
                   <span className="text-right">{selectedDropoffPoint}</span>
                 </div>
                 <div className="flex justify-between items-start">
                   <span className="text-slate-400">Seats Selected:</span>
                   <span className="text-right font-black text-[#1d348a]">{selectedSeats.length}</span>
                 </div>
                 <hr className="border-slate-100 my-2" />
                 <div className="flex justify-between items-end mt-4">
                   <span className="text-slate-500">Total Amount Due:</span>
                   <span className="text-2xl font-black text-[#ff6802]">₱{fareSummary.amountDue.toFixed(2)}</span>
                 </div>
               </div>
            </div>

            {/* Drop-off Point */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 relative">
              <h3 className="font-black text-[15px] text-[#1d348a] mb-2 flex items-center gap-2">
                Select Your Drop-off Point
              </h3>
              <p className="text-[11px] text-slate-400 font-bold mb-4">
                Your Destination:
              </p>
              <Select
                value={selectedDropoffPoint}
                onValueChange={(value) => setSelectedDropoffPoint(value as TerminalDestination)}
              >
                <SelectTrigger className="w-full bg-slate-100/70 py-6 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 focus:ring-[#1d348a]">
                  <SelectValue placeholder="Select your destination" />
                </SelectTrigger>
                <SelectContent>
                  {dropoffOptions.map((destination) => (
                    <SelectItem key={destination} value={destination}>
                      {destination}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-slate-400">
                This bus travels from {trip.origin} through all route destinations. Select where you want to get off.
              </p>
            </div>
            
            {/* Passenger Type */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 relative mb-4">
              <h3 className="font-black text-[15px] text-[#1d348a] mb-2 flex items-center gap-2">
                Select Passenger Type
              </h3>
              <p className="text-[11px] text-slate-400 font-bold mb-4">
                Passenger Type:
              </p>
              <Select
                value={selectedPassengerType}
                onValueChange={(value) => setSelectedPassengerType(value as PassengerType)}
              >
                <SelectTrigger className="w-full bg-slate-100/70 py-6 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 focus:ring-[#1d348a]">
                  <SelectValue placeholder="Passenger Type" />
                </SelectTrigger>
                <SelectContent>
                  {passengerTypes.map((passengerType) => (
                    <SelectItem key={passengerType} value={passengerType}>
                      {passengerTypeLabels[passengerType]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            
            {/* New Proceed to Payment Design */}
            <div className="sticky bottom-4 z-50 lg:static lg:bottom-auto lg:z-auto bg-white/95 backdrop-blur-xl lg:bg-white rounded-[2rem] p-6 shadow-[0_-10px_40px_rgb(0,0,0,0.08)] lg:shadow-sm border border-slate-200/60 lg:border-slate-100 overflow-hidden mt-2">
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#ff6802]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>   
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex flex-col">
                  <span className="text-[10px] md:text-xs font-black tracking-widest text-[#ff6802] uppercase">Your Selection</span>
                  <div className="flex flex-row items-center mt-1">
                    <span className="bg-[#ff6802]/10 text-[#ff6802] font-black px-3 py-1.5 rounded-[0.8rem] text-sm mr-3 border border-[#ff6802]/20">
                      {selectedSeats.length > 0 ? selectedSeats.length : '-'}
                    </span>
                      <span className="font-black text-2xl text-[#1d348a]">₱{fareSummary.amountDue.toFixed(2)}</span>
                  </div>
                </div>
                <div className="text-right flex flex-col">
                  <span className="text-[10px] md:text-xs font-black tracking-widest text-slate-400 uppercase">Est. Arrival</span>
                  <span className="font-black text-xl text-[#1d348a] mt-1">{trip.arrivalTime}</span>
                </div>
              </div>
              <Link
                href={paymentHref}
                className="w-full bg-[#1d348a] text-white font-extrabold px-6 py-4 rounded-2xl shadow-[0_8px_20px_rgb(29,52,138,0.15)] hover:-translate-y-0.5 transition-all text-base flex items-center justify-center gap-2"
                style={{ pointerEvents: selectedSeats.length > 0 && isTripBookable ? 'auto' : 'none', opacity: selectedSeats.length > 0 && isTripBookable ? 1 : 0.6 }}
              >
                {isTripBookable ? "Proceed to Payment" : "Bus Not Available for Booking"} <ArrowRight className="w-5 h-5" strokeWidth={3} />
              </Link>
            </div>

          </div>
        </div>
      </main>

      </div>
  );

}
