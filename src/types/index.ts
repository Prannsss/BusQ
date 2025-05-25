
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

// Updated TripStatus
export type TripStatus = "Scheduled" | "Travelling" | "Returning" | "Completed for Day";
export type BadgeColorKey = "blue" | "green" | "orange" | "gray";

export type PhysicalBusId = `TRAD-${string}` | `AC-${string}`;

export interface Trip {
  id: string; // Unique ID for this specific trip leg
  physicalBusId: PhysicalBusId; // ID of the physical bus unit
  direction: TripDirection;
  origin: string;
  destination: string;
  departureTime: string; // HH:mm format for this leg
  arrivalTime: string; // HH:mm format for this leg
  busType: BusType;
  availableSeats: number;
  totalSeats: number;
  price: number; // Price for the full route to final destination (e.g., M->C or C->M)
  tripDate: string; // yyyy-MM-dd format, specific to this leg's departure
  busPlateNumber?: string;
  departureTimestamp: number; // Milliseconds since epoch for this leg's departure
  arrivalTimestamp: number;   // Milliseconds since epoch for this leg's arrival
  travelDurationMins: number;
  stopoverDurationMins: number; // Duration bus waits at destination before return
}

export interface DisplayTripInfo extends Trip {
  displayStatus: TripStatus;
  badgeColorKey: BadgeColorKey;
}


export const passengerTypes = ["Regular", "Student", "Senior", "PWD"] as const;
export type PassengerType = typeof passengerTypes[number];

export interface Reservation {
  id: string;
  passengerName: string;
  tripId: string; // Refers to the id of the Trip leg booked
  seatNumbers: string[];
  busType: BusType;
  departureTime: string; // Departure time of the booked leg
  origin?: string;  // Origin of the booked leg
  selectedDestination: string; // User's chosen drop-off
  tripDate?: string; // Date of the booked leg
  userType: PassengerType;
  
  regularFareTotal: number; // Total regular fare for selected seats to chosen destination, before discounts
  discountApplied: boolean;
  amountDue: number; // Total amount due after discounts 
  
  paymentType?: "deposit" | "full";
  amountPaid?: number; 
  finalFarePaid: number; // Actual amount paid by the user
}

export interface User {
  id: string;
  email: string;
  name?: string;
  userType?: PassengerType; 
}

// For tracking page, specific to the cyclical display
export type CurrentRouteLeg = 'first-leg' | 'parked-at-destination' | 'return-leg' | 'parked-at-origin' | 'unknown';

export interface CyclicalBusInfo {
  currentStatus: TripStatus; // Re-using TripStatus for consistency
  currentOrigin: string;
  currentDestination: string;
  currentRouteLeg: CurrentRouteLeg;
  nextStatusChangeAt?: Date;
  displayMessage: string;
  badgeColorKey: BadgeColorKey;
}
