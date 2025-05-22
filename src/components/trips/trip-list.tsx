
import type { Trip, FilterableBusType, TripStatus, BusType, FilterableTripDirection } from "@/types";
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

const FIXED_SCHEDULE_B_TO_A: Array<{ time: string; busType: BusType }> = [
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

  const createTripsForSchedule = (
    schedule: Array<{ time: string; busType: BusType }>,
    direction: Trip["direction"],
    origin: string,
    destination: string
  ) => {
    schedule.forEach(item => {
      const [hours, minutes] = item.time.split(':').map(Number);
      const departureDateTime = new Date(todayStr);
      departureDateTime.setHours(hours, minutes, 0, 0);
      
      const arrivalDateTime = addMinutes(departureDateTime, TRAVEL_DURATION_MINS);
      const totalSeatsForType = item.busType === "Airconditioned" ? 65 : 53;
      // Deterministic available seats
      const availableSeatsForType = item.busType === "Airconditioned" 
        ? Math.max(0, Math.min(totalSeatsForType, parseInt(tripIdCounter.toString().slice(-1) + "7", 10) % 60) + 5) // Example: id 1 -> 17%60+5
        : Math.max(0, Math.min(totalSeatsForType, parseInt(tripIdCounter.toString().slice(-1) + "5", 10) % 50) + 3); // Example: id 1 -> 15%50+3
      
      // Deterministic price
      const basePrice = item.busType === "Airconditioned" ? 250 : 180;
      // Use a simple modulo operation on tripIdCounter for price variation
      const priceVariation = (tripIdCounter * 13 % 41); // Variation between 0 and 40
      const finalPrice = basePrice + priceVariation;

      allTrips.push({
        id: `trip-${tripIdCounter++}`,
        busId: `bus-${tripIdCounter % 100 + 1}`,
        direction,
        origin,
        destination,
        departureTime: item.time, // Keep as "HH:mm"
        arrivalTime: format(arrivalDateTime, "HH:mm"),
        travelDurationMins: TRAVEL_DURATION_MINS,
        stopoverDurationMins: STOPOVER_DURATION_MINS,
        busType: item.busType,
        availableSeats: availableSeatsForType,
        totalSeats: totalSeatsForType,
        price: finalPrice, 
        tripDate: todayStr,
        status: "Scheduled" as TripStatus, // Initial status
        busPlateNumber: `XYZ ${tripIdCounter % 100}${tripIdCounter % 10}`
      });
    });
  };

  createTripsForSchedule(FIXED_SCHEDULE_A_TO_B, "Mantalongon_to_Cebu", "Mantalongon", "Cebu City");
  createTripsForSchedule(FIXED_SCHEDULE_B_TO_A, "Cebu_to_Mantalongon", "Cebu City", "Mantalongon");
  
  // Sort trips by departure time
  allTrips.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
  
  return allTrips;
};

const mockTrips: Trip[] = generateTodaysTrips();

interface TripListProps {
  activeBusTypeFilter: FilterableBusType;
  activeDirectionFilter: FilterableTripDirection;
}

export function TripList({ activeBusTypeFilter, activeDirectionFilter }: TripListProps) {
  const filteredTrips = mockTrips.filter(trip => {
    const busTypeMatch = activeBusTypeFilter === "all" || trip.busType === activeBusTypeFilter;
    const directionMatch = activeDirectionFilter === "all" || trip.direction === activeDirectionFilter;
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
