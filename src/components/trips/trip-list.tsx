import type { Trip, FilterableBusType } from "@/types";
import { TripCard } from "./trip-card";
import { AlertTriangle } from "lucide-react";

// Mock data for trips
const mockTrips: Trip[] = [
  {
    id: "1",
    departureTime: "08:00 AM",
    arrivalTime: "11:00 AM",
    busType: "Airconditioned",
    availableSeats: 50, // Example, could be dynamic
    totalSeats: 65,     // Updated: 5*12 main + 5 rear
    price: 250,
    origin: "Mantalongon",
    destination: "Cebu City",
    busPlateNumber: "XYZ 123"
  },
  {
    id: "2",
    departureTime: "09:30 AM",
    arrivalTime: "01:00 PM",
    busType: "Traditional",
    availableSeats: 40, // Example
    totalSeats: 53,     // Updated: 4*12 main + 5 rear
    price: 180,
    origin: "Mantalongon",
    destination: "Cebu City",
  },
  {
    id: "3",
    departureTime: "11:00 AM",
    arrivalTime: "02:30 PM",
    busType: "Airconditioned",
    availableSeats: 10, // Example
    totalSeats: 65,     // Updated
    price: 260,
    origin: "Mantalongon",
    destination: "Cebu City",
    busPlateNumber: "ABC 789"
  },
  {
    id: "4",
    departureTime: "01:00 PM",
    arrivalTime: "04:30 PM",
    busType: "Traditional",
    availableSeats: 53, // Example, full
    totalSeats: 53,     // Updated
    price: 180,
    origin: "Mantalongon",
    destination: "Cebu City",
  },
];

interface TripListProps {
  activeFilter: FilterableBusType;
}

export function TripList({ activeFilter }: TripListProps) {
  const filteredTrips = mockTrips.filter(trip => 
    activeFilter === "all" || trip.busType === activeFilter
  );

  if (filteredTrips.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <AlertTriangle className="mx-auto h-12 w-12 mb-4" />
        <p className="text-xl">No trips available for the selected filter.</p>
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
