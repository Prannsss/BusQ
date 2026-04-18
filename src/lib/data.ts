import {
  type Terminal,
  type TerminalDestination,
  type Trip,
  type TripStatus,
  type BusOperationalStatus,
  type FilterableBusOperationalStatus,
  type BusType,
  type FilterableBusType,
  type FilterableBusLiner,
  type BusLinerName,
  type TripDirection,
  type TerminalFareTable,
  TERMINALS,
  TERMINAL_FARE_TABLES,
  getBusLinersByTerminal,
} from "@/types";

export const MOCK_TRIPS: Trip[] = [
  {
    id: "TRIP-001",
    busLiner: "Ceres Express",
    physicalBusId: "AC-001",
    direction: "South_Terminal_to_Destination",
    origin: "Cebu South Bus Terminal",
    destination: "Oslob",
    departureTime: "06:00 AM",
    arrivalTime: "10:30 AM",
    busType: "Airconditioned",
    tripDate: "2026-04-18",
    price: 350,
    departureTimestamp: new Date("2026-04-18T06:00:00").getTime(),
    arrivalTimestamp: new Date("2026-04-18T10:30:00").getTime(),
    availableSeats: 24,
    totalSeats: 45,
    busPlateNumber: "CEB-1234",
  },
  {
    id: "TRIP-002",
    busLiner: "Sunrays Transit",
    physicalBusId: "TRAD-002",
    direction: "South_Terminal_to_Destination",
    origin: "Cebu South Bus Terminal",
    destination: "Moalboal",
    departureTime: "07:30 AM",
    arrivalTime: "10:45 AM",
    busType: "Traditional",
    tripDate: "2026-04-18",
    price: 200,
    departureTimestamp: new Date("2026-04-18T07:30:00").getTime(),
    arrivalTimestamp: new Date("2026-04-18T10:45:00").getTime(),
    availableSeats: 30,
    totalSeats: 55,
    busPlateNumber: "CEB-5678",
  },
  {
    id: "TRIP-003",
    busLiner: "Ceres Aircon",
    physicalBusId: "AC-003",
    direction: "North_Terminal_to_Destination",
    origin: "Cebu North Bus Terminal",
    destination: "Maya",
    departureTime: "08:15 AM",
    arrivalTime: "12:00 PM",
    busType: "Airconditioned",
    tripDate: "2026-04-18",
    price: 400,
    departureTimestamp: new Date("2026-04-18T08:15:00").getTime(),
    arrivalTimestamp: new Date("2026-04-18T12:00:00").getTime(),
    availableSeats: 15,
    totalSeats: 45,
    busPlateNumber: "CEB-9101",
  },
  {
    id: "TRIP-004",
    busLiner: "Sunrays Express",
    physicalBusId: "TRAD-004",
    direction: "North_Terminal_to_Destination",
    origin: "Cebu North Bus Terminal",
    destination: "Bogo",
    departureTime: "09:00 AM",
    arrivalTime: "11:45 AM",
    busType: "Traditional",
    tripDate: "2026-04-18",
    price: 180,
    departureTimestamp: new Date("2026-04-18T09:00:00").getTime(),
    arrivalTimestamp: new Date("2026-04-18T11:45:00").getTime(),
    availableSeats: 5,
    totalSeats: 55,
    busPlateNumber: "CEB-1121",
  },
  {
    id: "TRIP-005",
    busLiner: "Ceres Express",
    physicalBusId: "AC-005",
    direction: "North_Terminal_to_Destination",
    origin: "Cebu North Bus Terminal",
    destination: "Hagnaya",
    departureTime: "11:00 AM",
    arrivalTime: "02:30 PM",
    busType: "Airconditioned",
    tripDate: "2026-04-18",
    price: 360,
    departureTimestamp: new Date("2026-04-18T11:00:00").getTime(),
    arrivalTimestamp: new Date("2026-04-18T14:30:00").getTime(),
    availableSeats: 45,
    totalSeats: 45,
    busPlateNumber: "CEB-3141",
  }
];

export interface TripsFilterState {
  busType: FilterableBusType;
  busLiner: FilterableBusLiner;
  status: FilterableBusOperationalStatus;
}

export const DEFAULT_TRIPS_FILTER_STATE: TripsFilterState = {
  busType: "all",
  busLiner: "all",
  status: "all",
};

const getDirectionByTerminal = (terminal: Terminal): TripDirection =>
  terminal === TERMINALS.SOUTH
    ? "South_Terminal_to_Destination"
    : "North_Terminal_to_Destination";

const getRouteFare = (
  route: TerminalFareTable["routes"][number],
  busType: BusType,
): number =>
  busType === "Airconditioned"
    ? route.estimated_fare_php.aircon
    : route.estimated_fare_php.ordinary;

const getOriginByTerminal = (terminal: Terminal): string => terminal;

const formatDateToLocalIso = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const HOURLY_DEPARTURE_START_HOUR = 1;
export const HOURLY_DEPARTURE_END_HOUR = 23;

function isSameLocalDate(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function parseLocalIsoDate(value?: string | null): Date | undefined {
  if (!value) {
    return undefined;
  }

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return undefined;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(year, month - 1, day);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export function computeBusOperationalStatus(
  trip: Trip,
  nowTimestamp: number = Date.now(),
): BusOperationalStatus {
  if (nowTimestamp < trip.departureTimestamp) {
    return "On Standby";
  }

  if (nowTimestamp < trip.arrivalTimestamp) {
    return "Travelling";
  }

  return "Arrived";
}

export function filterTripsForTravelDate(
  trips: Trip[],
  travelDate: Date,
  nowTimestamp: number = Date.now(),
): Trip[] {
  const now = new Date(nowTimestamp);

  if (!isSameLocalDate(travelDate, now)) {
    return trips;
  }

  return trips.filter((trip) => computeBusOperationalStatus(trip, nowTimestamp) !== "Arrived");
}

// Estimated one-way route durations (in minutes) gathered from web routing services.
const WEB_ROUTE_DURATION_MINUTES: Record<Terminal, Record<string, number>> = {
  [TERMINALS.SOUTH]: {
    Naga: 25,
    "San Fernando": 36,
    Carcar: 44,
    Sibonga: 58,
    Argao: 71,
    Dalaguete: 83,
    Alcoy: 88,
    Boljoon: 95,
    Oslob: 106,
    Santander: 117,
    Moalboal: 78,
    Bato: 67,
  },
  [TERMINALS.NORTH]: {
    Danao: 41,
    Compostela: 30,
    Carmen: 51,
    Catmon: 72,
    Sogod: 76,
    Borbon: 90,
    Tabogon: 106,
    Bogo: 111,
    "San Remigio": 117,
    Medellin: 122,
    Daanbantayan: 137,
    Maya: 146,
    Hagnaya: 54,
  },
};

// User-calibrated baseline:
// Cebu South Bus Terminal -> Dalaguete is around 3 hours in real bus travel.
const SOUTH_DALAGUETE_WEB_BASE_MINUTES = 83;
const SOUTH_DALAGUETE_EXPERIENCED_MINUTES = 180;
const SOUTH_ROUTE_CALIBRATION_FACTOR = SOUTH_DALAGUETE_EXPERIENCED_MINUTES / SOUTH_DALAGUETE_WEB_BASE_MINUTES;

const getEstimatedRouteDurationMinutes = (
  terminal: Terminal,
  destination: string,
  busType: BusType,
  fallbackDistanceKm: number,
): number => {
  const webBaseMinutes = WEB_ROUTE_DURATION_MINUTES[terminal][destination];

  if (webBaseMinutes) {
    if (terminal === TERMINALS.SOUTH) {
      const calibratedSouthMinutes = webBaseMinutes * SOUTH_ROUTE_CALIBRATION_FACTOR;
      const busTypeFactor = busType === "Airconditioned" ? 1 : 1.08;
      return Math.max(30, Math.round(calibratedSouthMinutes * busTypeFactor));
    }

    // Keep a lighter bus multiplier for North routes.
    const northBusTypeFactor = busType === "Airconditioned" ? 1.2 : 1.3;
    return Math.max(30, Math.round(webBaseMinutes * northBusTypeFactor));
  }

  // Fallback for routes without web duration data.
  const averageBusKph = busType === "Airconditioned" ? 30 : 26;
  return Math.max(30, Math.round((fallbackDistanceKm / averageBusKph) * 60));
};

const createTripFromRoute = (
  terminal: Terminal,
  route: TerminalFareTable["routes"][number],
  routeIndex: number,
  departureDate: Date,
  scheduleIndex: number,
): Trip => {
  const liners = getBusLinersByTerminal(terminal);
  const busLiner = liners[(routeIndex + scheduleIndex) % liners.length] as BusLinerName;
  const busType: BusType = scheduleIndex % 2 === 0 ? "Airconditioned" : "Traditional";
  const direction = getDirectionByTerminal(terminal);
  const physicalPrefix = busType === "Airconditioned" ? "AC" : "TRAD";
  const physicalBusId = `${physicalPrefix}-${String(routeIndex * 100 + scheduleIndex + 1).padStart(3, "0")}` as const;
  const departureTimestamp = departureDate.getTime();
  const estimatedTravelMinutes = getEstimatedRouteDurationMinutes(
    terminal,
    route.municipality,
    busType,
    route.distance_km,
  );
  const arrivalTimestamp = departureTimestamp + estimatedTravelMinutes * 60_000;

  return {
    id: `${terminal === TERMINALS.SOUTH ? "S" : "N"}-${route.municipality}-${scheduleIndex + 1}`,
    physicalBusId,
    busLiner,
    direction,
    origin: getOriginByTerminal(terminal),
    destination: route.municipality,
    departureTime: departureDate.toLocaleTimeString("en-PH", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }),
    arrivalTime: new Date(arrivalTimestamp).toLocaleTimeString("en-PH", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }),
    busType,
    tripDate: formatDateToLocalIso(departureDate),
    price: getRouteFare(route, busType),
    departureTimestamp,
    arrivalTimestamp,
    travelDurationMins: estimatedTravelMinutes,
    stopoverDurationMins: 0,
    availableSeats: Math.max(4, 45 - ((routeIndex * 7 + scheduleIndex * 3) % 35)),
    totalSeats: 45,
    busPlateNumber: `CEB-${String(4100 + routeIndex * 50 + scheduleIndex).padStart(4, "0")}`,
  };
};

export function getDynamicTripsByTerminal(
  terminal: Terminal,
  options?: {
    date?: Date;
    destination?: TerminalDestination;
  },
): Trip[] {
  const fareTable = TERMINAL_FARE_TABLES[terminal];
  const baseDate = options?.date ?? new Date();
  const filteredRoutes = options?.destination
    ? fareTable.routes.filter((route) => route.municipality === options.destination)
    : fareTable.routes;

  const trips = filteredRoutes.flatMap((route, routeIndex) => {
    const scheduleCount = HOURLY_DEPARTURE_END_HOUR - HOURLY_DEPARTURE_START_HOUR + 1;

    return Array.from({ length: scheduleCount }, (_, scheduleIndex) => {
      const departureDate = new Date(baseDate);
      departureDate.setHours(HOURLY_DEPARTURE_START_HOUR + scheduleIndex, 0, 0, 0);
      return createTripFromRoute(terminal, route, routeIndex, departureDate, scheduleIndex);
    });
  });

  return trips.sort((a, b) => a.departureTimestamp - b.departureTimestamp);
}

export function getDynamicTripsForAllTerminals(date: Date): Trip[] {
  const northTrips = getDynamicTripsByTerminal(TERMINALS.NORTH, { date });
  const southTrips = getDynamicTripsByTerminal(TERMINALS.SOUTH, { date });
  return [...northTrips, ...southTrips].sort((a, b) => a.departureTimestamp - b.departureTimestamp);
}

export function applyTripsFilters(
  trips: Trip[],
  filters: TripsFilterState,
  nowTimestamp: number = Date.now(),
): Trip[] {
  return trips.filter((trip) => {
    const passesBusType = filters.busType === "all" || trip.busType === filters.busType;
    const passesBusLiner = filters.busLiner === "all" || trip.busLiner === filters.busLiner;
    const status = computeBusOperationalStatus(trip, nowTimestamp);
    const passesStatus = filters.status === "all" || status === filters.status;
    return passesBusType && passesBusLiner && passesStatus;
  });
}

// Helper to calculate exact TripStatus based on current timestamp
export function computeTripStatus(trip: Trip): TripStatus {
  const status = computeBusOperationalStatus(trip, Date.now());

  if (status === "On Standby") return "Scheduled";
  if (status === "Travelling") return "Travelling";
  return "Completed for Day";
}
