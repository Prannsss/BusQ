
"use client"; 
import React, { useState, useEffect } from 'react';
import { SeatMap } from "@/components/seats/seat-map";
import { Trip, BusType, TripStatus, TripDirection, mantalongonRouteStops, cebuRouteStops } from "@/types"; 
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Armchair, Ticket, Calendar, Clock, Info, Route, Tag, MapPin } from "lucide-react"; 
import Link from "next/link";
import { format, addMinutes } from 'date-fns'; 

// Fixed Schedule Configuration (copied for consistency, ideally from a shared source)
const FIXED_SCHEDULE_A_TO_B_SEATS: Array<{ time: string; busType: BusType }> = [
    { time: "02:45", busType: "Traditional" }, { time: "03:20", busType: "Traditional" },
    { time: "04:00", busType: "Traditional" }, { time: "05:30", busType: "Traditional" },
    { time: "08:00", busType: "Airconditioned" }, { time: "11:30", busType: "Traditional" },
    { time: "12:00", busType: "Traditional" }, { time: "13:00", busType: "Traditional" },
  ];
  
const FIXED_SCHEDULE_B_TO_A_SEATS: Array<{ time: string; busType: BusType }> = [
    { time: "07:00", busType: "Traditional" }, { time: "08:00", busType: "Traditional" },
    { time: "09:00", busType: "Traditional" }, { time: "12:00", busType: "Traditional" },
    { time: "13:00", busType: "Airconditioned" }, { time: "17:00", busType: "Traditional" },
    { time: "18:00", busType: "Traditional" },
];

const TRAVEL_DURATION_MINS_SEATS = 240;
const STOPOVER_DURATION_MINS_SEATS = 60;

const generateMockTripsForSeatsPage = (): Trip[] => {
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const allTrips: Trip[] = [];
    let tripIdCounter = 1;
  
    const createTripForSeatsPage = (
      departureTimeStr: string,
      busType: BusType,
      direction: TripDirection,
      origin: string,
      finalDestination: string, // This is the bus route's final destination
      currentTripId: number
    ): Trip => {
      const [hours, minutes] = departureTimeStr.split(':').map(Number);
      const departureDateTime = new Date(todayStr);
      departureDateTime.setHours(hours, minutes, 0, 0);
      
      const arrivalDateTime = addMinutes(departureDateTime, TRAVEL_DURATION_MINS_SEATS);
      const totalSeatsForType = busType === "Airconditioned" ? 65 : 53;
      
      // Deterministic seat availability
      const baseAvailable = busType === "Airconditioned" ? 40 : 30;
      const availableSeatsForType = Math.max(0, Math.min(totalSeatsForType, baseAvailable + (currentTripId % 25) - 10));
      
      // Deterministic price
      const basePrice = busType === "Airconditioned" ? 250 : 180;
      const priceVariation = (currentTripId * 13 % 41) - 20;
      const finalPrice = Math.max(basePrice * 0.8, basePrice + priceVariation);
  
      return {
        id: `trip-${currentTripId}`, busId: `bus-${currentTripId % 5}`, direction, origin, 
        destination: finalDestination, // Route's final destination
        departureTime: departureTimeStr, arrivalTime: format(arrivalDateTime, "HH:mm"),
        travelDurationMins: TRAVEL_DURATION_MINS_SEATS, stopoverDurationMins: STOPOVER_DURATION_MINS_SEATS,
        busType: busType, 
        availableSeats: availableSeatsForType,
        totalSeats: totalSeatsForType,
        price: finalPrice, 
        tripDate: todayStr, status: "Scheduled" as TripStatus,
      };
    };

    // Generate trips from Mantalongon to Cebu City (final destination)
    FIXED_SCHEDULE_A_TO_B_SEATS.forEach(item => {
        allTrips.push(createTripForSeatsPage(item.time, item.busType, "Mantalongon_to_Cebu", "Mantalongon", "Cebu City", tripIdCounter++));
    });

    // Generate trips from Cebu City to Mantalongon (final destination)
    FIXED_SCHEDULE_B_TO_A_SEATS.forEach(item => {
        allTrips.push(createTripForSeatsPage(item.time, item.busType, "Cebu_to_Mantalongon", "Cebu City", "Mantalongon", tripIdCounter++));
    });
    
    allTrips.sort((a, b) => {
        const timeComp = a.departureTime.localeCompare(b.departureTime);
        if (timeComp !== 0) return timeComp;
        const originComp = a.origin.localeCompare(b.origin);
        if (originComp !== 0) return originComp;
        return a.destination.localeCompare(b.destination);
    });
    return allTrips;
  };
  
const ALL_MOCK_TRIPS_SEATS = generateMockTripsForSeatsPage();

// This needs to be a client component hook to use params
async function getTripDetails(tripId: string): Promise<Trip | null> {
  // In a real app, this would be an API call.
  // For now, we find it in the generated mock trips.
  return ALL_MOCK_TRIPS_SEATS.find(trip => trip.id === tripId) || null;
}


export default function SeatSelectionPage({ params }: { params: { tripId: string } }) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [selectedDropOff, setSelectedDropOff] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTrip() {
      setLoading(true);
      const tripDetails = await getTripDetails(params.tripId);
      setTrip(tripDetails);
      if (tripDetails) {
        setSelectedDropOff(tripDetails.destination); // Default to final destination
      }
      setLoading(false);
    }
    loadTrip();
  }, [params.tripId]);

  if (loading) {
    return <div className="text-center py-10">Loading trip details...</div>;
  }

  if (!trip) {
    return (
      <div className="text-center py-10">
        <Info className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h1 className="text-2xl font-semibold">Trip not found</h1>
        <p className="text-muted-foreground">The requested trip could not be found.</p>
        <Link href="/trips">
          <Button variant="link" className="mt-4 text-primary">Go back to trips</Button>
        </Link>
      </div>
    );
  }
  
  const selectedSeatsCount = 0; // This should be derived from SeatMap interactions
  const totalPrice = trip.price * selectedSeatsCount; // Price might vary by drop-off in a real app
  const isBookable = trip.status === "Scheduled" || trip.status === "On Standby";

  const currentRouteStops = trip.origin === "Mantalongon" ? mantalongonRouteStops : cebuRouteStops;

  return (
    <div className="container mx-auto py-8">
      <header className="text-center mb-8">
        <Ticket className="mx-auto h-12 w-12 text-primary mb-4" />
        <h1 className="text-4xl font-bold text-primary-foreground">Select Your Seats & Drop-off</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Bus Route: {trip.origin} to {trip.destination}.
        </p>
         {!isBookable && (
            <p className="mt-2 text-yellow-500 font-semibold">This trip is currently {trip.status.toLowerCase()} and not available for booking.</p>
        )}
      </header>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl text-primary">Bus Layout ({trip.busType})</CardTitle>
              <CardDescription>Click on available seats to select them. Total seats: {trip.totalSeats}</CardDescription>
            </CardHeader>
            <CardContent>
              <SeatMap busType={trip.busType} />
            </CardContent>
          </Card>

          <Card className="shadow-xl">
            <CardHeader>
                <CardTitle className="text-xl text-primary flex items-center">
                    <MapPin className="h-5 w-5 mr-2" /> Select Your Drop-off Point
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <Label htmlFor="dropoff-select" className="text-muted-foreground">Your Destination:</Label>
                    <Select value={selectedDropOff} onValueChange={setSelectedDropOff}>
                        <SelectTrigger id="dropoff-select" className="w-full bg-input border-border focus:ring-primary">
                            <SelectValue placeholder="Select drop-off point" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-popover">
                            {currentRouteStops.map(stop => (
                                <SelectItem key={stop} value={stop}>{stop}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                        The bus route is from {trip.origin} to {trip.destination}. Select your specific alighting point.
                    </p>
                </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-1 space-y-6">
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl text-primary">Trip Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center"><Route className="h-4 w-4 mr-2" /> Route:</span>
                <span className="font-semibold">{trip.origin} to {trip.destination}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center"><MapPin className="h-4 w-4 mr-2" /> Your Drop-off:</span>
                <span className="font-semibold">{selectedDropOff || 'Select a drop-off'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center"><Calendar className="h-4 w-4 mr-2" /> Date:</span>
                <span className="font-semibold">{trip.tripDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center"><Clock className="h-4 w-4 mr-2" /> Departure:</span>
                <span className="font-semibold">{trip.departureTime} (from {trip.origin})</span>
              </div>
               <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center"><Clock className="h-4 w-4 mr-2" /> Est. Arrival:</span>
                <span className="font-semibold">{trip.arrivalTime} (at {trip.destination})</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Bus Type:</span>
                <span className="font-semibold">{trip.busType}</span>
              </div>
               <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-semibold">{trip.status}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center"><Tag className="h-4 w-4 mr-2" /> Price/Seat:</span>
                <span className="font-semibold">PHP {trip.price.toFixed(2)}</span>
              </div>
              <Separator className="my-3 bg-border" />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center"><Armchair className="h-4 w-4 mr-2" /> Seats Selected:</span>
                <span className="font-semibold" id="selected-seats-count">{selectedSeatsCount}</span> 
              </div>
              <div className="flex items-center justify-between text-lg">
                <span className="text-muted-foreground">Total Price:</span>
                <span className="font-bold text-primary" id="total-price">PHP {totalPrice.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
          <Button 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-6"
            disabled={!isBookable || !selectedDropOff || selectedSeatsCount === 0}
            onClick={() => alert(`Reservation for ${selectedSeatsCount} seat(s) to ${selectedDropOff} (Functionality not yet implemented).`)}
          >
            {isBookable ? "Confirm Reservation" : "Booking Unavailable"}
          </Button>
          <Link href="/trips" className="w-full">
            <Button variant="outline" className="w-full text-accent-foreground border-accent hover:bg-accent/20">
              Change Trip
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
