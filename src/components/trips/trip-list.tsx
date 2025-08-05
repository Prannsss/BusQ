
"use client";

import React, { useMemo, useEffect, useState } from "react";
import type { Trip, FilterableBusType, BusType, TripDirection, PhysicalBusId, DisplayTripInfo, TripStatus, BadgeColorKey, SouthTerminalDestination } from "@/types";
import { southTerminalDestinations } from "@/types";
import { TripCard } from "./trip-card";
import { AlertTriangle, Info } from "lucide-react";
import { format, addHours, setHours, setMinutes, setSeconds, setMilliseconds, parse, addDays } from 'date-fns';

const TRAVEL_DURATION_HOURS = 4;
const PARK_DURATION_HOURS = 1;

// Define the 8 physical buses with their names and schedules
const PHYSICAL_BUS_SCHEDULES: Array<{
  physicalBusId: PhysicalBusId;
  busType: BusType;
  busName: string;
  departureTime: string; // HH:mm format
  busPlateNumber: string;
}> = [
  { 
    physicalBusId: "TRAD-001", 
    busType: "Traditional", 
    busName: "Ceres Express 1",
    departureTime: "05:00", 
    busPlateNumber: "BUS-STB-0500" 
  },
  { 
    physicalBusId: "TRAD-002", 
    busType: "Traditional", 
    busName: "Sunrays Transit 1",
    departureTime: "06:00", 
    busPlateNumber: "BUS-STB-0600" 
  },
  { 
    physicalBusId: "AC-001", 
    busType: "Airconditioned", 
    busName: "Ceres Deluxe 1",
    departureTime: "07:00", 
    busPlateNumber: "BUS-STB-0700-AC" 
  },
  { 
    physicalBusId: "TRAD-003", 
    busType: "Traditional", 
    busName: "Sunrays Express 2",
    departureTime: "08:00", 
    busPlateNumber: "BUS-STB-0800" 
  },
  { 
    physicalBusId: "AC-002", 
    busType: "Airconditioned", 
    busName: "Ceres Aircon 2",
    departureTime: "09:00", 
    busPlateNumber: "BUS-STB-0900-AC" 
  },
  { 
    physicalBusId: "TRAD-004", 
    busType: "Traditional", 
    busName: "Sunrays Transit 3",
    departureTime: "10:00", 
    busPlateNumber: "BUS-STB-1000" 
  },
  { 
    physicalBusId: "AC-003", 
    busType: "Airconditioned", 
    busName: "Ceres Deluxe 3",
    departureTime: "11:00", 
    busPlateNumber: "BUS-STB-1100-AC" 
  },
  { 
    physicalBusId: "TRAD-005", 
    busType: "Traditional", 
    busName: "Sunrays Express 4",
    departureTime: "14:00", 
    busPlateNumber: "BUS-STB-1400" 
  },
];

const generateTodaysTrips = (): Trip[] => {
  const allTrips: Trip[] = [];
  const today = new Date();

  PHYSICAL_BUS_SCHEDULES.forEach(busSchedule => {
    const [hours, minutes] = busSchedule.departureTime.split(':').map(Number);
    let departureDateTime = setHours(setMinutes(setSeconds(setMilliseconds(new Date(today), 0), 0), minutes), hours);
    
    // Each bus goes the full route to Santander (the furthest destination)
    // Passengers can choose their drop-off point during booking
    const finalDestination = "Santander";
    const travelTimeHours = getDestinationTravelTime(finalDestination);
    let arrivalDateTime = addHours(departureDateTime, travelTimeHours);

    const totalSeats = busSchedule.busType === "Airconditioned" ? 45 : 35;
    const busNumericId = parseInt(busSchedule.physicalBusId.replace(/[^0-9]/g, ''), 10) || 1;
    // Deterministic seat availability for consistency
    const availableSeatsForType = busSchedule.busType === "Airconditioned"
        ? (30 + (busNumericId % 15)) 
        : (20 + (busNumericId % 15));
    
    // Base price to the furthest destination
    const price = getDestinationPrice(finalDestination, busSchedule.busType);

    const trip: Trip = {
      id: `${busSchedule.physicalBusId}-STB-${format(departureDateTime, "yyyyMMddHHmm")}`,
      physicalBusId: busSchedule.physicalBusId,
      direction: "South_Terminal_to_Destination",
      origin: "South Bus Terminal",
      destination: finalDestination, // Full route destination
      departureTime: format(departureDateTime, "HH:mm"),
      arrivalTime: format(arrivalDateTime, "HH:mm"),
      busType: busSchedule.busType,
      price: price,
      tripDate: format(departureDateTime, "yyyy-MM-dd"),
      departureTimestamp: departureDateTime.getTime(),
      arrivalTimestamp: arrivalDateTime.getTime(),
      availableSeats: Math.min(totalSeats, Math.max(5, availableSeatsForType)),
      totalSeats: totalSeats,
      busPlateNumber: busSchedule.busPlateNumber,
      travelDurationMins: travelTimeHours * 60,
      stopoverDurationMins: 0, // No stopover for terminal trips
    };
    allTrips.push(trip);
  });

  return allTrips.sort((a, b) => a.departureTimestamp - b.departureTimestamp);
};

// Helper function to get travel time based on destination
const getDestinationTravelTime = (destination: SouthTerminalDestination): number => {
  const travelTimes: Record<SouthTerminalDestination, number> = {
    "Naga": 0.5,
    "San Fernando": 1,
    "Carcar": 1.5,
    "Sibonga": 2,
    "Argao": 2.5,
    "Dalaguete": 3,
    "Alcoy": 3.5,
    "Boljoon": 4,
    "Oslob": 4.5,
    "Santander": 5,
  };
  return travelTimes[destination] || 2;
};

// Helper function to get bus name from physical bus ID
const getBusName = (physicalBusId: PhysicalBusId): string => {
  const busSchedule = PHYSICAL_BUS_SCHEDULES.find(schedule => schedule.physicalBusId === physicalBusId);
  return busSchedule?.busName || "Unknown Bus";
};

// Helper function to get price based on destination and bus type
const getDestinationPrice = (destination: SouthTerminalDestination, busType: BusType): number => {
  const priceMatrix: Record<SouthTerminalDestination, Record<BusType, number>> = {
    "Naga": { "Traditional": 25, "Airconditioned": 35 },
    "San Fernando": { "Traditional": 35, "Airconditioned": 45 },
    "Carcar": { "Traditional": 45, "Airconditioned": 55 },
    "Sibonga": { "Traditional": 55, "Airconditioned": 70 },
    "Argao": { "Traditional": 70, "Airconditioned": 85 },
    "Dalaguete": { "Traditional": 85, "Airconditioned": 100 },
    "Alcoy": { "Traditional": 100, "Airconditioned": 120 },
    "Boljoon": { "Traditional": 120, "Airconditioned": 140 },
    "Oslob": { "Traditional": 140, "Airconditioned": 160 },
    "Santander": { "Traditional": 160, "Airconditioned": 180 },
  };
  return priceMatrix[destination][busType];
};

// Generate all possible trips for today once when the module loads
const ALL_POSSIBLE_TRIP_LEGS_TODAY = generateTodaysTrips();


interface TripListProps {
  activeBusTypeFilter: FilterableBusType;
}

export function TripList({ activeBusTypeFilter }: TripListProps) {
  const [currentTime, setCurrentTime] = useState<number | null>(null);

  useEffect(() => {
    // Set current time only on the client after the initial mount
    setCurrentTime(new Date().getTime());

    const timerId = setInterval(() => {
      setCurrentTime(new Date().getTime());
    }, 30000); // Update status every 30 seconds

    return () => clearInterval(timerId);
  }, []);

  const displayableTrips = useMemo(() => {
    const now = currentTime || new Date().getTime();
    
    // Filter trips based on filters
    let filteredTrips = ALL_POSSIBLE_TRIP_LEGS_TODAY.filter(trip => {
      // Filter by bus type
      if (activeBusTypeFilter !== "all" && trip.busType !== activeBusTypeFilter) {
        return false;
      }
      
      return true;
    });

    // Convert to DisplayTripInfo with current status
    const displayTrips: DisplayTripInfo[] = filteredTrips.map(trip => {
      let displayStatus: TripStatus;
      let badgeColorKey: BadgeColorKey;

      if (now < trip.departureTimestamp) {
        displayStatus = "Scheduled";
        badgeColorKey = "blue";
      } else if (now < trip.arrivalTimestamp) {
        displayStatus = "Travelling";
        badgeColorKey = "green";
      } else {
        displayStatus = "Completed for Day";
        badgeColorKey = "gray";
      }

      return {
        ...trip,
        displayStatus,
        badgeColorKey,
        busName: getBusName(trip.physicalBusId), // Add bus name to display info
      };
    });

    // Sort by departure time
    return displayTrips.sort((a, b) => a.departureTimestamp - b.departureTimestamp);
  }, [activeBusTypeFilter, currentTime]);

  if (displayableTrips.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No trips found</h3>
        <p className="text-muted-foreground">
          Try adjusting your filters to see available trips.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {displayableTrips.map((trip) => (
        <TripCard key={trip.id} trip={trip} />
      ))}
    </div>
  );
}
