
import React, { useMemo, useEffect, useState } from "react";
import type { Trip, FilterableBusType, TripStatus, BusType, TripDirection, FilterableTripDirection, PhysicalBusId } from "@/types";
import { TripCard } from "./trip-card";
import { AlertTriangle } from "lucide-react";
import { format, addHours, setHours, setMinutes, setSeconds, setMilliseconds, parse } from 'date-fns';

// Define the base schedule for outbound trips from Mantalongon
const MANTALONGON_TO_CEBU_SCHEDULE_BASES: Array<{
  physicalBusId: PhysicalBusId; // Identifier for the actual bus
  departureTime: string; // HH:mm format for initial outbound leg
  busType: BusType;
}> = [
  { physicalBusId: "TRAD-001", departureTime: "02:45", busType: "Traditional" },
  { physicalBusId: "TRAD-002", departureTime: "03:20", busType: "Traditional" },
  { physicalBusId: "TRAD-003", departureTime: "04:00", busType: "Traditional" },
  { physicalBusId: "TRAD-004", departureTime: "05:30", busType: "Traditional" },
  { physicalBusId: "AC-001", departureTime: "08:00", busType: "Airconditioned" },
  { physicalBusId: "TRAD-005", departureTime: "11:30", busType: "Traditional" },
  { physicalBusId: "TRAD-006", departureTime: "12:00", busType: "Traditional" },
  { physicalBusId: "TRAD-007", departureTime: "13:00", busType: "Traditional" },
];

// Define which physical buses also have scheduled return trips from Cebu.
// This helps in cases where not all Mantalongon buses have an immediate scheduled return.
// For this iteration, we assume all buses listed above complete a round trip based on the +5hr logic.
// If specific return schedules were different, this map would be more complex.

const TRAVEL_DURATION_HOURS = 4;
const PARK_DURATION_HOURS = 1;

// Function to generate all trip legs (outbound and return) for the current day
const generateTodaysTrips = (): Trip[] => {
  const allTripLegs: Trip[] = [];
  const today = new Date();
  let uniqueTripIdCounter = 1; // For unique Trip.id

  MANTALONGON_TO_CEBU_SCHEDULE_BASES.forEach(baseSchedule => {
    const todayStr = format(today, "yyyy-MM-dd");

    // 1. Create Outbound Trip (Mantalongon to Cebu)
    const [outboundHours, outboundMinutes] = baseSchedule.departureTime.split(':').map(Number);
    let outboundDepartureDateTime = setHours(setMinutes(setSeconds(setMilliseconds(new Date(today), 0), 0), outboundMinutes), outboundHours);
    let outboundArrivalDateTime = addHours(outboundDepartureDateTime, TRAVEL_DURATION_HOURS);

    const outboundTrip: Trip = {
      id: `trip-${uniqueTripIdCounter++}`,
      physicalBusId: baseSchedule.physicalBusId,
      direction: "Mantalongon_to_Cebu",
      origin: "Mantalongon",
      destination: "Cebu City",
      departureTime: baseSchedule.departureTime,
      arrivalTime: format(outboundArrivalDateTime, "HH:mm"),
      busType: baseSchedule.busType,
      price: baseSchedule.busType === "Airconditioned" ? 200 : 180,
      tripDate: format(outboundDepartureDateTime, "yyyy-MM-dd"),
      departureTimestamp: outboundDepartureDateTime.getTime(),
      arrivalTimestamp: outboundArrivalDateTime.getTime(),
      availableSeats: baseSchedule.busType === "Airconditioned" ? (45 + (uniqueTripIdCounter % 20)) : (30 + (uniqueTripIdCounter % 23)),
      totalSeats: baseSchedule.busType === "Airconditioned" ? 65 : 53,
      busPlateNumber: `BUS-${baseSchedule.physicalBusId.slice(-3)}`,
      travelDurationMins: TRAVEL_DURATION_HOURS * 60,
      stopoverDurationMins: PARK_DURATION_HOURS * 60,
    };
    allTripLegs.push(outboundTrip);

    // 2. Create Return Trip (Cebu to Mantalongon) for the same physical bus
    let returnDepartureDateTime = addHours(outboundArrivalDateTime, PARK_DURATION_HOURS);
    // If return departure is for "tomorrow" based on simple addition, adjust its date.
    // For daily repeating schedules, this means its tripDate should be today if departure time is still today.
    if (format(returnDepartureDateTime, "yyyy-MM-dd") !== todayStr && returnDepartureDateTime.getHours() < outboundHours) {
        // This condition tries to catch if adding 5 hours pushed it to "next day" but conceptually it's a late trip for "today"
        // This might need more robust date handling for overnight parking and next-day scheduling.
        // For now, assume return trips are scheduled based on today's outbound.
    }
    
    let returnArrivalDateTime = addHours(returnDepartureDateTime, TRAVEL_DURATION_HOURS);

    const returnTrip: Trip = {
      id: `trip-${uniqueTripIdCounter++}`,
      physicalBusId: baseSchedule.physicalBusId,
      direction: "Cebu_to_Mantalongon",
      origin: "Cebu City",
      destination: "Mantalongon",
      departureTime: format(returnDepartureDateTime, "HH:mm"),
      arrivalTime: format(returnArrivalDateTime, "HH:mm"),
      busType: baseSchedule.busType,
      price: baseSchedule.busType === "Airconditioned" ? 200 : 180, // Symmetric pricing
      tripDate: format(returnDepartureDateTime, "yyyy-MM-dd"), // Date of the return departure
      departureTimestamp: returnDepartureDateTime.getTime(),
      arrivalTimestamp: returnArrivalDateTime.getTime(),
      availableSeats: baseSchedule.busType === "Airconditioned" ? (45 + (uniqueTripIdCounter % 20)) : (30 + (uniqueTripIdCounter % 23)),
      totalSeats: baseSchedule.busType === "Airconditioned" ? 65 : 53,
      busPlateNumber: `BUS-${baseSchedule.physicalBusId.slice(-3)}`,
      travelDurationMins: TRAVEL_DURATION_HOURS * 60,
      stopoverDurationMins: PARK_DURATION_HOURS * 60,
    };
    allTripLegs.push(returnTrip);
  });
  
  // Sort all trip legs chronologically by their departure timestamp
  allTripLegs.sort((a, b) => a.departureTimestamp - b.departureTimestamp);
  
  return allTripLegs;
};

// This is generated once per client session/page load.
const allPossibleTripLegsToday = generateTodaysTrips();

interface TripListProps {
  activeBusTypeFilter: FilterableBusType;
  activeDirectionFilter: FilterableTripDirection;
}

export function TripList({ activeBusTypeFilter, activeDirectionFilter }: TripListProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const filteredTrips = useMemo(() => {
    if (!isClient) { // Don't filter on server or before client hydration of status
      return [];
    }

    // Group all trip legs by their physicalBusId
    const tripsByPhysicalBus = allPossibleTripLegsToday.reduce((acc, trip) => {
      if (!acc[trip.physicalBusId]) {
        acc[trip.physicalBusId] = [];
      }
      acc[trip.physicalBusId].push(trip);
      return acc;
    }, {} as Record<PhysicalBusId, Trip[]>);

    const displayableTrips: Trip[] = [];
    const now = new Date().getTime();

    for (const physicalBusId in tripsByPhysicalBus) {
      const busLegs = tripsByPhysicalBus[physicalBusId as PhysicalBusId];
      // Legs are already sorted by departureTimestamp by generateTodaysTrips

      let nextScheduledLegForThisBus: Trip | null = null;

      for (const leg of busLegs) {
        // Determine current status of this leg
        let legStatus: TripStatus = "Scheduled"; // Default to scheduled
        if (now >= leg.departureTimestamp && now < leg.arrivalTimestamp) {
          legStatus = "Travelling";
        } else if (now >= leg.arrivalTimestamp) {
          legStatus = "Parked"; // Or "Completed" for its leg
        }
        // else it remains "Scheduled" (now < leg.departureTimestamp)

        if (legStatus === "Scheduled") {
          // Apply user's filters to this "Scheduled" leg
          const busTypeMatch = activeBusTypeFilter === "all" || leg.busType === activeBusTypeFilter;
          const directionMatch = activeDirectionFilter === "all" || leg.direction === activeDirectionFilter;
          
          if (busTypeMatch && directionMatch) {
            nextScheduledLegForThisBus = leg;
            break; // Found the first scheduled leg for this bus that matches filters
          }
        }
      }

      if (nextScheduledLegForThisBus) {
        displayableTrips.push(nextScheduledLegForThisBus);
      }
    }
    // Sort final displayable trips again, as different buses might have their next leg at different times
    displayableTrips.sort((a,b) => a.departureTimestamp - b.departureTimestamp);
    return displayableTrips;

  }, [activeBusTypeFilter, activeDirectionFilter, isClient]); 

  if (!isClient) {
     return <div className="text-center py-10 text-muted-foreground">Loading trips...</div>;
  }

  if (filteredTrips.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <AlertTriangle className="mx-auto h-12 w-12 mb-4" />
        <p className="text-xl">No trips available for the selected filters and current time.</p>
        <p>Please check back later or adjust your filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredTrips.map((trip) => (
        <TripCard key={trip.id} trip={trip} />
      ))}
    </div>
  );
}
