
import React, { useMemo, useEffect, useState } from "react";
import type { Trip, FilterableBusType, BusType, TripDirection, FilterableTripDirection, PhysicalBusId, DisplayTripInfo, TripStatus, BadgeColorKey } from "@/types";
import { TripCard } from "./trip-card";
import { AlertTriangle } from "lucide-react";
import { format, addHours, setHours, setMinutes, setSeconds, setMilliseconds, parse, addDays } from 'date-fns';

const TRAVEL_DURATION_HOURS = 4;
const PARK_DURATION_HOURS = 1;

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
  const today = new Date(); // "Today" is determined when the module loads

  PHYSICAL_BUS_SCHEDULES.forEach(busSchedule => {
    const [outboundHours, outboundMinutes] = busSchedule.mantalongonDepartureTime.split(':').map(Number);
    let outboundDepartureDateTime = setHours(setMinutes(setSeconds(setMilliseconds(new Date(today), 0), 0), outboundMinutes), outboundHours);
    
    // If the outbound departure time for today is already in the past for very early morning trips,
    // assume schedule is for "current operational day" which might mean "today" or "tomorrow morning".
    // This is a simplification for mock data.
    if (outboundDepartureDateTime.getTime() < today.getTime() && today.getHours() > outboundHours + TRAVEL_DURATION_HOURS + PARK_DURATION_HOURS) {
        // If it's late in the day and this schedule is for early morning, assume it's for next day's cycle.
        // This doesn't fully handle rollover within the same generation, but helps initialize "today's" relative schedule.
        // For robust multi-day, a backend or more complex date logic is needed.
    }

    let outboundArrivalDateTime = addHours(outboundDepartureDateTime, TRAVEL_DURATION_HOURS);

    const totalSeats = busSchedule.busType === "Airconditioned" ? 65 : 53;
    const busNumericId = parseInt(busSchedule.physicalBusId.replace(/[^0-9]/g, ''), 10) || 1;
    const availableSeatsForType = busSchedule.busType === "Airconditioned"
        ? (40 + (busNumericId % 25))
        : (25 + (busNumericId % 28));
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
      availableSeats: Math.min(totalSeats, Math.max(5, availableSeatsForType)),
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
      availableSeats: Math.min(totalSeats, Math.max(5, availableSeatsForType)),
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
  const [currentTime, setCurrentTime] = useState(new Date().getTime());

  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(new Date().getTime());
    }, 30000); // Update status every 30 seconds
    return () => clearInterval(timerId);
  }, []);

  const displayableBusStates = useMemo(() => {
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
        // This might happen if schedule data is incomplete for a physical bus.
        // For robust error handling, you might log this or display a specific card.
        console.warn(`Missing legs for physicalBusId: ${busSched.physicalBusId} in TripList`);
        return;
      }
      
      let representativeLeg: Trip;
      let currentDisplayStatus: TripStatus;
      let currentBadgeColorKey: BadgeColorKey;

      // Adjust timestamps for today/tomorrow to handle midnight rollover for comparison
      const adjustToCurrentDayCycle = (timestamp: number, baseDate: Date) => {
        const legDate = new Date(timestamp);
        legDate.setFullYear(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
        if (legDate.getTime() < baseDate.getTime() - (12*60*60*1000) && mToCLeg.departureTimestamp > cToMLeg.arrivalTimestamp) { // If leg is early AM and current time is late PM
           return addDays(legDate, 1).getTime();
        }
        return legDate.getTime();
      };
      
      const todayDate = new Date(now);
      const currentMtoCDeparture = adjustToCurrentDayCycle(mToCLeg.departureTimestamp, todayDate);
      const currentMtoCArrival = adjustToCurrentDayCycle(mToCLeg.arrivalTimestamp, todayDate);
      const currentCtoMDeparture = adjustToCurrentDayCycle(cToMLeg.departureTimestamp, todayDate);
      const currentCtoMArrival = adjustToCurrentDayCycle(cToMLeg.arrivalTimestamp, todayDate);


      if (now < currentMtoCDeparture) {
        representativeLeg = mToCLeg;
        currentDisplayStatus = "Scheduled";
        currentBadgeColorKey = "blue";
      } else if (now < currentMtoCArrival) {
        representativeLeg = mToCLeg;
        currentDisplayStatus = "Travelling";
        currentBadgeColorKey = "green";
      } else if (now < currentCtoMDeparture) {
        representativeLeg = cToMLeg; // Show the return leg as "Scheduled"
        currentDisplayStatus = "Scheduled";
        currentBadgeColorKey = "blue";
      } else if (now < currentCtoMArrival) {
        representativeLeg = cToMLeg;
        currentDisplayStatus = "Returning";
        currentBadgeColorKey = "orange";
      } else {
        representativeLeg = cToMLeg; // Represents the completed state of the last leg
        currentDisplayStatus = "Completed for Day";
        currentBadgeColorKey = "gray";
      }
      
      const displayTrip: DisplayTripInfo = {
        ...representativeLeg,
        displayStatus: currentDisplayStatus,
        badgeColorKey: currentBadgeColorKey,
      };

      const busTypeMatch = activeBusTypeFilter === "all" || displayTrip.busType === activeBusTypeFilter;
      // Filter by the direction of the *representative leg being shown*
      const directionMatch = activeDirectionFilter === "all" || displayTrip.direction === activeDirectionFilter;

      if (busTypeMatch && directionMatch) {
        representations.push(displayTrip);
      }
    });
    
    // Sort primarily by status (Scheduled first), then by departure time
    representations.sort((a,b) => {
        const statusOrder: Record<TripStatus, number> = {
            "Scheduled": 1,
            "Travelling": 2,
            "Returning": 3,
            "Completed for Day": 4, //Parked at Destination removed
        };
        if (statusOrder[a.displayStatus] !== statusOrder[b.displayStatus]) {
            return statusOrder[a.displayStatus] - statusOrder[b.displayStatus];
        }
        return a.departureTimestamp - b.departureTimestamp;
    });

    return representations;

  }, [activeBusTypeFilter, activeDirectionFilter, currentTime]);

  if (displayableBusStates.length === 0 && typeof window !== 'undefined') { // Render no trips only on client after check
    return (
      <div className="text-center py-10 text-muted-foreground">
        <AlertTriangle className="mx-auto h-12 w-12 mb-4" />
        <p className="text-xl">No buses match the current filters or schedule.</p>
        <p>Please check back later or adjust your filters.</p>
      </div>
    );
  }
  
  if (displayableBusStates.length === 0) { // Fallback for SSR or initial load before client check
     return <div className="text-center py-10 text-muted-foreground">Loading trips...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {displayableBusStates.map((displayTrip) => (
        // Use a key that is unique for the bus and its representative leg for the current view
        <TripCard key={`${displayTrip.physicalBusId}-${displayTrip.direction}-${displayTrip.departureTime}`} trip={displayTrip} />
      ))}
    </div>
  );
}
