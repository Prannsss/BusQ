
import React from "react"; // Added for React.useMemo
import type { Trip, FilterableBusType, TripStatus, BusType, TripDirection } from "@/types";
import { TripCard } from "./trip-card";
import { AlertTriangle } from "lucide-react";
import { format, addMinutes } from 'date-fns';

// Fixed Schedule Configuration
const FIXED_SCHEDULE_MANTALONGON_TO_CEBU: Array<{ time: string; busType: BusType }> = [
  { time: "02:45", busType: "Traditional" },
  { time: "03:20", busType: "Traditional" },
  { time: "04:00", busType: "Traditional" },
  { time: "05:30", busType: "Traditional" },
  { time: "08:00", busType: "Airconditioned" },
  { time: "11:30", busType: "Traditional" },
  { time: "12:00", busType: "Traditional" },
  { time: "13:00", busType: "Traditional" },
];

const FIXED_SCHEDULE_CEBU_TO_MANTALONGON: Array<{ time: string; busType: BusType }> = [
  { time: "07:00", busType: "Traditional" },
  { time: "08:00", busType: "Traditional" },
  { time: "09:00", busType: "Traditional" },
  { time: "12:00", busType: "Traditional" },
  { time: "13:00", busType: "Airconditioned" },
  { time: "17:00", busType: "Traditional" },
  { time: "18:00", busType: "Traditional" },
];

const TRAVEL_DURATION_MINS = 240; // 4 hours
const STOPOVER_DURATION_MINS = 60; // 1 hour

// Function to generate trips for the current day
const generateTodaysTrips = (): Trip[] => {
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const allTrips: Trip[] = [];
  let tripIdCounter = 1;

  // Helper to create a single trip instance
  const createTrip = (
    departureTimeStr: string,
    busType: BusType,
    direction: TripDirection,
    origin: string,
    destination: string, // This is now the final destination of the route
    currentTripId: number
  ): Trip => {
    const [hours, minutes] = departureTimeStr.split(':').map(Number);
    const departureDateTime = new Date(todayStr);
    departureDateTime.setHours(hours, minutes, 0, 0);
    
    const arrivalDateTime = addMinutes(departureDateTime, TRAVEL_DURATION_MINS);
    
    const totalSeatsForType = busType === "Airconditioned" ? 65 : 53;
    // Deterministic available seats based on tripIdCounter
    const baseAvailableSeats = busType === "Airconditioned" ? (40 + (currentTripId % 15)) : (30 + (currentTripId % 13));
    const availableSeatsForType = Math.max(0, Math.min(totalSeatsForType, baseAvailableSeats));

    // Deterministic price based on busType and tripId
    const basePrice = busType === "Airconditioned" ? 250 : 180;
    // Consistent variation based on tripId for deterministic pricing
    const priceVariation = (currentTripId * 17 % 30) -15; // e.g. range -15 to +14
    const finalPrice = parseFloat(Math.max(basePrice * 0.8, basePrice + priceVariation).toFixed(2));


    return {
      id: `trip-${currentTripId}`,
      busId: `bus-${currentTripId % 100 + 1}`,
      direction,
      origin,
      destination, // Final destination of this bus route
      departureTime: departureTimeStr, 
      arrivalTime: format(arrivalDateTime, "HH:mm"),
      travelDurationMins: TRAVEL_DURATION_MINS,
      stopoverDurationMins: STOPOVER_DURATION_MINS,
      busType: busType,
      availableSeats: availableSeatsForType,
      totalSeats: totalSeatsForType,
      price: finalPrice, 
      tripDate: todayStr,
      status: "Scheduled" as TripStatus, 
      busPlateNumber: `XYZ ${currentTripId % 100}${currentTripId % 10}`
    };
  };

  // Generate trips from Mantalongon to Cebu City (final destination)
  FIXED_SCHEDULE_MANTALONGON_TO_CEBU.forEach(item => {
    allTrips.push(createTrip(item.time, item.busType, "Mantalongon_to_Cebu", "Mantalongon", "Cebu City", tripIdCounter++));
  });

  // Generate trips from Cebu City to Mantalongon (final destination)
  FIXED_SCHEDULE_CEBU_TO_MANTALONGON.forEach(item => {
    allTrips.push(createTrip(item.time, item.busType, "Cebu_to_Mantalongon", "Cebu City", "Mantalongon", tripIdCounter++));
  });
  
  allTrips.sort((a, b) => {
    const timeComp = a.departureTime.localeCompare(b.departureTime);
    if (timeComp !== 0) return timeComp;
    const originComp = a.origin.localeCompare(b.origin);
    if (originComp !== 0) return originComp;
    return a.destination.localeCompare(b.destination);
  });
  
  return allTrips;
};

const mockTrips: Trip[] = generateTodaysTrips();

interface TripListProps {
  activeBusTypeFilter: FilterableBusType;
  activeDirectionFilter: TripDirection | "all";
}

export function TripList({ activeBusTypeFilter, activeDirectionFilter }: TripListProps) {
  // Memoize filteredTrips to avoid re-calculating on every render unless filter props change.
  // mockTrips itself is stable as it's defined at the module level.
  const filteredTrips = React.useMemo(() => {
    return mockTrips.filter(trip => {
      const busTypeMatch = activeBusTypeFilter === "all" || trip.busType === activeBusTypeFilter;
      const directionMatch = activeDirectionFilter === "all" || trip.direction === activeDirectionFilter;
      return busTypeMatch && directionMatch;
    });
  }, [activeBusTypeFilter, activeDirectionFilter]); // Dependencies are the filter props

  if (filteredTrips.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <AlertTriangle className="mx-auto h-12 w-12 mb-4" />
        <p className="text-xl">No trips available for the selected filters.</p>
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
