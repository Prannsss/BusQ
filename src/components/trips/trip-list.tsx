
import React, { useMemo, useEffect, useState } from "react";
import type { Trip, FilterableBusType, BusType, TripDirection, FilterableTripDirection, PhysicalBusId, DisplayTripInfo, TripStatus, BadgeColorKey } from "@/types";
import { TripCard } from "./trip-card";
import { AlertTriangle } from "lucide-react";
import { format, addHours, setHours, setMinutes, setSeconds, setMilliseconds, parse } from 'date-fns';

const TRAVEL_DURATION_HOURS = 4;
const PARK_DURATION_HOURS = 1; // 1 hour break at destination

// Define the 8 physical buses and their initial Mantalongon departure time
const PHYSICAL_BUS_SCHEDULES: Array<{
  physicalBusId: PhysicalBusId;
  busType: BusType;
  mantalongonDepartureTime: string; // HH:mm format
}> = [
  { physicalBusId: "TRAD-001", busType: "Traditional", mantalongonDepartureTime: "02:45" },
  { physicalBusId: "TRAD-002", busType: "Traditional", mantalongonDepartureTime: "03:20" },
  { physicalBusId: "TRAD-003", busType: "Traditional", mantalongonDepartureTime: "04:00" },
  { physicalBusId: "TRAD-004", busType: "Traditional", mantalongonDepartureTime: "05:30" },
  { physicalBusId: "AC-001", busType: "Airconditioned", mantalongonDepartureTime: "08:00" },
  { physicalBusId: "TRAD-005", busType: "Traditional", mantalongonDepartureTime: "11:30" },
  { physicalBusId: "TRAD-006", busType: "Traditional", mantalongonDepartureTime: "12:00" },
  { physicalBusId: "TRAD-007", busType: "Traditional", mantalongonDepartureTime: "13:00" },
];

// Function to generate all trip legs (outbound and return) for the current day for all physical buses
const generateTodaysTrips = (): Trip[] => {
  const allTripLegs: Trip[] = [];
  const today = new Date(); // Represents the start of "today" for scheduling purposes

  PHYSICAL_BUS_SCHEDULES.forEach(busSchedule => {
    const todayStr = format(today, "yyyy-MM-dd"); // Base date for trip legs

    // 1. Outbound Trip (Mantalongon to Cebu)
    const [outboundHours, outboundMinutes] = busSchedule.mantalongonDepartureTime.split(':').map(Number);
    let outboundDepartureDateTime = setHours(setMinutes(setSeconds(setMilliseconds(new Date(today), 0), 0), outboundMinutes), outboundHours);
    
    // If outboundDepartureDateTime is in the past relative to 'today's start + actual time', advance to next day's schedule
    // This logic is more complex for multi-day views. For "today's trips", we assume it's for the current calendar day.
    // If it's 1 AM and a bus departs 2:45 AM, its `outboundDepartureDateTime` is `today` at 2:45 AM.
    // If it's 3 AM and a bus departs 2:45 AM, this function would still generate it for `today` at 2:45 AM.
    // The filtering logic later will determine its status as "Travelling" or "Parked".

    let outboundArrivalDateTime = addHours(outboundDepartureDateTime, TRAVEL_DURATION_HOURS);

    const outboundTripLeg: Trip = {
      id: `${busSchedule.physicalBusId}-MtoC-${format(outboundDepartureDateTime, "yyyyMMddHHmm")}`,
      physicalBusId: busSchedule.physicalBusId,
      direction: "Mantalongon_to_Cebu",
      origin: "Mantalongon",
      destination: "Cebu City",
      departureTime: busSchedule.mantalongonDepartureTime,
      arrivalTime: format(outboundArrivalDateTime, "HH:mm"),
      busType: busSchedule.busType,
      price: busSchedule.busType === "Airconditioned" ? 200 : 180,
      tripDate: format(outboundDepartureDateTime, "yyyy-MM-dd"),
      departureTimestamp: outboundDepartureDateTime.getTime(),
      arrivalTimestamp: outboundArrivalDateTime.getTime(),
      availableSeats: busSchedule.busType === "Airconditioned" ? (45 + (parseInt(busSchedule.physicalBusId.slice(-3)) % 20)) : (30 + (parseInt(busSchedule.physicalBusId.slice(-3)) % 23)),
      totalSeats: busSchedule.busType === "Airconditioned" ? 65 : 53,
      busPlateNumber: `BUS-${busSchedule.physicalBusId.slice(-3)}`, // Example plate
      travelDurationMins: TRAVEL_DURATION_HOURS * 60,
      stopoverDurationMins: PARK_DURATION_HOURS * 60,
    };
    allTripLegs.push(outboundTripLeg);

    // 2. Return Trip (Cebu to Mantalongon) for the same physical bus
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
      price: busSchedule.busType === "Airconditioned" ? 200 : 180, // Symmetric pricing
      tripDate: format(returnDepartureDateTime, "yyyy-MM-dd"), // Date of the return departure
      departureTimestamp: returnDepartureDateTime.getTime(),
      arrivalTimestamp: returnArrivalDateTime.getTime(),
      availableSeats: outboundTripLeg.availableSeats, // Assuming same availability for simplicity
      totalSeats: outboundTripLeg.totalSeats,
      busPlateNumber: outboundTripLeg.busPlateNumber,
      travelDurationMins: TRAVEL_DURATION_HOURS * 60,
      stopoverDurationMins: PARK_DURATION_HOURS * 60, // Not strictly applicable for return leg's end
    };
    allTripLegs.push(returnTripLeg);
  });
  
  // Sort all trip legs chronologically by their departure timestamp
  allTripLegs.sort((a, b) => a.departureTimestamp - b.departureTimestamp);
  
  return allTripLegs;
};


interface TripListProps {
  activeBusTypeFilter: FilterableBusType;
  activeDirectionFilter: FilterableTripDirection;
}

export function TripList({ activeBusTypeFilter, activeDirectionFilter }: TripListProps) {
  const [isClient, setIsClient] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().getTime());

  // Memoize the generation of all possible trip legs for today
  const allPossibleTripLegsToday = useMemo(() => generateTodaysTrips(), []);

  useEffect(() => {
    setIsClient(true);
    // Update current time every 30 seconds to refresh statuses
    const timerId = setInterval(() => {
      setCurrentTime(new Date().getTime());
    }, 30000); // 30 seconds
    return () => clearInterval(timerId);
  }, []);

  const displayableBusStates = useMemo(() => {
    const now = currentTime; // Use state for current time to trigger re-memoization
    const representations: DisplayTripInfo[] = [];

    PHYSICAL_BUS_SCHEDULES.forEach(busSched => {
      const mToCLeg = allPossibleTripLegsToday.find(
        leg => leg.physicalBusId === busSched.physicalBusId && leg.direction === "Mantalongon_to_Cebu"
      );
      const cToMLeg = allPossibleTripLegsToday.find(
        leg => leg.physicalBusId === busSched.physicalBusId && leg.direction === "Cebu_to_Mantalongon"
      );

      if (!mToCLeg || !cToMLeg) {
        // Should not happen if generateTodaysTrips is correct
        console.warn(`Missing legs for physicalBusId: ${busSched.physicalBusId}`);
        return;
      }

      let representativeLeg: Trip;
      let displayStatus: TripStatus;
      let badgeColorKey: BadgeColorKey;

      if (now < mToCLeg.departureTimestamp) {
        representativeLeg = mToCLeg;
        displayStatus = "Scheduled";
        badgeColorKey = "blue";
      } else if (now < mToCLeg.arrivalTimestamp) {
        representativeLeg = mToCLeg;
        displayStatus = "Travelling";
        badgeColorKey = "green";
      } else if (now < cToMLeg.departureTimestamp) { // Parked at Destination (Cebu)
        representativeLeg = mToCLeg; // Base info on the leg that just completed
        displayStatus = "Parked at Destination";
        badgeColorKey = "yellow";
      } else if (now < cToMLeg.arrivalTimestamp) {
        representativeLeg = cToMLeg;
        displayStatus = "Returning";
        badgeColorKey = "orange";
      } else { // Completed for Day (Parked at Origin - Mantalongon)
        representativeLeg = cToMLeg; // Base info on the leg that just completed
        displayStatus = "Completed for Day";
        badgeColorKey = "gray";
      }
      
      const displayTrip: DisplayTripInfo = {
        ...representativeLeg,
        displayStatus,
        badgeColorKey,
      };
      representations.push(displayTrip);
    });

    // Apply user filters
    const filteredRepresentations = representations.filter(displayTrip => {
      const busTypeMatch = activeBusTypeFilter === "all" || displayTrip.busType === activeBusTypeFilter;
      
      // Filter based on the direction of the *representative leg* being shown
      const directionMatch = activeDirectionFilter === "all" || displayTrip.direction === activeDirectionFilter;
      
      return busTypeMatch && directionMatch;
    });
    
    // Sort final displayable trips by the departure timestamp of their representative leg
    // Or, if "Scheduled" is primary, sort by that, then by others.
    // For now, sort by departure time of the represented leg.
    filteredRepresentations.sort((a,b) => {
        // Prioritize "Scheduled" trips first
        if (a.displayStatus === "Scheduled" && b.displayStatus !== "Scheduled") return -1;
        if (a.displayStatus !== "Scheduled" && b.displayStatus === "Scheduled") return 1;
        // Then sort by departure time of the current leg
        return a.departureTimestamp - b.departureTimestamp;
    });

    return filteredRepresentations;

  }, [allPossibleTripLegsToday, activeBusTypeFilter, activeDirectionFilter, currentTime]); // Re-run when currentTime changes

  if (!isClient) {
     return <div className="text-center py-10 text-muted-foreground">Loading trips...</div>;
  }

  if (displayableBusStates.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <AlertTriangle className="mx-auto h-12 w-12 mb-4" />
        <p className="text-xl">No buses match the current filters or all trips for today are completed.</p>
        <p>Please check back later or adjust your filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {displayableBusStates.map((displayTrip) => (
        // The key should be stable for the bus, even if its representative leg changes.
        // Using physicalBusId ensures the card doesn't re-mount unnecessarily if just status changes.
        <TripCard key={displayTrip.physicalBusId} trip={displayTrip} />
      ))}
    </div>
  );
}
