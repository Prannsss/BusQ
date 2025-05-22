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
  rows: (Seat | null)[][]; // Array of rows, each row is an array of seats or null (aisle)
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
