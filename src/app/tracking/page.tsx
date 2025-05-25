
"use client";

import React, { useState, useEffect, useMemo, Suspense, lazy } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { MapPin, Clock, Loader2 } from "lucide-react";
import type { Trip, BusType, TripDirection, TripStatus, PhysicalBusId, CyclicalBusInfo, CurrentRouteLeg, BadgeColorKey } from "@/types";
import { format, addMinutes, setHours, setMinutes, setSeconds, setMilliseconds, addHours as dateFnsAddHours, parseISO, isBefore, isAfter, isEqual, addDays } from 'date-fns';

// Lazy load the BusMap component
const BusMap = lazy(() => import('@/components/tracking/bus-map').then(module => ({ default: module.BusMap })));


const TRAVEL_DURATION_HOURS_TRACKING = 4;
const PARK_DURATION_HOURS_TRACKING = 1;

// Define the 8 physical buses and their initial Mantalongon departure time
const PHYSICAL_BUS_SCHEDULES_TRACKING: Array<{
  physicalBusId: PhysicalBusId;
  busType: BusType;
  mantalongonDepartureTime: string; // HH:mm format
  busPlateNumber: string; 
}> = [
  { physicalBusId: "TRAD-001", busType: "Traditional", mantalongonDepartureTime: "02:45", busPlateNumber: "BUS-MTC-0245" },
  { physicalBusId: "TRAD-002", busType: "Traditional", mantalongonDepartureTime: "03:20", busPlateNumber: "BUS-MTC-0320" },
  { physicalBusId: "TRAD-003", busType: "Traditional", mantalongonDepartureTime: "04:00", busPlateNumber: "BUS-MTC-0400" },
  { physicalBusId: "TRAD-004", busType: "Traditional", mantalongonDepartureTime: "05:30", busPlateNumber: "BUS-MTC-0530" },
  { physicalBusId: "AC-001",   busType: "Airconditioned", mantalongonDepartureTime: "08:00", busPlateNumber: "BUS-MTC-0800-AC" },
  { physicalBusId: "TRAD-005", busType: "Traditional", mantalongonDepartureTime: "11:30", busPlateNumber: "BUS-MTC-1130" },
  { physicalBusId: "TRAD-006", busType: "Traditional", mantalongonDepartureTime: "12:00", busPlateNumber: "BUS-MTC-1200" },
  { physicalBusId: "TRAD-007", busType: "Traditional", mantalongonDepartureTime: "13:00", busPlateNumber: "BUS-MTC-1300" },
];


const generateTodaysTripsForTracking = (): Trip[] => {
  const allTripLegs: Trip[] = [];
  const today = new Date();

  PHYSICAL_BUS_SCHEDULES_TRACKING.forEach(busSchedule => {
      const [hours, minutes] = busSchedule.mantalongonDepartureTime.split(':').map(Number);
      
      let outboundDepartureDateTime = setHours(setMinutes(setSeconds(setMilliseconds(new Date(today), 0), 0), minutes), hours);
      let outboundArrivalDateTime = dateFnsAddHours(outboundDepartureDateTime, TRAVEL_DURATION_HOURS_TRACKING);

      const totalSeats = busSchedule.busType === "Airconditioned" ? 65 : 53;
      const price = busSchedule.busType === "Airconditioned" ? 200 : 180;
      // Deterministic available seats
      const busNumericId = parseInt(busSchedule.physicalBusId.replace(/[^0-9]/g, ''), 10) || 1;
      const baseAvailableSeats = busSchedule.busType === "Airconditioned" 
          ? (40 + (busNumericId % 25)) 
          : (25 + (busNumericId % 28));
      const availableSeatsForType = Math.max(5, Math.min(totalSeats, baseAvailableSeats));


      const outboundTripLeg: Trip = {
          id: `${busSchedule.physicalBusId}-MtoC-${format(outboundDepartureDateTime, "yyyyMMddHHmm")}`,
          physicalBusId: busSchedule.physicalBusId,
          direction: "Mantalongon_to_Cebu",
          origin: "Mantalongon",
          destination: "Cebu City",
          departureTime: busSchedule.mantalongonDepartureTime,
          arrivalTime: format(outboundArrivalDateTime, "HH:mm"),
          busType: busSchedule.busType,
          price: price,
          tripDate: format(outboundDepartureDateTime, "yyyy-MM-dd"),
          departureTimestamp: outboundDepartureDateTime.getTime(),
          arrivalTimestamp: outboundArrivalDateTime.getTime(),
          availableSeats: availableSeatsForType, 
          totalSeats: totalSeats,
          busPlateNumber: busSchedule.busPlateNumber,
          travelDurationMins: TRAVEL_DURATION_HOURS_TRACKING * 60,
          stopoverDurationMins: PARK_DURATION_HOURS_TRACKING * 60,
      };
      allTripLegs.push(outboundTripLeg);

      let returnDepartureDateTime = dateFnsAddHours(outboundArrivalDateTime, PARK_DURATION_HOURS_TRACKING);
      let returnArrivalDateTime = dateFnsAddHours(returnDepartureDateTime, TRAVEL_DURATION_HOURS_TRACKING);

      const returnTripLeg: Trip = {
          id: `${busSchedule.physicalBusId}-CtoM-${format(returnDepartureDateTime, "yyyyMMddHHmm")}`,
          physicalBusId: busSchedule.physicalBusId,
          direction: "Cebu_to_Mantalongon",
          origin: "Cebu City",
          destination: "Mantalongon",
          departureTime: format(returnDepartureDateTime, "HH:mm"),
          arrivalTime: format(returnArrivalDateTime, "HH:mm"),
          busType: busSchedule.busType,
          price: price,
          tripDate: format(returnDepartureDateTime, "yyyy-MM-dd"),
          departureTimestamp: returnDepartureDateTime.getTime(),
          arrivalTimestamp: returnArrivalDateTime.getTime(),
          availableSeats: availableSeatsForType,
          totalSeats: totalSeats,
          busPlateNumber: busSchedule.busPlateNumber,
          travelDurationMins: TRAVEL_DURATION_HOURS_TRACKING * 60,
          stopoverDurationMins: PARK_DURATION_HOURS_TRACKING * 60,
      };
      allTripLegs.push(returnTripLeg);
  });
  
  allTripLegs.sort((a, b) => a.departureTimestamp - b.departureTimestamp);
  return allTripLegs;
};

const getCyclicalBusStatus = (
  physicalBusId: PhysicalBusId,
  allTripsForDay: Trip[],
  currentDateTime: Date
): CyclicalBusInfo => {
  const busTrips = allTripsForDay.filter(trip => trip.physicalBusId === physicalBusId);
  const mToCLeg = busTrips.find(trip => trip.direction === "Mantalongon_to_Cebu");
  const cToMLeg = busTrips.find(trip => trip.direction === "Cebu_to_Mantalongon");

  let status: TripStatus = "Scheduled";
  let currentOrigin = "Mantalongon";
  let currentDestination = "Cebu City";
  let currentLeg: CurrentRouteLeg = 'first-leg';
  let badgeColor: BadgeColorKey = "blue";
  let nextStatusChangeAt: Date | undefined = undefined;
  let displayMessage = "Bus status initializing...";
  let currentBusPlate = mToCLeg?.busPlateNumber || cToMLeg?.busPlateNumber || "N/A";


  if (!mToCLeg) {
    return { currentStatus: "Completed for Day", currentOrigin: "Unknown", currentDestination: "Unknown", currentRouteLeg: 'unknown', displayMessage: `No Mantalongon->Cebu schedule found for ${physicalBusId}`, badgeColorKey: "gray" };
  }
  if (!cToMLeg) { // This case might be valid if a bus only does one leg a day and parks.
                 // For this cyclical logic, we assume it aims for a round trip.
    return { currentStatus: "Completed for Day", currentOrigin: mToCLeg.origin, currentDestination: mToCLeg.destination, currentRouteLeg: 'unknown', displayMessage: `No Cebu->Mantalongon return schedule found for ${physicalBusId}`, badgeColorKey: "gray"};
  }

  const firstLegDep = new Date(mToCLeg.departureTimestamp);
  const firstLegArr = new Date(mToCLeg.arrivalTimestamp);
  const returnLegDep = new Date(cToMLeg.departureTimestamp);
  const returnLegArr = new Date(cToMLeg.arrivalTimestamp);
  
  // Adjust dates to today/tomorrow if needed for comparison
  const adjustToCurrentCycle = (eventTime: Date, baseTime: Date = currentDateTime): Date => {
    let adjustedTime = new Date(eventTime);
    adjustedTime.setFullYear(baseTime.getFullYear(), baseTime.getMonth(), baseTime.getDate());

    // If the adjusted event time is in the past relative to current time, 
    // and we are not already in the 'Completed for Day' phase for today,
    // consider if this event should be for the next day's cycle.
    // This is a simplified daily cycle logic.
    if (isBefore(adjustedTime, baseTime) && !isEqual(adjustedTime.toDateString(), returnLegArr.toDateString()) ) {
        // If current time is already past today's final arrival, and the event is for a time earlier than that,
        // it's likely for the next day.
        if (isAfter(baseTime, returnLegArr) && isBefore(adjustedTime, returnLegArr)) {
             adjustedTime = addDays(adjustedTime, 1);
        }
    }
    return adjustedTime;
  };

  // Create date objects for today's cycle based on current time
  const todayFirstLegDep = adjustToCurrentCycle(firstLegDep);
  const todayFirstLegArr = adjustToCurrentCycle(firstLegArr);
  const todayReturnLegDep = adjustToCurrentCycle(returnLegDep);
  const todayReturnLegArr = adjustToCurrentCycle(returnLegArr);


  if (isBefore(currentDateTime, todayFirstLegDep)) {
    status = "Scheduled";
    currentOrigin = mToCLeg.origin;
    currentDestination = mToCLeg.destination;
    currentLeg = 'first-leg'; // Will depart for first leg
    badgeColor = "blue";
    nextStatusChangeAt = todayFirstLegDep;
    displayMessage = `Bus ${currentBusPlate} is scheduled to depart ${currentOrigin} at ${mToCLeg.departureTime}.`;
  } else if (isBefore(currentDateTime, todayFirstLegArr)) {
    status = "Travelling";
    currentOrigin = mToCLeg.origin;
    currentDestination = mToCLeg.destination;
    currentLeg = 'first-leg';
    badgeColor = "green";
    nextStatusChangeAt = todayFirstLegArr;
    displayMessage = `Bus ${currentBusPlate} is travelling from ${currentOrigin} to ${currentDestination}. Expected arrival: ${mToCLeg.arrivalTime}.`;
  } else if (isBefore(currentDateTime, todayReturnLegDep)) {
    status = "Parked at Destination"; // Parked at Cebu
    currentOrigin = mToCLeg.destination; 
    currentDestination = cToMLeg.destination; // Next destination is Mantalongon
    currentLeg = 'parked-at-destination';
    badgeColor = "yellow";
    nextStatusChangeAt = todayReturnLegDep;
    displayMessage = `Bus ${currentBusPlate} is parked at ${currentOrigin}. Next departure to ${currentDestination} at ${cToMLeg.departureTime}.`;
  } else if (isBefore(currentDateTime, todayReturnLegArr)) {
    status = "Returning";
    currentOrigin = cToMLeg.origin;
    currentDestination = cToMLeg.destination;
    currentLeg = 'return-leg';
    badgeColor = "orange";
    nextStatusChangeAt = todayReturnLegArr;
    displayMessage = `Bus ${currentBusPlate} is returning from ${currentOrigin} to ${currentDestination}. Expected arrival: ${cToMLeg.arrivalTime}.`;
  } else {
    status = "Completed for Day";
    currentOrigin = cToMLeg.destination; // Parked at Mantalongon
    currentDestination = mToCLeg.destination; // Next day starts towards Cebu for mToCLeg
    currentLeg = 'parked-at-origin';
    badgeColor = "gray";
    const nextDayFirstLegDep = addDays(todayFirstLegDep,1); // Next departure is the *first leg's* departure time tomorrow
    nextStatusChangeAt = nextDayFirstLegDep;
    displayMessage = `Bus ${currentBusPlate} has completed its trips for the day. Parked at ${currentOrigin}. Next scheduled departure for ${currentDestination} is ${mToCLeg.departureTime} tomorrow.`;
  }

  return {
    currentStatus: status,
    currentOrigin,
    currentDestination,
    currentRouteLeg: currentLeg,
    nextStatusChangeAt,
    displayMessage,
    badgeColorKey: badgeColor,
  };
};


export default function TrackingPage() {
  const [allTrips, setAllTrips] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string>(""); 
  const [detailedBusStatus, setDetailedBusStatus] = useState<CyclicalBusInfo | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date()); // For forcing re-renders


  useEffect(() => {
    setAllTrips(generateTodaysTripsForTracking());
  }, []);

  const tripToTrackInitialLeg = useMemo(() => {
    // Find the *first leg* (Mantalongon to Cebu) of the selected physical bus
    // The selectedTripId corresponds to one of the initial outbound legs displayed in the dropdown
    return allTrips.find(trip => trip.id === selectedTripId && trip.direction === "Mantalongon_to_Cebu") || null;
  }, [selectedTripId, allTrips]);


  useEffect(() => {
    const calculateAndSetDetailedStatus = () => {
      if (tripToTrackInitialLeg && tripToTrackInitialLeg.physicalBusId && allTrips.length > 0) {
        const statusInfo = getCyclicalBusStatus(tripToTrackInitialLeg.physicalBusId, allTrips, new Date());
        setDetailedBusStatus(statusInfo);
      } else {
        setDetailedBusStatus(null);
      }
    };
    
    calculateAndSetDetailedStatus(); // Initial calculation
    const intervalId = setInterval(() => {
        setCurrentTime(new Date()); // Update current time to trigger re-calculation if needed
        calculateAndSetDetailedStatus();
    }, 30000); // Re-calculate every 30 seconds

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, [tripToTrackInitialLeg, allTrips]); // Re-run if the selected bus or the list of all trips changes


  const getDisplayMessage = () => {
    if (!tripToTrackInitialLeg) return "Select a bus to see its live location.";
    if (!detailedBusStatus) return "Calculating bus status...";
    return detailedBusStatus.displayMessage;
  };
  
  // Use the plate number from the *initially selected outbound leg* for the BusMap
  // The BusMap itself doesn't need to know the bus's current cyclical leg, just its physical ID.
  const busPlateForMap = tripToTrackInitialLeg?.busPlateNumber || "default-bus-id";

  return (
    <div className="space-y-8">
      <header className="text-center">
        <MapPin className="mx-auto h-12 w-12 text-primary mb-4" />
        <h1 className="text-4xl font-bold text-foreground">Real-Time Bus Tracking</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Select a bus by its initial departure from Mantalongon to see its current status.
        </p>
      </header>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-foreground">Select a Bus to Track (Initial Departure)</CardTitle>
          <CardDescription>Choose the bus based on its first scheduled trip from Mantalongon.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 items-end"> 
            <div>
              <Label htmlFor="departure-time-select" className="text-muted-foreground">Mantalongon Departure Time</Label>
              <Select 
                value={selectedTripId} 
                onValueChange={(value) => {
                  setSelectedTripId(value);
                  // When selection changes, detailedBusStatus will be recalculated by its useEffect
                }}
              >
                <SelectTrigger id="departure-time-select" className="w-full bg-input border-border focus:ring-primary">
                  <SelectValue placeholder="Select departure time from Mantalongon" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-popover">
                  {PHYSICAL_BUS_SCHEDULES_TRACKING.map((sched) => {
                    // Find the outbound trip ID corresponding to this physical bus schedule entry
                    const outboundTrip = allTrips.find(t => t.physicalBusId === sched.physicalBusId && t.direction === "Mantalongon_to_Cebu");
                    if (!outboundTrip) return null; // Should ideally not happen if allTrips is generated correctly
                    return (
                      <SelectItem key={outboundTrip.id} value={outboundTrip.id}>
                        {outboundTrip.departureTime} ({outboundTrip.busType}) - Plate: {outboundTrip.busPlateNumber}
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

