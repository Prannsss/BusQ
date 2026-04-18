export type BusType = "Traditional" | "Airconditioned";
export type FilterableBusType = BusType | "all";

export const busTypeLabels: Record<FilterableBusType, string> = {
  all: "All Types",
  Traditional: "Non-Airconditioned",
  Airconditioned: "Airconditioned",
};

export const SOUTH_TERMINAL_BUS_LINERS = [
  "Ceres Express",
  "Ceres Deluxe",
  "Sunrays Transit",
  "Sunrays Express",
] as const;

export const NORTH_TERMINAL_BUS_LINERS = [
  "Ceres Express",
  "Ceres Aircon",
  "Sunrays Transit",
  "Sunrays Express",
] as const;

export type SouthTerminalBusLiner = typeof SOUTH_TERMINAL_BUS_LINERS[number];
export type NorthTerminalBusLiner = typeof NORTH_TERMINAL_BUS_LINERS[number];
export type BusLinerName = SouthTerminalBusLiner | NorthTerminalBusLiner;
export type FilterableBusLiner = BusLinerName | "all";

export const busLinerLabels: Record<FilterableBusLiner, string> = {
  all: "All Liners",
  "Ceres Express": "Ceres Express",
  "Ceres Deluxe": "Ceres Deluxe",
  "Ceres Aircon": "Ceres Aircon",
  "Sunrays Transit": "Sunrays Transit",
  "Sunrays Express": "Sunrays Express",
};

export type TripDirection = "South_Terminal_to_Destination" | "North_Terminal_to_Destination";
export type FilterableTripDirection = TripDirection | "all";

export type DiscountKey = "student" | "pwd" | "senior";

export interface FareModelConfig {
  base_fare_php: number;
  per_km_ordinary: number;
  per_km_aircon: number;
  discounts: Record<DiscountKey, number>;
  note: string;
}

export interface RouteFareEstimate {
  municipality: string;
  distance_km: number;
  estimated_fare_php: {
    ordinary: number;
    aircon: number;
  };
}

export interface TerminalFareTable {
  terminal: Terminal;
  last_updated: string;
  fare_model: FareModelConfig;
  routes: RouteFareEstimate[];
}

export const TERMINALS = {
  NORTH: "Cebu North Bus Terminal",
  SOUTH: "Cebu South Bus Terminal",
} as const;

export type Terminal = typeof TERMINALS[keyof typeof TERMINALS];

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
  "Santander",
  "Moalboal",
  "Bato",
] as const;

export const northTerminalDestinations = [
  "Danao",
  "Compostela",
  "Carmen",
  "Catmon",
  "Sogod",
  "Borbon",
  "Tabogon",
  "Bogo",
  "San Remigio",
  "Medellin",
  "Daanbantayan",
  "Maya",
  "Hagnaya"
] as const;

export type SouthTerminalDestination = typeof southTerminalDestinations[number];
export type NorthTerminalDestination = typeof northTerminalDestinations[number];
export type TerminalDestination = SouthTerminalDestination | NorthTerminalDestination;
export type FilterableDestination = SouthTerminalDestination | NorthTerminalDestination | "all";

export const DEFAULT_FARE_MODEL: FareModelConfig = {
  base_fare_php: 15,
  per_km_ordinary: 2.2,
  per_km_aircon: 2.8,
  discounts: {
    student: 0.2,
    pwd: 0.2,
    senior: 0.2,
  },
  note: "Estimated LTFRB-aligned fare computation model (2026 approximation)",
};

export const SOUTH_TERMINAL_FARE_TABLE: TerminalFareTable = {
  terminal: TERMINALS.SOUTH,
  last_updated: "2026",
  fare_model: DEFAULT_FARE_MODEL,
  routes: [
    { municipality: "Talisay City", distance_km: 10, estimated_fare_php: { ordinary: 37, aircon: 43 } },
    { municipality: "Minglanilla", distance_km: 15, estimated_fare_php: { ordinary: 48, aircon: 57 } },
    { municipality: "Naga", distance_km: 21, estimated_fare_php: { ordinary: 61, aircon: 74 } },
    { municipality: "San Fernando", distance_km: 28, estimated_fare_php: { ordinary: 76, aircon: 93 } },
    { municipality: "Carcar", distance_km: 40, estimated_fare_php: { ordinary: 103, aircon: 127 } },
    { municipality: "Sibonga", distance_km: 70, estimated_fare_php: { ordinary: 169, aircon: 211 } },
    { municipality: "Argao", distance_km: 55, estimated_fare_php: { ordinary: 136, aircon: 171 } },
    { municipality: "Dalaguete", distance_km: 75, estimated_fare_php: { ordinary: 180, aircon: 226 } },
    { municipality: "Alcoy", distance_km: 85, estimated_fare_php: { ordinary: 202, aircon: 254 } },
    { municipality: "Boljoon", distance_km: 95, estimated_fare_php: { ordinary: 224, aircon: 282 } },
    { municipality: "Oslob", distance_km: 110, estimated_fare_php: { ordinary: 257, aircon: 325 } },
    { municipality: "Santander", distance_km: 125, estimated_fare_php: { ordinary: 290, aircon: 368 } },
    { municipality: "Barili", distance_km: 50, estimated_fare_php: { ordinary: 125, aircon: 157 } },
    { municipality: "Dumanjug", distance_km: 65, estimated_fare_php: { ordinary: 158, aircon: 200 } },
    { municipality: "Ronda", distance_km: 68, estimated_fare_php: { ordinary: 165, aircon: 208 } },
    { municipality: "Alcantara", distance_km: 72, estimated_fare_php: { ordinary: 174, aircon: 219 } },
    { municipality: "Moalboal", distance_km: 85, estimated_fare_php: { ordinary: 202, aircon: 254 } },
    { municipality: "Badian", distance_km: 95, estimated_fare_php: { ordinary: 224, aircon: 282 } },
    { municipality: "Alegria", distance_km: 105, estimated_fare_php: { ordinary: 246, aircon: 310 } },
    { municipality: "Malabuyoc", distance_km: 110, estimated_fare_php: { ordinary: 257, aircon: 325 } },
    { municipality: "Ginatilan", distance_km: 120, estimated_fare_php: { ordinary: 279, aircon: 353 } },
    { municipality: "Samboan", distance_km: 125, estimated_fare_php: { ordinary: 290, aircon: 368 } },
    { municipality: "Bato", distance_km: 130, estimated_fare_php: { ordinary: 301, aircon: 379 } },
  ],
};

export const NORTH_TERMINAL_FARE_TABLE: TerminalFareTable = {
  terminal: TERMINALS.NORTH,
  last_updated: "2026",
  fare_model: DEFAULT_FARE_MODEL,
  routes: [
    { municipality: "Danao", distance_km: 28, estimated_fare_php: { ordinary: 77, aircon: 93 } },
    { municipality: "Compostela", distance_km: 36, estimated_fare_php: { ordinary: 94, aircon: 116 } },
    { municipality: "Carmen", distance_km: 47, estimated_fare_php: { ordinary: 118, aircon: 147 } },
    { municipality: "Catmon", distance_km: 57, estimated_fare_php: { ordinary: 140, aircon: 175 } },
    { municipality: "Sogod", distance_km: 68, estimated_fare_php: { ordinary: 165, aircon: 205 } },
    { municipality: "Borbon", distance_km: 75, estimated_fare_php: { ordinary: 180, aircon: 225 } },
    { municipality: "Tabogon", distance_km: 87, estimated_fare_php: { ordinary: 206, aircon: 259 } },
    { municipality: "Bogo", distance_km: 95, estimated_fare_php: { ordinary: 224, aircon: 281 } },
    { municipality: "San Remigio", distance_km: 108, estimated_fare_php: { ordinary: 253, aircon: 317 } },
    { municipality: "Medellin", distance_km: 113, estimated_fare_php: { ordinary: 264, aircon: 331 } },
    { municipality: "Daanbantayan", distance_km: 125, estimated_fare_php: { ordinary: 290, aircon: 365 } },
    { municipality: "Maya", distance_km: 132, estimated_fare_php: { ordinary: 305, aircon: 385 } },
    { municipality: "Hagnaya", distance_km: 135, estimated_fare_php: { ordinary: 312, aircon: 393 } },
  ],
};

export const TERMINAL_FARE_TABLES: Record<Terminal, TerminalFareTable> = {
  [TERMINALS.SOUTH]: SOUTH_TERMINAL_FARE_TABLE,
  [TERMINALS.NORTH]: NORTH_TERMINAL_FARE_TABLE,
};

export function resolveTerminalByDirection(direction: TripDirection): Terminal {
  return direction === "South_Terminal_to_Destination" ? TERMINALS.SOUTH : TERMINALS.NORTH;
}

export function getEstimatedFarePerSeat(
  terminal: Terminal,
  destination: TerminalDestination,
  busType: BusType,
): number | undefined {
  const table = TERMINAL_FARE_TABLES[terminal];
  const route = table.routes.find((entry) => entry.municipality === destination);

  if (!route) {
    return undefined;
  }

  return busType === "Traditional" ? route.estimated_fare_php.ordinary : route.estimated_fare_php.aircon;
}

export function getPassengerDiscountRate(passengerType: PassengerType): number {
  switch (passengerType) {
    case "Student":
      return DEFAULT_FARE_MODEL.discounts.student;
    case "PWD":
      return DEFAULT_FARE_MODEL.discounts.pwd;
    case "Senior Citizen":
      return DEFAULT_FARE_MODEL.discounts.senior;
    case "Regular":
    default:
      return 0;
  }
}

export function getDestinationsByTerminal(terminal: Terminal): readonly TerminalDestination[] {
  return terminal === TERMINALS.SOUTH ? southTerminalDestinations : northTerminalDestinations;
}

export function getDestinationsByDirection(direction: TripDirection): readonly TerminalDestination[] {
  return direction === "South_Terminal_to_Destination" ? southTerminalDestinations : northTerminalDestinations;
}

export function getBusLinersByTerminal(terminal: Terminal): readonly BusLinerName[] {
  return terminal === TERMINALS.SOUTH ? SOUTH_TERMINAL_BUS_LINERS : NORTH_TERMINAL_BUS_LINERS;
}

export type TripStatus = "Scheduled" | "Travelling" | "Returning" | "Completed for Day";
export type BadgeColorKey = "blue" | "green" | "gray";
export type BusOperationalStatus = "On Standby" | "Travelling" | "Arrived";
export type FilterableBusOperationalStatus = BusOperationalStatus | "all";

export const busOperationalStatusLabels: Record<FilterableBusOperationalStatus, string> = {
  all: "All Statuses",
  "On Standby": "On Standby",
  Travelling: "Travelling",
  Arrived: "Arrived",
};

export type PhysicalBusId = `TRAD-${string}` | `AC-${string}`;

export interface Trip {
  busPlateNumber?: string;
  travelDurationMins?: number;
  stopoverDurationMins?: number;
  busLiner?: BusLinerName;
  id: string;
  physicalBusId: PhysicalBusId;
  direction: TripDirection;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  busType: BusType;
  tripDate: string;
  price?: number;
  departureTimestamp: number;
  arrivalTimestamp: number;
  availableSeats?: number;
  totalSeats?: number;
}

export interface DisplayTripInfo extends Trip {
  tripDate: string;
  displayStatus: TripStatus;
  badgeColorKey: BadgeColorKey;
  availableSeats: number;
  totalSeats: number;
  busName?: string;
}

export type SeatStatus = "Available" | "Reserved";

export interface Seat {
  id: string;
  label?: string; // made optional
  rowNum?: number; // made optional
  colIndex?: number; // made optional
  status: SeatStatus;
}

export interface SeatLayout {
  mainSeatRows: (Seat | null)[][];
  rearBenchRow: Seat[];
}

export type PassengerType = "Regular" | "Student" | "Senior Citizen" | "PWD";
export const passengerTypes: PassengerType[] = ["Regular", "Student", "Senior Citizen", "PWD"];

export const passengerTypeLabels: Record<PassengerType, string> = {
  Regular: "Regular",
  Student: "Student",
  "Senior Citizen": "Senior Citizen",
  PWD: "PWD",
};

export interface Reservation {
  id: string;
  tripId: string;
  pickupPoint: string;
  dropOffPoint: string;
  passengerType: PassengerType;
  fareAmount: number;
  seatCount: number;
  qrCodeUrl?: string;
  regularFareTotal: number;
  amountDue: number;
  passengerName: string;
  userType: string;
  origin: string;
  selectedDestination: string;
  busType: string;
  tripDate: string;
  departureTime: string;
  seatNumbers: string[];
  discountApplied: boolean;
  paymentType: string;
  amountPaid?: number;
  finalFarePaid: number;
}
