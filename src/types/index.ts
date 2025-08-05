
export type BusType = "Traditional" | "Airconditioned";
export type FilterableBusType = BusType | "all";

export type TripDirection = "South_Terminal_to_Destination";
export type FilterableTripDirection = TripDirection | "all";

// Available destinations from South Bus Terminal
export const southTerminalDestinations = [
  "Naga",
  "San Fernando", 
  "Carcar",
  "Sibonga",
  "Argao",
  "Dalaguete",
  "Alcoy",
  "Boljoon",
  "Oslob",
  "Santander"
] as const;
export type SouthTerminalDestination = typeof southTerminalDestinations[number];

// For backward compatibility
export type FilterableDestination = SouthTerminalDestination | "all";

// Updated TripStatus
export type TripStatus = "Scheduled" | "Travelling" | "Returning" | "Completed for Day";
export type BadgeColorKey = "blue" | "green" | "gray";

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
  busName?: string; // Add optional bus name field
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
