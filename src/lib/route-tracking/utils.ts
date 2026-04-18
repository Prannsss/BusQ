import { municipalityDistanceFromCebuCity } from "./distanceMap";
import { municipalityCoordinates, routes } from "./routes";
import type {
  BusClass,
  LiveBusState,
  Municipality,
  MunicipalityCoordinate,
  Route,
  RouteMatch,
  StopState,
  TrackedBus,
} from "./types";
import type { Trip } from "@/types";
import { computeBusOperationalStatus } from "@/lib/data";

function toKey(value: string): string {
  return value.trim().toLowerCase();
}

function normalizeMunicipality(value: string): string {
  return toKey(value)
    .replace(/\bcity\b/g, "")
    .replace(/\bport\b/g, "")
    .replace(/\bbus terminal\b/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function getDistanceFromCebuCity(municipality: Municipality): number {
  const direct = municipalityDistanceFromCebuCity[municipality];
  if (typeof direct === "number") {
    return direct;
  }

  const matchEntry = Object.entries(municipalityDistanceFromCebuCity).find(
    ([name]) => toKey(name) === toKey(municipality),
  );

  return matchEntry ? matchEntry[1] : 0;
}

export function findRoute(start: string, end: string): RouteMatch | null {
  const startKey = toKey(start);
  const endKey = toKey(end);

  for (const route of routes) {
    const startIndex = route.path.findIndex((municipality) => toKey(municipality) === startKey);
    const endIndex = route.path.findIndex((municipality) => toKey(municipality) === endKey);

    if (startIndex === -1 || endIndex === -1) {
      continue;
    }

    const lower = Math.min(startIndex, endIndex);
    const upper = Math.max(startIndex, endIndex);
    const forwardSegment = route.path.slice(lower, upper + 1);
    const segment = startIndex <= endIndex ? forwardSegment : [...forwardSegment].reverse();

    return {
      route,
      segment,
      startIndex,
      endIndex,
    };
  }

  return null;
}

export function getAvailableRoutes(start: string, end: string): RouteMatch[] {
  const startKey = toKey(start);
  const endKey = toKey(end);

  return routes
    .map((route) => {
      const startIndex = route.path.findIndex((municipality) => toKey(municipality) === startKey);
      const endIndex = route.path.findIndex((municipality) => toKey(municipality) === endKey);

      if (startIndex === -1 || endIndex === -1) {
        return null;
      }

      const lower = Math.min(startIndex, endIndex);
      const upper = Math.max(startIndex, endIndex);
      const forwardSegment = route.path.slice(lower, upper + 1);
      const segment = startIndex <= endIndex ? forwardSegment : [...forwardSegment].reverse();

      return {
        route,
        segment,
        startIndex,
        endIndex,
      };
    })
    .filter((match): match is RouteMatch => Boolean(match));
}

export function calculateDistance(routeSegment: string[]): number {
  if (routeSegment.length < 2) {
    return 0;
  }

  const startDistance = getDistanceFromCebuCity(routeSegment[0]);
  const endDistance = getDistanceFromCebuCity(routeSegment[routeSegment.length - 1]);

  return Math.abs(endDistance - startDistance);
}

export function calculateFare(distance: number, busType: BusClass, discounted = false): number {
  const baseFare = 15;
  const perKm = busType === "aircon" ? 2.8 : 2.2;
  const grossFare = baseFare + distance * perKm;
  const finalFare = discounted ? grossFare * 0.8 : grossFare;

  return Math.round(finalFare * 100) / 100;
}

export function estimateEtaMinutes(routeDistanceKm: number, busType: BusClass): number {
  const baseSpeedKph = busType === "aircon" ? 38 : 32;
  const movingMinutes = (routeDistanceKm / baseSpeedKph) * 60;
  const operationalBuffer = Math.max(15, routeDistanceKm * 0.55);
  return Math.round(movingMinutes + operationalBuffer);
}

function toRad(value: number): number {
  return (value * Math.PI) / 180;
}

function haversineKm(a: MunicipalityCoordinate, b: MunicipalityCoordinate): number {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);

  return 2 * R * Math.asin(Math.sqrt(h));
}

function resolveRouteCoordinates(route: Route): MunicipalityCoordinate[] {
  return route.path.map((municipality) => municipalityCoordinates[municipality] ?? municipalityCoordinates["Cebu City"]);
}

function interpolatePosition(pathCoordinates: MunicipalityCoordinate[], progress: number): MunicipalityCoordinate {
  if (pathCoordinates.length <= 1) {
    return pathCoordinates[0] ?? municipalityCoordinates["Cebu City"];
  }

  const clamped = Math.max(0, Math.min(1, progress));
  const segmentLengths = pathCoordinates.slice(0, -1).map((coord, index) => haversineKm(coord, pathCoordinates[index + 1]));
  const totalLength = segmentLengths.reduce((sum, value) => sum + value, 0);

  if (totalLength <= 0) {
    return pathCoordinates[0];
  }

  const targetLength = totalLength * clamped;
  let traversed = 0;

  for (let index = 0; index < segmentLengths.length; index += 1) {
    const currentLength = segmentLengths[index];
    if (traversed + currentLength >= targetLength) {
      const localProgress = (targetLength - traversed) / currentLength;
      const start = pathCoordinates[index];
      const end = pathCoordinates[index + 1];

      return {
        lat: start.lat + (end.lat - start.lat) * localProgress,
        lng: start.lng + (end.lng - start.lng) * localProgress,
      };
    }

    traversed += currentLength;
  }

  return pathCoordinates[pathCoordinates.length - 1];
}

function buildStopStates(route: Route, departureTimestamp: number, etaMinutes: number, now: number): StopState[] {
  const coordinates = resolveRouteCoordinates(route);
  const segmentLengths = coordinates.slice(0, -1).map((coord, index) => haversineKm(coord, coordinates[index + 1]));
  const totalLength = segmentLengths.reduce((sum, value) => sum + value, 0);

  return route.path.map((municipality, index) => {
    const covered = segmentLengths.slice(0, Math.max(0, index)).reduce((sum, value) => sum + value, 0);
    const normalized = totalLength > 0 ? covered / totalLength : index / Math.max(1, route.path.length - 1);
    const etaTimestamp = departureTimestamp + normalized * etaMinutes * 60_000;

    let status: StopState["status"] = "upcoming";
    if (now >= etaTimestamp + 90_000) {
      status = "passed";
    } else if (Math.abs(now - etaTimestamp) <= 90_000) {
      status = "current";
    }

    return {
      municipality,
      etaTimestamp,
      status,
    };
  });
}

export function createTrackedBuses(seedTimestamp: number): TrackedBus[] {
  const baseTime = seedTimestamp;

  return routes.flatMap((route, routeIndex) => {
    const distance = calculateDistance(route.path);
    const etaAircon = estimateEtaMinutes(distance, "aircon");
    const etaOrdinary = estimateEtaMinutes(distance, "ordinary");

    return [
      {
        id: `${route.direction}-A-${routeIndex + 1}`,
        code: `BUS-${700 + routeIndex * 2}`,
        routeName: route.name,
        terminal: route.terminal,
        busType: "aircon",
        departureTimestamp: baseTime - etaAircon * 60_000 * 0.35,
        arrivalTimestamp: Math.round(baseTime - etaAircon * 60_000 * 0.35 + etaAircon * 60_000),
        discounted: false,
      },
      {
        id: `${route.direction}-B-${routeIndex + 1}`,
        code: `BUS-${701 + routeIndex * 2}`,
        routeName: route.name,
        terminal: route.terminal,
        busType: "ordinary",
        departureTimestamp: baseTime - etaOrdinary * 60_000 * 0.62,
        arrivalTimestamp: Math.round(baseTime - etaOrdinary * 60_000 * 0.62 + etaOrdinary * 60_000),
        discounted: false,
      },
    ];
  });
}

function resolveTerminalFromTrip(trip: Trip): "South Bus Terminal" | "North Bus Terminal" {
  return trip.direction === "South_Terminal_to_Destination" ? "South Bus Terminal" : "North Bus Terminal";
}

function resolveRouteNameForTrip(trip: Trip): string | null {
  const terminal = resolveTerminalFromTrip(trip);
  const destinationKey = normalizeMunicipality(trip.destination);

  const terminalRoutes = routes.filter((route) => route.terminal === terminal);
  const exactMatch = terminalRoutes.find((route) =>
    route.path.some((municipality) => normalizeMunicipality(municipality) === destinationKey),
  );

  if (exactMatch) {
    return exactMatch.name;
  }

  if (terminal === "South Bus Terminal") {
    const westCoastKeys = new Set(
      [
        "Barili",
        "Dumanjug",
        "Ronda",
        "Alcantara",
        "Moalboal",
        "Badian",
        "Alegria",
        "Malabuyoc",
        "Ginatilan",
        "Samboan",
        "Bato",
      ].map(normalizeMunicipality),
    );

    if (westCoastKeys.has(destinationKey)) {
      return "Southbound - West Coast Line";
    }

    return "Southbound - East Coast Line";
  }

  if (terminal === "North Bus Terminal") {
    const westKeys = new Set([
      "Balamban",
      "Toledo City",
      "Asturias",
      "Tuburan",
      "Tabuelan",
      "San Remigio",
      "Hagnaya",
    ].map(normalizeMunicipality));

    if (westKeys.has(destinationKey)) {
      return "Northbound - Western Line";
    }

    return "Northbound - Eastern Line";
  }

  return null;
}

export function createTrackedBusesFromTrips(trips: Trip[], now: number): TrackedBus[] {
  const mappedTrips = trips
    .map((trip) => {
      const routeName = resolveRouteNameForTrip(trip);
      const terminal = resolveTerminalFromTrip(trip);
      if (!routeName || !terminal) {
        return null;
      }

      const bus: TrackedBus = {
        id: trip.id,
        code: `${trip.busLiner ?? "Bus"} • ${trip.destination}`,
        routeName,
        terminal: terminal as "South Bus Terminal" | "North Bus Terminal",
        busType: trip.busType === "Airconditioned" ? "aircon" : "ordinary",
        departureTimestamp: trip.departureTimestamp,
        arrivalTimestamp: trip.arrivalTimestamp,
        discounted: false,
      };

      return {
        trip,
        bus,
        status: computeBusOperationalStatus(trip, now),
      };
    })
    .filter((entry): entry is { trip: Trip; bus: TrackedBus; status: "On Standby" | "Travelling" | "Arrived" } => Boolean(entry));

  const travelling = mappedTrips
    .filter((entry) => entry.status === "Travelling")
    .sort((a, b) => a.trip.departureTimestamp - b.trip.departureTimestamp);

  const standby = mappedTrips
    .filter((entry) => entry.status === "On Standby")
    .sort((a, b) => a.trip.departureTimestamp - b.trip.departureTimestamp)
    .slice(0, 12);

  const arrived = mappedTrips
    .filter((entry) => entry.status === "Arrived")
    .sort((a, b) => b.trip.arrivalTimestamp - a.trip.arrivalTimestamp)
    .slice(0, 6);

  const combined = [...travelling, ...standby, ...arrived];
  const deduped: TrackedBus[] = [];
  const seen = new Set<string>();

  for (const entry of combined) {
    if (seen.has(entry.bus.id)) {
      continue;
    }

    seen.add(entry.bus.id);
    deduped.push(entry.bus);
  }

  return deduped;
}

export function resolveLiveBusState(bus: TrackedBus, now: number): LiveBusState {
  const route = routes.find((entry) => entry.name === bus.routeName) ?? routes[0];
  const routeDistanceKm = calculateDistance(route.path);
  const fallbackEtaMinutes = estimateEtaMinutes(routeDistanceKm, bus.busType);
  const expectedArrivalTimestamp =
    bus.arrivalTimestamp > bus.departureTimestamp
      ? bus.arrivalTimestamp
      : bus.departureTimestamp + fallbackEtaMinutes * 60_000;
  const etaMinutes = Math.max(1, Math.round((expectedArrivalTimestamp - bus.departureTimestamp) / 60_000));
  const elapsedMinutes = (now - bus.departureTimestamp) / 60_000;
  const progress = Math.max(0, Math.min(1, elapsedMinutes / Math.max(etaMinutes, 1)));
  const remainingMinutes = Math.max(0, Math.round(etaMinutes * (1 - progress)));
  const stopStates = buildStopStates(route, bus.departureTimestamp, etaMinutes, now);
  const nextStop = stopStates.find((stop) => stop.status === "upcoming")?.municipality ?? route.path[route.path.length - 1];
  const busOperationalStatus =
    now < bus.departureTimestamp
      ? "On Standby"
      : now < expectedArrivalTimestamp
        ? "Travelling"
        : "Arrived";
  const position = interpolatePosition(resolveRouteCoordinates(route), progress);

  return {
    bus,
    route,
    busOperationalStatus,
    routeDistanceKm,
    etaMinutes,
    progress,
    remainingMinutes,
    nextStop,
    expectedArrivalTimestamp,
    stopStates,
    position,
  };
}
