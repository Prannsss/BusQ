
import React, { useMemo, useEffect, useState } from "react";
import type { Trip, FilterableBusType, BusType, TripDirection, FilterableTripDirection, PhysicalBusId, DisplayTripInfo, TripStatus, BadgeColorKey } from "@/types";
import { TripCard } from "./trip-card";
import { AlertTriangle } from "lucide-react";
import { format, addHours, setHours, setMinutes, setSeconds, setMilliseconds, parse } from 'date-fns';

const TRAVEL_DURATION_HOURS = 4;
const PARK_DURATION_HOURS = 1; 

// Define the 8 physical buses and their initial Mantalongon departure time
const PHYSICAL_BUS_SCHEDULES: Array<{
  physicalBusId: PhysicalBusId;
  busType: BusType;
  mantalongonDepartureTime: string; 
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

const generateTodaysTrips = (): Trip[] => {
  const allTripLegs: Trip[] = [];
  const today = new Date();

  PHYSICAL_BUS_SCHEDULES.forEach(busSchedule => {
    const [outboundHours, outboundMinutes] = busSchedule.mantalongonDepartureTime.split(':').map(Number);
    let outboundDepartureDateTime = setHours(setMinutes(setSeconds(setMilliseconds(new Date(today), 0), 0), outboundMinutes), outboundHours);
    let outboundArrivalDateTime = addHours(outboundDepartureDateTime, TRAVEL_DURATION_HOURS);

    const totalSeats = busSchedule.busType === "Airconditioned" ? 65 : 53;
    // Deterministic available seats for consistency across renders
    const busNumericId = parseInt(busSchedule.physicalBusId.replace(/[^0-9]/g, ''), 10) || 1;
    const baseAvailableSeats = busSchedule.busType === "Airconditioned" 
        ? (40 + (busNumericId % 25)) 
        : (25 + (busNumericId % 28));
    const availableSeatsForType = Math.max(5, Math.min(totalSeats, baseAvailableSeats));

    const price = busSchedule.busType === "Airconditioned" ? 200 : 180;

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
      travelDurationMins: TRAVEL_DURATION_HOURS * 60,
      stopoverDurationMins: PARK_DURATION_HOURS * 60,
    };
    allTripLegs.push(outboundTripLeg);

    let returnDepartureDateTime = addHours(outboundArrivalDateTime, PARK_DURATION_HOURS);
    let returnArrivalDateTime = addHours(returnDepartureDateTime, TRAVEL_DURATION_HOURS);

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
      travelDurationMins: TRAVEL_DURATION_HOURS * 60,
      stopoverDurationMins: PARK_DURATION_HOURS * 60,
    };
    allTripLegs.push(returnTripLeg);
  });
  
  allTripLegs.sort((a, b) => a.departureTimestamp - b.departureTimestamp);
  return allTripLegs;
};

const ALL_POSSIBLE_TRIP_LEGS_TODAY = generateTodaysTrips();

interface TripListProps {
  activeBusTypeFilter: FilterableBusType;
  activeDirectionFilter: FilterableTripDirection;
}

export function TripList({ activeBusTypeFilter, activeDirectionFilter }: TripListProps) {
  const [isClient, setIsClient] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().getTime());

  useEffect(() => {
    setIsClient(true);
    const timerId = setInterval(() => {
      setCurrentTime(new Date().getTime());
    }, 30000); 
    return () => clearInterval(timerId);
  }, []);

  const displayableBusStates = useMemo(() => {
    if (!isClient) return []; // Don't compute on server or before client hydration

    const now = currentTime;
    const representations: DisplayTripInfo[] = [];

    PHYSICAL_BUS_SCHEDULES.forEach(busSched => {
      const mToCLeg = ALL_POSSIBLE_TRIP_LEGS_TODAY.find(
        leg => leg.physicalBusId === busSched.physicalBusId && leg.direction === "Mantalongon_to_Cebu"
      );
      const cToMLeg = ALL_POSSIBLE_TRIP_LEGS_TODAY.find(
        leg => leg.physicalBusId === busSched.physicalBusId && leg.direction === "Cebu_to_Mantalongon"
      );

      if (!mToCLeg || !cToMLeg) {
        console.warn(`Missing legs for physicalBusId: ${busSched.physicalBusId}`);
        return;
      }

      let representativeLeg: Trip | undefined;
      let currentDisplayStatus: TripStatus | undefined;
      let currentBadgeColorKey: BadgeColorKey | undefined;

      if (now < mToCLeg.departureTimestamp) {
        // Phase 1: Scheduled for outbound M->C trip
        representativeLeg = mToCLeg;
        currentDisplayStatus = "Scheduled";
        currentBadgeColorKey = "blue";
      } else if (now < mToCLeg.arrivalTimestamp) {
        // Phase 2: Travelling on outbound M->C trip
        representativeLeg = mToCLeg;
        currentDisplayStatus = "Travelling";
        currentBadgeColorKey = "green";
      } else if (now < cToMLeg.departureTimestamp) {
        // Phase 3: Parked at Cebu, *representing the upcoming return trip as Scheduled*
        representativeLeg = cToMLeg; 
        currentDisplayStatus = "Scheduled"; 
        currentBadgeColorKey = "blue";
      } else if (now < cToMLeg.arrivalTimestamp) {
        // Phase 4: Returning on C->M trip
        representativeLeg = cToMLeg;
        currentDisplayStatus = "Returning";
        currentBadgeColorKey = "orange";
      } else {
        // Phase 5: Completed all trips for the day
        representativeLeg = cToMLeg; 
        currentDisplayStatus = "Completed for Day";
        currentBadgeColorKey = "gray";
      }
      
      if (representativeLeg && currentDisplayStatus && currentBadgeColorKey) {
        const displayTrip: DisplayTripInfo = {
          ...representativeLeg,
          displayStatus: currentDisplayStatus,
          badgeColorKey: currentBadgeColorKey,
        };

        const busTypeMatch = activeBusTypeFilter === "all" || displayTrip.busType === activeBusTypeFilter;
        const directionMatch = activeDirectionFilter === "all" || displayTrip.direction === activeDirectionFilter;

        if (busTypeMatch && directionMatch) {
          representations.push(displayTrip);
        }
      }
    });
    
    representations.sort((a,b) => {
        if (a.displayStatus === "Scheduled" && b.displayStatus !== "Scheduled") return -1;
        if (a.displayStatus !== "Scheduled" && b.displayStatus === "Scheduled") return 1;
        return a.departureTimestamp - b.departureTimestamp;
    });

    return representations;

  }, [activeBusTypeFilter, activeDirectionFilter, currentTime, isClient]); 

  if (!isClient) {
     return <div className="text-center py-10 text-muted-foreground">Loading trips...</div>;
  }

  if (displayableBusStates.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <AlertTriangle className="mx-auto h-12 w-12 mb-4" />
        <p className="text-xl">No buses match the current filters.</p>
        <p>Please check back later or adjust your filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {displayableBusStates.map((displayTrip) => (
        <TripCard key={displayTrip.physicalBusId + "_" + displayTrip.direction + "_" + displayTrip.displayStatus} trip={displayTrip} />
      ))}
    </div>
  );
}
