export type Municipality = string;

export type RouteTerminal = "South Bus Terminal" | "North Bus Terminal";
export type RouteDirection = "southbound" | "northbound";
export type BusClass = "ordinary" | "aircon";

export interface Route {
  name: string;
  terminal: RouteTerminal;
  direction: RouteDirection;
  path: Municipality[];
}

export interface RouteMatch {
  route: Route;
  segment: Municipality[];
  startIndex: number;
  endIndex: number;
}

export interface MunicipalityCoordinate {
  lat: number;
  lng: number;
}

export interface TrackedBus {
  id: string;
  code: string;
  routeName: string;
  terminal: RouteTerminal;
  busType: BusClass;
  departureTimestamp: number;
  arrivalTimestamp: number;
  discounted?: boolean;
}

export interface StopState {
  municipality: Municipality;
  etaTimestamp: number;
  status: "passed" | "current" | "upcoming";
}

export interface LiveBusState {
  bus: TrackedBus;
  route: Route;
  busOperationalStatus: "On Standby" | "Travelling" | "Arrived";
  routeDistanceKm: number;
  etaMinutes: number;
  progress: number;
  remainingMinutes: number;
  nextStop: Municipality;
  expectedArrivalTimestamp: number;
  stopStates: StopState[];
  position: MunicipalityCoordinate;
}
