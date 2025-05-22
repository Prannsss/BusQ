
export type BusType = "Traditional" | "Airconditioned";
export type FilterableBusType = BusType | "all";

export type TripDirection = "Mantalongon_to_Cebu" | "Cebu_to_Mantalongon";
export type FilterableTripDirection = TripDirection | "all";

export type TripStatus = "Scheduled" | "On Standby" | "Travelling" | "Completed" | "Cancelled" | "Parked";

export interface Trip {
  id: string;
  busId?: string; // Optional, can be linked to a specific bus entity
  direction: TripDirection;
  origin: string;
  destination: string;
  departureTime: string; // 24-hour format "HH:mm"
  arrivalTime: string; // Calculated, 24-hour format "HH:mm"
  travelDurationMins: number;
  stopoverDurationMins: number; // Duration at destination before potential return trip or next assignment
  busType: BusType;
  availableSeats: number;
  totalSeats: number;
  price: number;
  tripDate: string; // "YYYY-MM-DD"
  status: TripStatus;
  busPlateNumber?: string; // Optional for tracking
}

export type SeatStatus = "available" | "selected" | "reserved";

export interface Seat {
  id: string;
  label: string;
  status: SeatStatus;
  price?: number; // Price might vary per seat
}

export interface SeatLayout {
  mainSeatRows: (Seat | null)[][]; // Array of main seating rows
  rearBenchRow: (Seat | null)[];   // Array of seats for the rear bench, null for spacers if any
}

export interface Reservation {
  id:string;
  passengerName: string;
  tripId: string;
  seatNumbers: string[];
  busType: BusType;
  departureTime: string; // Should match Trip's departureTime
  totalAmount: number;
}

export interface User {
  id: string;
  email: string;
  name?: string;
}
