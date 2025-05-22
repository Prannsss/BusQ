export type BusType = "Traditional" | "Airconditioned";
export type FilterableBusType = BusType | "all";

export interface Trip {
  id: string;
  departureTime: string;
  arrivalTime: string;
  busType: BusType;
  availableSeats: number;
  totalSeats: number;
  price: number;
  origin: string;
  destination: string;
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
  departureTime: string;
  totalAmount: number;
}

export interface User {
  id: string;
  email: string;
  name?: string;
}
