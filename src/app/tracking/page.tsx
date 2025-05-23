
"use client";

import { BusMap } from "@/components/tracking/bus-map";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Clock } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import React, { useState, useEffect, useMemo } from "react";
import type { Trip, BusType, TripDirection, TripStatus } from "@/types";
import { format, addMinutes } from 'date-fns';

// Simplified Fixed Schedule Configuration for Tracking Page
const FIXED_SCHEDULE_MANTALONGON_TO_CEBU_TRACKING: Array<{ time: string; busType: BusType, busPlate: string }> = [
  { time: "02:45", busType: "Traditional", busPlate: "BUS-MTC-0245" },
  { time: "03:20", busType: "Traditional", busPlate: "BUS-MTC-0320" },
  { time: "04:00", busType: "Traditional", busPlate: "BUS-MTC-0400" },
  { time: "05:30", busType: "Traditional", busPlate: "BUS-MTC-0530" },
  { time: "08:00", busType: "Airconditioned", busPlate: "BUS-MTC-0800-AC" },
  { time: "11:30", busType: "Traditional", busPlate: "BUS-MTC-1130" },
  { time: "12:00", busType: "Traditional", busPlate: "BUS-MTC-1200" },
  { time: "13:00", busType: "Traditional", busPlate: "BUS-MTC-1300" },
];

const FIXED_SCHEDULE_CEBU_TO_MANTALONGON_TRACKING: Array<{ time: string; busType: BusType, busPlate: string }> = [
  { time: "07:00", busType: "Traditional", busPlate: "BUS-CTM-0700" },
  { time: "08:00", busType: "Traditional", busPlate: "BUS-CTM-0800" },
  { time: "09:00", busType: "Traditional", busPlate: "BUS-CTM-0900" },
  { time: "12:00", busType: "Traditional", busPlate: "BUS-CTM-1200" },
  { time: "13:00", busType: "Airconditioned", busPlate: "BUS-CTM-1300-AC" },
  { time: "17:00", busType: "Traditional", busPlate: "BUS-CTM-1700" },
  { time: "18:00", busType: "Traditional", busPlate: "BUS-CTM-1800" },
];

const TRAVEL_DURATION_MINS_TRACKING = 240;

const generateTodaysTripsForTracking = (): Trip[] => {
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const allTrips: Trip[] = [];
  let tripIdCounter = 1000; // Start with a different counter to avoid ID clashes if used elsewhere

  const createTripForTracking = (
    departureTimeStr: string,
    busType: BusType,
    direction: TripDirection,
    origin: string,
    destination: string,
    busPlate: string
  ): Trip => {
    const [hours, minutes] = departureTimeStr.split(':').map(Number);
    const departureDateTime = new Date(todayStr);
    departureDateTime.setHours(hours, minutes, 0, 0);
    const arrivalDateTime = addMinutes(departureDateTime, TRAVEL_DURATION_MINS_TRACKING);
    const totalSeats = busType === "Airconditioned" ? 65 : 53;

    return {
      id: `track-trip-${tripIdCounter++}`,
      busId: `bus-${tripIdCounter % 100 + 1}`,
      direction,
      origin,
      destination,
      departureTime: departureTimeStr,
      arrivalTime: format(arrivalDateTime, "HH:mm"),
      travelDurationMins: TRAVEL_DURATION_MINS_TRACKING,
      stopoverDurationMins: 60,
      busType,
      availableSeats: totalSeats, // Not critical for tracking display
      totalSeats,
      price: busType === "Airconditioned" ? 200 : 180,
      tripDate: todayStr,
      status: "Scheduled" as TripStatus,
      busPlateNumber: busPlate,
    };
  };

  FIXED_SCHEDULE_MANTALONGON_TO_CEBU_TRACKING.forEach(item => {
    allTrips.push(createTripForTracking(item.time, item.busType, "Mantalongon_to_Cebu", "Mantalongon", "Cebu City", item.busPlate));
  });

  FIXED_SCHEDULE_CEBU_TO_MANTALONGON_TRACKING.forEach(item => {
    allTrips.push(createTripForTracking(item.time, item.busType, "Cebu_to_Mantalongon", "Cebu City", "Mantalongon", item.busPlate));
  });
  
  allTrips.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
  return allTrips;
};


export default function TrackingPage() {
  const [allTrips, setAllTrips] = useState<Trip[]>([]);
  const [selectedOrigin, setSelectedOrigin] = useState<string>("");
  const [availableDepartureTimes, setAvailableDepartureTimes] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string>("");

  useEffect(() => {
    setAllTrips(generateTodaysTripsForTracking());
  }, []);

  useEffect(() => {
    if (selectedOrigin && allTrips.length > 0) {
      const filtered = allTrips.filter(trip => trip.origin === selectedOrigin);
      setAvailableDepartureTimes(filtered);
      setSelectedTripId(""); // Reset selected trip when origin changes
    } else {
      setAvailableDepartureTimes([]);
      setSelectedTripId("");
    }
  }, [selectedOrigin, allTrips]);

  const tripToTrack = useMemo(() => {
    return allTrips.find(trip => trip.id === selectedTripId) || null;
  }, [selectedTripId, allTrips]);

  const busIdentifierForMap = tripToTrack ? `${tripToTrack.busType} bus departing ${tripToTrack.origin} at ${tripToTrack.departureTime} (${tripToTrack.busPlateNumber})` : "No bus selected";

  return (
    <div className="space-y-8">
      <header className="text-center">
        <MapPin className="mx-auto h-12 w-12 text-primary mb-4" />
        <h1 className="text-4xl font-bold text-foreground">Real-Time Bus Tracking</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Follow your bus live. Select origin and departure time.
        </p>
      </header>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Select a Bus to Track</CardTitle>
          <CardDescription>Choose the origin and scheduled departure time of the bus.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <div>
              <Label htmlFor="origin-select" className="text-muted-foreground">Origin</Label>
              <Select value={selectedOrigin} onValueChange={setSelectedOrigin}>
                <SelectTrigger id="origin-select" className="w-full bg-input border-border focus:ring-primary">
                  <SelectValue placeholder="Select origin" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-popover">
                  <SelectItem value="Mantalongon">Mantalongon</SelectItem>
                  <SelectItem value="Cebu City">Cebu City</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="departure-time-select" className="text-muted-foreground">Departure Time</Label>
              <Select value={selectedTripId} onValueChange={setSelectedTripId} disabled={!selectedOrigin || availableDepartureTimes.length === 0}>
                <SelectTrigger id="departure-time-select" className="w-full bg-input border-border focus:ring-primary">
                  <SelectValue placeholder="Select departure time" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-popover">
                  {availableDepartureTimes.map((trip) => (
                    <SelectItem key={trip.id} value={trip.id}>
                      {trip.departureTime} ({trip.busType}) - to {trip.destination}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-xl overflow-hidden">
        <CardHeader>
            <CardTitle className="text-2xl text-primary">Live Map</CardTitle>
            <CardDescription>
              {tripToTrack ? 
                `Showing location for: ${tripToTrack.busType} bus to ${tripToTrack.destination}, departs ${tripToTrack.origin} at ${tripToTrack.departureTime}` :
                "Select a bus to see its live location."
              }
              {tripToTrack?.busPlateNumber && ` (Plate: ${tripToTrack.busPlateNumber})`}
            </CardDescription>
        </CardHeader>
        <CardContent className="p-0 md:p-0">
          <div className="h-[500px] w-full bg-muted rounded-b-md">
            <BusMap busId={tripToTrack?.busPlateNumber || "default-bus-id"} /> {/* Pass a unique ID, plate number is good here */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

  

    