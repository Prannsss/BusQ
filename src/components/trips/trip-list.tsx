
import type { Trip, FilterableBusType, TripStatus, BusType, FilterableTripDirection, CebuDestination } from "@/types";
import { cebuDestinationsList } from "@/types";
import { TripCard } from "./trip-card";
import { AlertTriangle } from "lucide-react";
import { format, addMinutes } from 'date-fns';

// Fixed Schedule Configuration
const FIXED_SCHEDULE_A_TO_B: Array<{ time: string; busType: BusType }> = [
  { time: "02:45", busType: "Traditional" },
  { time: "03:20", busType: "Traditional" },
  { time: "04:00", busType: "Traditional" },
  { time: "05:30", busType: "Traditional" },
  { time: "08:00", busType: "Airconditioned" },
  { time: "11:30", busType: "Traditional" },
  { time: "12:00", busType: "Traditional" },
  { time: "13:00", busType: "Traditional" },
];

const FIXED_SCHEDULE_B_TO_A: Array<{ time: string; busType: BusType }> = [ // Schedule for routes FROM Cebu
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
    destination: string,
    currentTripId: number
  ): Trip => {
    const [hours, minutes] = departureTimeStr.split(':').map(Number);
    const departureDateTime = new Date(todayStr);
    departureDateTime.setHours(hours, minutes, 0, 0);
    
    const arrivalDateTime = addMinutes(departureDateTime, TRAVEL_DURATION_MINS);
    const totalSeatsForType = busType === "Airconditioned" ? 65 : 53;
    
    const availableSeatsForType = busType === "Airconditioned" 
      ? Math.max(0, Math.min(totalSeatsForType, (currentTripId * 7 % 60) + 5)) 
      : Math.max(0, Math.min(totalSeatsForType, (currentTripId * 5 % 50) + 3));
    
    const basePrice = busType === "Airconditioned" ? 250 : 180;
    const priceVariation = (currentTripId * 13 % 41); 
    const finalPrice = basePrice + priceVariation;

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
      status: "Scheduled" as TripStatus, 
      busPlateNumber: `XYZ ${currentTripId % 100}${currentTripId % 10}`
    };
  };

  // Generate trips from Mantalongon to Cebu City
  FIXED_SCHEDULE_A_TO_B.forEach(item => {
    allTrips.push(createTrip(item.time, item.busType, "Mantalongon_to_Cebu", "Mantalongon", "Cebu City", tripIdCounter++));
  });

  // Generate trips from Cebu City to various destinations
  FIXED_SCHEDULE_B_TO_A.forEach(item => {
    cebuDestinationsList.forEach(destinationTown => {
      allTrips.push(createTrip(item.time, item.busType, "Cebu_to_Mantalongon", "Cebu City", destinationTown, tripIdCounter++));
    });
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
  selectedCebuDestination: CebuDestination;
}

export function TripList({ activeBusTypeFilter, activeDirectionFilter, selectedCebuDestination }: TripListProps) {
  const filteredTrips = mockTrips.filter(trip => {
    const busTypeMatch = activeBusTypeFilter === "all" || trip.busType === activeBusTypeFilter;
    
    let directionMatch = false;
    if (activeDirectionFilter === "all") {
      directionMatch = true;
    } else if (activeDirectionFilter === "Mantalongon_to_Cebu") {
      directionMatch = trip.direction === "Mantalongon_to_Cebu";
    } else if (activeDirectionFilter === "Cebu_to_Mantalongon") { // This now means "Origin: Cebu"
      directionMatch = trip.origin === "Cebu City";
      if (directionMatch && selectedCebuDestination !== "all") {
        directionMatch = trip.destination === selectedCebuDestination;
      }
    }
    return busTypeMatch && directionMatch;
  });

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
