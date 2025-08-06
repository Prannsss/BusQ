
"use client";

import React, { useState, useEffect, useMemo, Suspense, lazy } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { MapPin, Clock, Loader2 } from "lucide-react";
import type { Trip, BusType, TripDirection, TripStatus, PhysicalBusId, CyclicalBusInfo, CurrentRouteLeg, BadgeColorKey, SouthTerminalDestination } from "@/types";
import { southTerminalDestinations } from "@/types";
import { format, addMinutes, setHours, setMinutes, setSeconds, setMilliseconds, addHours, parseISO, isBefore, isAfter, isEqual, addDays } from 'date-fns';

const BusMap = lazy(() => import('@/components/tracking/bus-map').then(module => ({ default: module.BusMap })));

const TRAVEL_TIME_TO_DESTINATIONS = {
  "Naga": 30,
  "San Fernando": 45,
  "Carcar": 60,
  "Sibonga": 90,
  "Argao": 120,
  "Dalaguete": 150,
  "Alcoy": 180,
  "Boljoon": 210,
  "Oslob": 240,
  "Santander": 270
};

const PHYSICAL_BUS_SCHEDULES_TRACKING: Array<{
  physicalBusId: PhysicalBusId;
  busType: BusType;
  busName: string;
  southTerminalDepartureTime: string; 
  busPlateNumber: string; 
}> = [
  { physicalBusId: "TRAD-001", busType: "Traditional", busName: "Ceres Express 1", southTerminalDepartureTime: "05:00", busPlateNumber: "BUS-STB-0500" },
  { physicalBusId: "TRAD-002", busType: "Traditional", busName: "Sunrays Transit 1", southTerminalDepartureTime: "06:00", busPlateNumber: "BUS-STB-0600" },
  { physicalBusId: "AC-001", busType: "Airconditioned", busName: "Ceres Deluxe 1", southTerminalDepartureTime: "07:00", busPlateNumber: "BUS-STB-0700-AC" },
  { physicalBusId: "TRAD-003", busType: "Traditional", busName: "Sunrays Express 2", southTerminalDepartureTime: "08:00", busPlateNumber: "BUS-STB-0800" },
  { physicalBusId: "AC-002", busType: "Airconditioned", busName: "Ceres Aircon 2", southTerminalDepartureTime: "09:00", busPlateNumber: "BUS-STB-0900-AC" },
  { physicalBusId: "TRAD-004", busType: "Traditional", busName: "Sunrays Transit 3", southTerminalDepartureTime: "10:00", busPlateNumber: "BUS-STB-1000" },
  { physicalBusId: "AC-003", busType: "Airconditioned", busName: "Ceres Deluxe 3", southTerminalDepartureTime: "11:00", busPlateNumber: "BUS-STB-1100-AC" },
  { physicalBusId: "TRAD-005", busType: "Traditional", busName: "Sunrays Express 4", southTerminalDepartureTime: "14:00", busPlateNumber: "BUS-STB-1400" },
  { physicalBusId: "AC-004", busType: "Airconditioned", busName: "Ceres Deluxe 4", southTerminalDepartureTime: "15:00", busPlateNumber: "BUS-STB-1500-AC" },
  { physicalBusId: "TRAD-006", busType: "Traditional", busName: "Sunrays Express 5", southTerminalDepartureTime: "16:00", busPlateNumber: "BUS-STB-1600" },
  { physicalBusId: "AC-005", busType: "Airconditioned", busName: "Ceres Aircon 3", southTerminalDepartureTime: "17:00", busPlateNumber: "BUS-STB-1700-AC" },
  { physicalBusId: "TRAD-007", busType: "Traditional", busName: "Sunrays Transit 6", southTerminalDepartureTime: "18:00", busPlateNumber: "BUS-STB-1800" },
  { physicalBusId: "TRAD-008", busType: "Traditional", busName: "Sunrays Express 7", southTerminalDepartureTime: "19:00", busPlateNumber: "BUS-STB-1900" },
  { physicalBusId: "AC-006", busType: "Airconditioned", busName: "Ceres Deluxe 5", southTerminalDepartureTime: "20:00", busPlateNumber: "BUS-STB-2000-AC" },
  { physicalBusId: "AC-007", busType: "Airconditioned", busName: "Ceres Express 2", southTerminalDepartureTime: "21:00", busPlateNumber: "BUS-STB-2100-AC" },
];

const generateTodaysTripsForTracking = (): Trip[] => {
  const allTrips: Trip[] = [];
  const today = new Date();

  PHYSICAL_BUS_SCHEDULES_TRACKING.forEach(busSchedule => {
    const [hours, minutes] = busSchedule.southTerminalDepartureTime.split(':').map(Number);
    
    let departureDateTime = setHours(setMinutes(setSeconds(setMilliseconds(new Date(today), 0), 0), minutes), hours);
    
    // Each bus goes the full route to Santander (the furthest destination)
    const finalDestination = "Santander";
    const travelTimeMinutes = TRAVEL_TIME_TO_DESTINATIONS[finalDestination];
    let arrivalDateTime = addMinutes(departureDateTime, travelTimeMinutes);

    const totalSeats = busSchedule.busType === "Airconditioned" ? 65 : 53;
    const busNumericId = parseInt(busSchedule.physicalBusId.replace(/[^0-9]/g, ''), 10) || 1;
    const availableSeatsForType = busSchedule.busType === "Airconditioned" 
      ? (40 + (busNumericId % 25)) 
      : (25 + (busNumericId % 28));
    
    const baseFare = busSchedule.busType === "Airconditioned" ? 100 : 80;
    const distanceMultiplier = Math.ceil(travelTimeMinutes / 60);
    const price = baseFare + (distanceMultiplier * 20);

    const trip: Trip = {
      id: `${busSchedule.physicalBusId}-ST-${format(departureDateTime, "yyyyMMddHHmm")}`,
      physicalBusId: busSchedule.physicalBusId,
      direction: "South_Terminal_to_Destination",
      origin: "South Bus Terminal",
      destination: finalDestination, // Full route destination
      departureTime: busSchedule.southTerminalDepartureTime,
      arrivalTime: format(arrivalDateTime, "HH:mm"),
      busType: busSchedule.busType,
      price: price,
      tripDate: format(departureDateTime, "yyyy-MM-dd"),
      departureTimestamp: departureDateTime.getTime(),
      arrivalTimestamp: arrivalDateTime.getTime(),
      availableSeats: Math.min(totalSeats, Math.max(5, availableSeatsForType)), 
      totalSeats: totalSeats,
      busPlateNumber: busSchedule.busPlateNumber,
      travelDurationMins: travelTimeMinutes,
      stopoverDurationMins: 0,
    };
    allTrips.push(trip);
  });
  
  allTrips.sort((a, b) => a.departureTimestamp - b.departureTimestamp);
  return allTrips;
};

const ALL_TRIPS_FOR_TRACKING_TODAY = generateTodaysTripsForTracking();

// Helper function to get bus name from physical bus ID
const getBusName = (physicalBusId: PhysicalBusId): string => {
  const busSchedule = PHYSICAL_BUS_SCHEDULES_TRACKING.find(schedule => schedule.physicalBusId === physicalBusId);
  return busSchedule?.busName || "Unknown Bus";
};


const getBusStatus = (
  physicalBusId: PhysicalBusId,
  allTripsForDay: Trip[],
  currentDateTime: Date
): CyclicalBusInfo => {
  const busTrip = allTripsForDay.find(trip => trip.physicalBusId === physicalBusId);

  if (!busTrip) {
    return { 
      currentStatus: "Completed for Day", 
      currentOrigin: "Unknown", 
      currentDestination: "Unknown", 
      currentRouteLeg: 'unknown', 
      displayMessage: `No schedule found for ${physicalBusId}`, 
      badgeColorKey: "gray" 
    };
  }

  const todayDate = new Date(currentDateTime);
  const [hours, minutes] = busTrip.departureTime.split(':').map(Number);
  const departureDateTime = setHours(setMinutes(setSeconds(setMilliseconds(new Date(todayDate), 0), 0), minutes), hours);
  const arrivalDateTime = addMinutes(departureDateTime, busTrip.travelDurationMins);

  let status: TripStatus = "Scheduled";
  let badgeColor: BadgeColorKey = "blue";
  let displayMessage = "Bus status initializing...";

  if (isBefore(currentDateTime, departureDateTime)) {
    status = "Scheduled";
    badgeColor = "blue";
    displayMessage = `Bus ${busTrip.busPlateNumber} is scheduled to depart ${busTrip.origin} at ${busTrip.departureTime} for ${busTrip.destination}.`;
  } else if (isBefore(currentDateTime, arrivalDateTime)) {
    status = "Travelling";
    badgeColor = "green";
    displayMessage = `Bus ${busTrip.busPlateNumber} is travelling from ${busTrip.origin} to ${busTrip.destination}. Expected arrival: ${busTrip.arrivalTime}.`;
  } else {
    status = "Completed for Day";
    badgeColor = "gray";
    displayMessage = `Bus ${busTrip.busPlateNumber} has completed its trip to ${busTrip.destination}. Arrived at ${busTrip.arrivalTime}.`;
  }

  return {
    currentStatus: status,
    currentOrigin: busTrip.origin,
    currentDestination: busTrip.destination,
    currentRouteLeg: 'first-leg',
    displayMessage,
    badgeColorKey: badgeColor,
  };
};


export default function TrackingPage() {
  const [selectedTripId, setSelectedTripId] = useState<string>(""); 
  const [detailedBusStatus, setDetailedBusStatus] = useState<CyclicalBusInfo | null>(null);
  const [currentTimeForEffect, setCurrentTimeForEffect] = useState(new Date());


  const tripToTrack = useMemo(() => {
    return ALL_TRIPS_FOR_TRACKING_TODAY.find(trip => trip.id === selectedTripId) || null;
  }, [selectedTripId]);


  useEffect(() => {
    const calculateAndSetDetailedStatus = () => {
      if (tripToTrack && tripToTrack.physicalBusId && ALL_TRIPS_FOR_TRACKING_TODAY.length > 0) {
        const statusInfo = getBusStatus(tripToTrack.physicalBusId, ALL_TRIPS_FOR_TRACKING_TODAY, new Date());
        setDetailedBusStatus(statusInfo);
      } else {
        setDetailedBusStatus(null);
      }
    };
    
    calculateAndSetDetailedStatus(); 
    const intervalId = setInterval(() => {
        setCurrentTimeForEffect(new Date()); 
        calculateAndSetDetailedStatus();
    }, 30000); 

    return () => clearInterval(intervalId); 
  }, [tripToTrack]); 


  const getDisplayMessage = () => {
    if (!tripToTrack) return "Select a bus to see its live location.";
    if (!detailedBusStatus) return "Calculating bus status...";
    return detailedBusStatus.displayMessage;
  };
  
  const busPlateForMap = tripToTrack?.busPlateNumber || "default-bus-id";

  return (
    <div className="space-y-8">
      <header className="text-center">
        <MapPin className="mx-auto h-12 w-12 text-primary mb-4" />
        <h1 className="text-4xl font-bold text-foreground">Real-Time Bus Tracking</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Track buses departing from South Bus Terminal to various destinations.
        </p>
      </header>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-foreground">Select a Bus to Track</CardTitle>
          <CardDescription>Choose a bus by its departure from South Bus Terminal.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 items-end"> 
            <div>
              <Label htmlFor="departure-time-select" className="text-muted-foreground">South Terminal Departure</Label>
              <Select 
                value={selectedTripId} 
                onValueChange={setSelectedTripId}
              >
                <SelectTrigger id="departure-time-select" className="w-full bg-input border-border focus:ring-primary">
                  <SelectValue placeholder="Select bus departure from South Terminal" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-popover">
                  {PHYSICAL_BUS_SCHEDULES_TRACKING.map((sched) => {
                    const trip = ALL_TRIPS_FOR_TRACKING_TODAY.find(t => t.physicalBusId === sched.physicalBusId);
                    if (!trip) return null;
                    const busTypeLabel = trip.busType === "Airconditioned" ? "AC" : "Traditional";
                    return (
                      <SelectItem key={trip.id} value={trip.id}>
                        {sched.busName} - {trip.departureTime} ({busTypeLabel})
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-xl overflow-hidden">
        <CardHeader>
            <CardTitle className="text-2xl text-primary">Live Status</CardTitle>
            <CardDescription>
             {getDisplayMessage()}
            </CardDescription>
        </CardHeader>
        <CardContent className="p-0 md:p-0">
          <div className="h-[500px] w-full bg-muted rounded-b-md">
            <Suspense fallback={
              <div className="flex flex-col items-center justify-center h-full bg-muted text-muted-foreground">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p>Loading map...</p>
              </div>
            }>
              <BusMap busId={busPlateForMap} /> 
            </Suspense>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
