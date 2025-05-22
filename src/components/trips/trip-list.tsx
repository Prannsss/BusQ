
import type { Trip, FilterableBusType, TripStatus, BusType } from "@/types";
import { TripCard } from "./trip-card";
import { AlertTriangle } from "lucide-react";
import { format, addMinutes, parse } from 'date-fns';

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
      // Deterministic available seats to prevent hydration errors
      const availableSeatsForType = item.busType === "Airconditioned" 
        ? Math.max(0, Math.min(totalSeatsForType, (tripIdCounter * 7 % 60) + 5)) 
        : Math.max(0, Math.min(totalSeatsForType, (tripIdCounter * 5 % 50) + 3));
      
      // Deterministic price to prevent hydration errors
      const basePrice = item.busType === "Airconditioned" ? 250 : 180;
      const priceVariation = (tripIdCounter * 5 % 40) + 10; // Variation between 10 and 50
      const finalPrice = basePrice + priceVariation;

      allTrips.push({
        id: `trip-${tripIdCounter++}`,
        busId: `bus-${tripIdCounter % 100 + 1}`, // This Math.random is fine as busId is not directly causing hydration diffs in visible UI text
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
  // activeDirectionFilter: FilterableTripDirection; // Removed
}

export function TripList({ activeBusTypeFilter }: TripListProps) { // Removed activeDirectionFilter
  const filteredTrips = mockTrips.filter(trip => {
    const busTypeMatch = activeBusTypeFilter === "all" || trip.busType === activeBusTypeFilter;
    // const directionMatch = activeDirectionFilter === "all" || trip.direction === activeDirectionFilter; // Removed
    return busTypeMatch; // && directionMatch; // Removed
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

