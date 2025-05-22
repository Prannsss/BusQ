
export type BusType = "Traditional" | "Airconditioned";
export type FilterableBusType = BusType | "all";

export type TripDirection = "Mantalongon_to_Cebu" | "Cebu_to_Mantalongon";
export type FilterableTripDirection = TripDirection | "all";

// Added: List of possible destinations from Cebu
export const cebuDestinationsList = [
  "Mantalongon", 
  "Talisay City", 
  "Minglanilla", 
  "Naga City", 
  "San Fernando", 
  "Carcar City", 
  "Sibonga", 
  "Argao", 
  "Dalaguete"
] as const;

// Added: Type for the Cebu destination filter
export type CebuDestination = typeof cebuDestinationsList[number] | "all";

export type TripStatus = "Scheduled" | "On Standby" | "Travelling" | "Completed" | "Cancelled" | "Parked";

export interface Trip {
  id: string;
  busId?: string; 
  direction: TripDirection; // General direction category
  origin: string;
  destination: string; // Specific destination town
  departureTime: string; 
  arrivalTime: string; 
  travelDurationMins: number;
  stopoverDurationMins: number; 
  busType: BusType;
  availableSeats: number;
  totalSeats: number;
  price: number;
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
