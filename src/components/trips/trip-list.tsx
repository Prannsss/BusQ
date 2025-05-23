
import React from "react"; // Added for React.useMemo
import type { Trip, FilterableBusType, TripStatus, BusType, TripDirection, FilterableTripDirection } from "@/types";
import { TripCard } from "./trip-card";
import { AlertTriangle } from "lucide-react";
import { format, addMinutes, setHours, setMinutes, setSeconds, setMilliseconds } from 'date-fns';

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
const STOPOVER_DURATION_MINS = 60; // 1 hour (Not directly used for status calculation here but part of Trip type)

// Function to generate trips for the current day
const generateTodaysTrips = (): Trip[] => {
  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");
  const allTrips: Trip[] = [];
  let tripIdCounter = 1;

  // Helper to create a single trip instance
  const createTrip = (
    departureTimeStr: string,
    busType: BusType,
    direction: TripDirection,
    origin: string,
    destination: string, 
    currentTripId: number
  ): Trip => {
    const [hours, minutes] = departureTimeStr.split(':').map(Number);
    
    let departureDateTime = setHours(today, hours);
    departureDateTime = setMinutes(departureDateTime, minutes);
    departureDateTime = setSeconds(departureDateTime, 0);
    departureDateTime = setMilliseconds(departureDateTime, 0);
    
    const arrivalDateTime = addMinutes(departureDateTime, TRAVEL_DURATION_MINS);
    
    const totalSeatsForType = busType === "Airconditioned" ? 65 : 53;
    // Deterministic available seats based on tripIdCounter
    const baseAvailableSeats = busType === "Airconditioned" ? (40 + (currentTripId % 25)) : (30 + (currentTripId % 23));
    const availableSeatsForType = Math.max(0, Math.min(totalSeatsForType, baseAvailableSeats));

    // Deterministic price
    const finalPrice = busType === "Airconditioned" ? 200 : 180;

    return {
      id: `trip-${currentTripId}`,
      busId: `bus-${currentTripId % 100 + 1}`,
      direction,
      origin,
      destination, 
      departureTime: departureTimeStr, 
      arrivalTime: format(arrivalDateTime, "HH:mm"),
      travelDurationMins: TRAVEL_DURATION_MINS,
      stopoverDurationMins: STOPOVER_DURATION_MINS,
      busType: busType,
      availableSeats: availableSeatsForType,
      totalSeats: totalSeatsForType,
      price: finalPrice, 
      tripDate: todayStr,
      // status: currentStatus, // Status will be derived client-side in TripCard
      busPlateNumber: `XYZ ${currentTripId % 100}${currentTripId % 10}`,
      departureTimestamp: departureDateTime.getTime(),
      arrivalTimestamp: arrivalDateTime.getTime(),
    };
  };

  // Generate trips from Mantalongon to Cebu City
  FIXED_SCHEDULE_MANTALONGON_TO_CEBU.forEach(item => {
    allTrips.push(createTrip(item.time, item.busType, "Mantalongon_to_Cebu", "Mantalongon", "Cebu City", tripIdCounter++));
  });

  // Generate trips from Cebu City to Mantalongon
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
  activeDirectionFilter: FilterableTripDirection;
}

export function TripList({ activeBusTypeFilter, activeDirectionFilter }: TripListProps) {
  const filteredTrips = React.useMemo(() => {
    return mockTrips.filter(trip => {
      const busTypeMatch = activeBusTypeFilter === "all" || trip.busType === activeBusTypeFilter;
      const directionMatch = activeDirectionFilter === "all" || trip.direction === activeDirectionFilter;
      return busTypeMatch && directionMatch;
    });
  }, [activeBusTypeFilter, activeDirectionFilter]); 

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
