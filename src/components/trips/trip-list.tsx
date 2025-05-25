
"use client";

import React, { useMemo, useEffect, useState } from "react";
import type { Trip, FilterableBusType, BusType, TripDirection, FilterableTripDirection, PhysicalBusId, DisplayTripInfo, TripStatus, BadgeColorKey } from "@/types";
import { TripCard } from "./trip-card";
import { AlertTriangle, Info } from "lucide-react";
import { format, addHours, setHours, setMinutes, setSeconds, setMilliseconds, parse, addDays } from 'date-fns';

const TRAVEL_DURATION_HOURS = 4;
const PARK_DURATION_HOURS = 1;

// Define the 8 physical buses and their initial Mantalongon departure.
const PHYSICAL_BUS_SCHEDULES: Array<{
  physicalBusId: PhysicalBusId;
  busType: BusType;
  mantalongonDepartureTime: string; // HH:mm format
  busPlateNumber: string;
}> = [
  { physicalBusId: "TRAD-001", busType: "Traditional", mantalongonDepartureTime: "02:45", busPlateNumber: "BUS-MTC-0245" },
  { physicalBusId: "TRAD-002", busType: "Traditional", mantalongonDepartureTime: "03:20", busPlateNumber: "BUS-MTC-0320" },
  { physicalBusId: "TRAD-003", busType: "Traditional", mantalongonDepartureTime: "04:00", busPlateNumber: "BUS-MTC-0400" },
  { physicalBusId: "TRAD-004", busType: "Traditional", mantalongonDepartureTime: "05:30", busPlateNumber: "BUS-MTC-0530" },
  { physicalBusId: "AC-001",   busType: "Airconditioned", mantalongonDepartureTime: "08:00", busPlateNumber: "BUS-MTC-0800-AC" },
  { physicalBusId: "TRAD-005", busType: "Traditional", mantalongonDepartureTime: "11:30", busPlateNumber: "BUS-MTC-1130" },
  { physicalBusId: "TRAD-006", busType: "Traditional", mantalongonDepartureTime: "12:00", busPlateNumber: "BUS-MTC-1200" },
  { physicalBusId: "TRAD-007", busType: "Traditional", mantalongonDepartureTime: "13:00", busPlateNumber: "BUS-MTC-1300" },
];

const generateTodaysTrips = (): Trip[] => {
  const allTripLegs: Trip[] = [];
  const today = new Date(); // "Today" is determined when the module loads

  PHYSICAL_BUS_SCHEDULES.forEach(busSchedule => {
    const [outboundHours, outboundMinutes] = busSchedule.mantalongonDepartureTime.split(':').map(Number);
    let outboundDepartureDateTime = setHours(setMinutes(setSeconds(setMilliseconds(new Date(today), 0), 0), outboundMinutes), outboundHours);
    
    // Simplified date adjustment: if the time is for early AM and we are late PM, assume next day.
    // This is a very basic way to handle "today's schedule might mean tomorrow morning".
    if (outboundDepartureDateTime.getTime() < today.getTime() && Math.abs(outboundDepartureDateTime.getTime() - today.getTime()) > 12 * 60 * 60 * 1000) {
      outboundDepartureDateTime = addDays(outboundDepartureDateTime, 1);
    }

    let outboundArrivalDateTime = addHours(outboundDepartureDateTime, TRAVEL_DURATION_HOURS);

    const totalSeats = busSchedule.busType === "Airconditioned" ? 65 : 53;
    const busNumericId = parseInt(busSchedule.physicalBusId.replace(/[^0-9]/g, ''), 10) || 1;
    // Deterministic seat availability for consistency
    const availableSeatsForType = busSchedule.busType === "Airconditioned"
        ? (40 + (busNumericId % 25)) 
        : (25 + (busNumericId % 28));
    const price = busSchedule.busType === "Airconditioned" ? 200 : 180;

    // Outbound Leg (Mantalongon -> Cebu)
    const outboundTripLeg: Trip = {
      id: `${busSchedule.physicalBusId}-MtoC-${format(outboundDepartureDateTime, "yyyyMMddHHmm")}`,
      physicalBusId: busSchedule.physicalBusId,
      direction: "Mantalongon_to_Cebu",
      origin: "Mantalongon",
      destination: "Cebu City",
      departureTime: format(outboundDepartureDateTime, "HH:mm"), // Use formatted time from date object
      arrivalTime: format(outboundArrivalDateTime, "HH:mm"),
      busType: busSchedule.busType,
      price: price,
      tripDate: format(outboundDepartureDateTime, "yyyy-MM-dd"),
      departureTimestamp: outboundDepartureDateTime.getTime(),
      arrivalTimestamp: outboundArrivalDateTime.getTime(),
      availableSeats: Math.min(totalSeats, Math.max(5, availableSeatsForType)),
      totalSeats: totalSeats,
      busPlateNumber: busSchedule.busPlateNumber,
      travelDurationMins: TRAVEL_DURATION_HOURS * 60,
      stopoverDurationMins: PARK_DURATION_HOURS * 60,
    };
    allTripLegs.push(outboundTripLeg);

    // Derived Return Leg (Cebu -> Mantalongon)
    let returnDepartureDateTime = addHours(outboundArrivalDateTime, PARK_DURATION_HOURS);
    let returnArrivalDateTime = addHours(returnDepartureDateTime, TRAVEL_DURATION_HOURS);

    const returnTripLeg: Trip = {
      id: `${busSchedule.physicalBusId}-CtoM-${format(returnDepartureDateTime, "yyyyMMddHHmm")}`,
      physicalBusId: busSchedule.physicalBusId,
      direction: "Cebu_to_Mantalongon",
      origin: "Cebu City",
      destination: "Mantalongon",
      departureTime: format(returnDepartureDateTime, "HH:mm"),
      arrivalTime: format(returnArrivalDateTime, "HH:mm"),
      busType: busSchedule.busType,
      price: price, // Assuming same price for return
      tripDate: format(returnDepartureDateTime, "yyyy-MM-dd"),
      departureTimestamp: returnDepartureDateTime.getTime(),
      arrivalTimestamp: returnArrivalDateTime.getTime(),
      availableSeats: Math.min(totalSeats, Math.max(5, availableSeatsForType)), // Same availability for simplicity
      totalSeats: totalSeats,
      busPlateNumber: busSchedule.busPlateNumber,
      travelDurationMins: TRAVEL_DURATION_HOURS * 60,
      stopoverDurationMins: PARK_DURATION_HOURS * 60,
    };
    allTripLegs.push(returnTripLeg);
  });

  // Sort all legs chronologically by their departure time
  allTripLegs.sort((a, b) => a.departureTimestamp - b.departureTimestamp);
  return allTripLegs;
};

// Generate all possible trip legs for today once when the module loads
const ALL_POSSIBLE_TRIP_LEGS_TODAY = generateTodaysTrips();


interface TripListProps {
  activeBusTypeFilter: FilterableBusType;
  activeDirectionFilter: FilterableTripDirection;
}

export function TripList({ activeBusTypeFilter, activeDirectionFilter }: TripListProps) {
  const [currentTime, setCurrentTime] = useState<number | null>(null);

  useEffect(() => {
    // Set current time only on the client after the initial mount
    setCurrentTime(new Date().getTime());

    const timerId = setInterval(() => {
      setCurrentTime(new Date().getTime());
    }, 30000); // Update status every 30 seconds

    return () => clearInterval(timerId);
  }, []);

  const displayableBusStates = useMemo(() => {
    const representations: DisplayTripInfo[] = [];
    const now = currentTime; // Use state variable

    PHYSICAL_BUS_SCHEDULES.forEach(busSched => {
      const mToCLeg = ALL_POSSIBLE_TRIP_LEGS_TODAY.find(
        leg => leg.physicalBusId === busSched.physicalBusId && leg.direction === "Mantalongon_to_Cebu"
      );
      const cToMLeg = ALL_POSSIBLE_TRIP_LEGS_TODAY.find(
        leg => leg.physicalBusId === busSched.physicalBusId && leg.direction === "Cebu_to_Mantalongon"
      );

      if (!mToCLeg || !cToMLeg) {
        console.warn(`Missing legs for physicalBusId: ${busSched.physicalBusId} in TripList`);
        return;
      }
      
      let representativeLeg: Trip;
      let currentDisplayStatus: TripStatus;
      let currentBadgeColorKey: BadgeColorKey;

      if (now === null) { // Initial render (server or before client effect)
        representativeLeg = mToCLeg;
        currentDisplayStatus = "Scheduled";
        currentBadgeColorKey = "blue";
      } else { // Client-side dynamic status calculation
        // Adjust timestamps for today/tomorrow to handle midnight rollover for comparison
        const adjustToCurrentDayCycle = (timestamp: number, baseDate: Date) => {
            const legDate = new Date(timestamp);
            const baseDateStartOfDay = setHours(setMinutes(setSeconds(setMilliseconds(new Date(baseDate),0),0),0),0);
            
            if (legDate.getTime() < baseDateStartOfDay.getTime()) { // If leg's original date is before today (e.g. from yesterday's generation)
                const tempLegDate = new Date(legDate);
                tempLegDate.setFullYear(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate()); // Set to today
                 // If this "today" time is still far in the past (e.g. 2 AM leg, current time 11 PM), assume it's for next day
                if (tempLegDate.getTime() < baseDate.getTime() - (18 * 60 * 60 * 1000)) { 
                    return addDays(tempLegDate, 1).getTime();
                }
                return tempLegDate.getTime();
            }
            // If leg's date is today or future, no major adjustment beyond ensuring it's not stale from generation
            // This simplified logic assumes schedules repeat daily.
            const tempLegDateToday = new Date(legDate);
            tempLegDateToday.setFullYear(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());

            if(tempLegDateToday.getTime() < baseDate.getTime() - (18*60*60*1000) && tempLegDateToday.getHours() < 6){
                return addDays(tempLegDateToday, 1).getTime();
            }
            return tempLegDateToday.getTime();

        };
        
        const todayDate = new Date(now);
        const currentMtoCDeparture = adjustToCurrentDayCycle(mToCLeg.departureTimestamp, todayDate);
        const currentMtoCArrival = addHours(currentMtoCDeparture, TRAVEL_DURATION_HOURS).getTime();
        const currentCtoMDeparture = addHours(currentMtoCDeparture, TRAVEL_DURATION_HOURS + PARK_DURATION_HOURS).getTime();
        const currentCtoMArrival = addHours(currentMtoCDeparture, (TRAVEL_DURATION_HOURS * 2) + PARK_DURATION_HOURS).getTime();


        if (now < currentMtoCDeparture) {
            representativeLeg = mToCLeg; // Show MtoC leg
            representativeLeg.departureTimestamp = currentMtoCDeparture; // Ensure leg uses adjusted time
            representativeLeg.arrivalTimestamp = currentMtoCArrival;
            currentDisplayStatus = "Scheduled";
            currentBadgeColorKey = "blue";
        } else if (now < currentMtoCArrival) {
            representativeLeg = mToCLeg;
            representativeLeg.departureTimestamp = currentMtoCDeparture;
            representativeLeg.arrivalTimestamp = currentMtoCArrival;
            currentDisplayStatus = "Travelling";
            currentBadgeColorKey = "green";
        } else if (now < currentCtoMDeparture) {
            representativeLeg = cToMLeg; // Show CtoM leg as it's the next event
            representativeLeg.departureTimestamp = currentCtoMDeparture; // Ensure leg uses adjusted time
            representativeLeg.arrivalTimestamp = currentCtoMArrival;
            currentDisplayStatus = "Scheduled"; // It's parked in Cebu, scheduled for return
            currentBadgeColorKey = "blue";
        } else if (now < currentCtoMArrival) {
            representativeLeg = cToMLeg;
            representativeLeg.departureTimestamp = currentCtoMDeparture;
            representativeLeg.arrivalTimestamp = currentCtoMArrival;
            currentDisplayStatus = "Returning";
            currentBadgeColorKey = "orange";
        } else {
            representativeLeg = cToMLeg;
            representativeLeg.departureTimestamp = currentCtoMDeparture;
            representativeLeg.arrivalTimestamp = currentCtoMArrival;
            currentDisplayStatus = "Completed for Day";
            currentBadgeColorKey = "gray";
        }
      }
      
      const displayInfo: DisplayTripInfo = {
        ...representativeLeg, // Spread properties of the chosen leg
        displayStatus: currentDisplayStatus,
        badgeColorKey: currentBadgeColorKey,
      };

      const busTypeMatch = activeBusTypeFilter === "all" || displayInfo.busType === activeBusTypeFilter;
      const directionMatch = activeDirectionFilter === "all" || displayInfo.direction === activeDirectionFilter;

      if (busTypeMatch && directionMatch) {
        representations.push(displayInfo);
      }
    });
    
    // Stable sort for initial render, dynamic sort for client-side updates
    if (now === null) {
        representations.sort((a,b) => {
            const schedA = PHYSICAL_BUS_SCHEDULES.find(s => s.physicalBusId === a.physicalBusId)!;
            const schedB = PHYSICAL_BUS_SCHEDULES.find(s => s.physicalBusId === b.physicalBusId)!;
            return schedA.mantalongonDepartureTime.localeCompare(schedB.mantalongonDepartureTime);
        });
    } else {
         representations.sort((a,b) => {
            // Sort by status primarily: Scheduled, Travelling, Returning, Completed
            const statusOrder: Record<TripStatus, number> = {
                "Scheduled": 1,
                "Travelling": 2,
                "Parked at Destination": 3, // This status is not used in this logic path anymore
                "Returning": 4,
                "Completed for Day": 5,
            };
            if (statusOrder[a.displayStatus] !== statusOrder[b.displayStatus]) {
                return statusOrder[a.displayStatus] - statusOrder[b.displayStatus];
            }
            // Then by departure time of the representative leg
            return a.departureTimestamp - b.departureTimestamp;
        });
    }
    return representations;

  }, [activeBusTypeFilter, activeDirectionFilter, currentTime]);

  if (currentTime === null && displayableBusStates.length === 0 && typeof window !== 'undefined' && (activeBusTypeFilter !== "all" || activeDirectionFilter !== "all")) {
    // Only show "No buses match" on client if filters are active and lead to empty list,
    // or if currentTime is null (initial server render potentially) and still nothing.
     return (
      <div className="text-center py-10 text-muted-foreground">
        <Info className="mx-auto h-12 w-12 mb-4" />
        <p className="text-xl">No buses match the current filters or schedule.</p>
        <p>Please check back later or adjust your filters.</p>
      </div>
    );
  }

  if (displayableBusStates.length === 0) {
     return <div className="text-center py-10 text-muted-foreground">Loading trips...</div>;
  }


  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {displayableBusStates.map((displayTrip) => (
        <TripCard key={`${displayTrip.physicalBusId}-${displayTrip.direction}-${displayTrip.departureTime}-${displayTrip.tripDate}`} trip={displayTrip} />
      ))}
    </div>
  );
}
