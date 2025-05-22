
export type BusType = "Traditional" | "Airconditioned";
export type FilterableBusType = BusType | "all";

export type TripDirection = "Mantalongon_to_Cebu" | "Cebu_to_Mantalongon";
export type FilterableTripDirection = TripDirection | "all";

// Valid drop-off points for trips originating from Mantalongon
export const mantalongonRouteStops = [
  "Dalaguete",
  "Argao",
  "Sibonga", // "Sibonga (includes Simala)" - represented as Sibonga
  "Carcar City",
  "San Fernando",
  "Naga City",
  "Minglanilla",
  "Talisay City",
  "Cebu City", // Final destination
] as const;
export type MantalongonRouteStop = typeof mantalongonRouteStops[number];

// Valid drop-off points for trips originating from Cebu City
export const cebuRouteStops = [
  "Talisay City",
  "Minglanilla",
  "Naga City",
  "San Fernando",
  "Carcar City",
  "Sibonga", // "Sibonga (includes Simala)" - represented as Sibonga
  "Argao",
  "Dalaguete",
  "Mantalongon", // Final destination
] as const;
export type CebuRouteStop = typeof cebuRouteStops[number];


export type TripStatus = "Scheduled" | "On Standby" | "Travelling" | "Completed" | "Cancelled" | "Parked";

export interface Trip {
  id: string;
  busId?: string;
  direction: TripDirection;
  origin: string; // Starting point of the bus route
  destination: string; // Final destination of the bus route
  departureTime: string;
  arrivalTime: string;
  travelDurationMins: number;
  stopoverDurationMins: number;
  busType: BusType;
  availableSeats: number;
  totalSeats: number;
  price: number; // Price for the full route to final destination
  tripDate: string;
  status: TripStatus;
  busPlateNumber?: string;
}

export type SeatStatus = "available" | "selected" | "reserved";

export interface Seat {
  id: string;
  label: string;
  status: SeatStatus;
  price?: number;
}

export interface SeatLayout {
  mainSeatRows: (Seat | null)[][];
  rearBenchRow: (Seat | null)[];
}

export interface Reservation {
  id: string;
  passengerName: string;
  tripId: string;
  seatNumbers: string[];
  busType: BusType;
  departureTime: string;
  totalAmount: number;
  origin?: string; // Added for clarity on receipt
  selectedDestination: string; // User's actual chosen drop-off point
  tripDate?: string; // Added for clarity on receipt
}

export interface User {
  id: string;
  email: string;
  name?: string;
}
