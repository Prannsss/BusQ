
"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SeatMap } from "@/components/seats/seat-map";
import { type Trip, type BusType, type TripStatus, type TripDirection, type MantalongonRouteStop, type CebuRouteStop, type PassengerType, type Reservation, passengerTypes, mantalongonRouteStops, cebuRouteStops } from "@/types";
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
import { Armchair, Ticket, Calendar, Clock, Info, Route, Tag, MapPin, UserCircle, UploadCloud, Percent } from "lucide-react";
import Link from "next/link";
import { format, addMinutes } from 'date-fns';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

const FARE_MATRIX: {
  [destination: string]: {
    [key in BusType]?: number;
  };
} = {
  // Fares from Mantalongon
  "Dalaguete": { "Traditional": 60, "Airconditioned": 70 },
  "Argao": { "Traditional": 75, "Airconditioned": 90 },
  "Sibonga": { "Traditional": 90, "Airconditioned": 110 },
  "Carcar City": { "Traditional": 105, "Airconditioned": 130 },
  "San Fernando": { "Traditional": 120, "Airconditioned": 145 },
  "Naga City": { "Traditional": 135, "Airconditioned": 160 },
  "Minglanilla": { "Traditional": 150, "Airconditioned": 175 },
  "Talisay City": { "Traditional": 165, "Airconditioned": 190 },
  "Cebu City": { "Traditional": 180, "Airconditioned": 200 },
  // Fares from Cebu City 
  // Note: For trips from Cebu City, Mantalongon is usually the full route destination.
  // Other stops would be intermediate.
  "Mantalongon": { "Traditional": 180, "Airconditioned": 200 } 
};


const generateMockTripsForSeatsPage = (): Trip[] => {
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const allTrips: Trip[] = [];
    let tripIdCounter = 1;

    const createTripForSeatsPage = (
      departureTimeStr: string,
      busType: BusType,
      direction: TripDirection,
      origin: string,
      finalDestination: string,
      currentTripId: number
    ): Trip => {
      const [hours, minutes] = departureTimeStr.split(':').map(Number);
      const departureDateTime = new Date(todayStr);
      departureDateTime.setHours(hours, minutes, 0, 0);

      const arrivalDateTime = addMinutes(departureDateTime, TRAVEL_DURATION_MINS_SEATS);
      const totalSeatsForType = busType === "Airconditioned" ? 65 : 53;
      
      const baseAvailableSeats = busType === "Airconditioned" ? (40 + (currentTripId % 25)) : (30 + (currentTripId % 23));
      const availableSeatsForType = Math.max(0, Math.min(totalSeatsForType, baseAvailableSeats));

      const finalPrice = busType === "Airconditioned" ? 200 : 180;


      return {
        id: `trip-${currentTripId}`, busId: `bus-${currentTripId % 5}`, direction, origin,
        destination: finalDestination,
        departureTime: departureTimeStr, arrivalTime: format(arrivalDateTime, "HH:mm"),
        travelDurationMins: TRAVEL_DURATION_MINS_SEATS, stopoverDurationMins: STOPOVER_DURATION_MINS_SEATS,
        busType: busType,
        availableSeats: availableSeatsForType,
        totalSeats: totalSeatsForType,
        price: finalPrice, // Price for the full route
        tripDate: todayStr, status: "Scheduled" as TripStatus,
      };
    };

    FIXED_SCHEDULE_A_TO_B_SEATS.forEach(item => {
        allTrips.push(createTripForSeatsPage(item.time, item.busType, "Mantalongon_to_Cebu", "Mantalongon", "Cebu City", tripIdCounter++));
    });

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

async function getTripDetails(tripIdToFind: string): Promise<Trip | null> {
  return ALL_MOCK_TRIPS_SEATS.find(trip => trip.id === tripIdToFind) || null;
}

export default function SeatSelectionPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params?.tripId ? (Array.isArray(params.tripId) ? params.tripId[0] : params.tripId) : undefined;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [selectedDropOff, setSelectedDropOff] = useState<string>('');
  const [passengerType, setPassengerType] = useState<PassengerType>("Regular");
  const [loading, setLoading] = useState(true);
  const [selectedSeatsCount, setSelectedSeatsCount] = useState(0);
  const [dynamicRegularFarePerSeat, setDynamicRegularFarePerSeat] = useState<number>(0);

  useEffect(() => {
    async function loadTrip() {
      if (!tripId) {
        setTrip(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      const tripDetails = await getTripDetails(tripId);
      setTrip(tripDetails);
      if (tripDetails) {
        setSelectedDropOff(tripDetails.destination); 
      }
      setLoading(false);
    }
    loadTrip();
  }, [tripId]);

 useEffect(() => {
    if (!trip || !selectedDropOff) {
      setDynamicRegularFarePerSeat(0);
      return;
    }

    const { busType, price: fullRoutePrice, destination: tripFinalDestination, origin } = trip;
    let fareFromMatrix: number | undefined;

    if (origin === "Mantalongon") {
      fareFromMatrix = FARE_MATRIX[selectedDropOff]?.[busType];
    } else if (origin === "Cebu City") {
      if (selectedDropOff === "Mantalongon") {
         fareFromMatrix = FARE_MATRIX["Mantalongon"]?.[busType]; 
      } else {
         fareFromMatrix = FARE_MATRIX[selectedDropOff]?.[busType];
         if (!fareFromMatrix) {
             console.warn(`Fare from Cebu City to "${selectedDropOff}" with ${busType} not explicitly in matrix. Using full route price as fallback.`);
             fareFromMatrix = fullRoutePrice; 
         }
      }
    }


    if (fareFromMatrix !== undefined) {
      setDynamicRegularFarePerSeat(fareFromMatrix);
    } else if (selectedDropOff === tripFinalDestination) {
      setDynamicRegularFarePerSeat(fullRoutePrice);
    } else {
      console.warn(`Fare not found for destination: "${selectedDropOff}", bus type: "${busType}". Defaulting to full route price: ${fullRoutePrice}`);
      setDynamicRegularFarePerSeat(fullRoutePrice);
    }
  }, [trip, selectedDropOff]);


  const isDiscountableType = passengerType === "Student" || passengerType === "Senior" || passengerType === "PWD";
  const discountApplied = isDiscountableType;
  const discountRate = 0.20;

  const calculatedFarePerSeat = discountApplied
    ? dynamicRegularFarePerSeat * (1 - discountRate)
    : dynamicRegularFarePerSeat;

  const regularFareTotalForBooking = dynamicRegularFarePerSeat * selectedSeatsCount;
  const amountDueForBooking = calculatedFarePerSeat * selectedSeatsCount;


  if (loading) {
    return <div className="text-center py-10 text-muted-foreground">Loading trip details...</div>;
  }

  if (!trip) {
    return (
      <div className="text-center py-10">
        <Info className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h1 className="text-2xl font-semibold">Trip not found</h1>
        <p className="text-muted-foreground">The requested trip could not be found or an ID is missing.</p>
        <Link href="/trips">
          <Button variant="link" className="mt-4 text-primary">Go back to trips</Button>
        </Link>
      </div>
    );
  }

  const isBookable = trip.status === "Scheduled" || trip.status === "On Standby";
  const currentRouteStops = trip.origin === "Mantalongon" ? mantalongonRouteStops : cebuRouteStops;

  const handleConfirmReservation = () => {
    if (!trip) return;

    let isUserLoggedIn = false;
    let passengerName = "Guest User"; 

    if (typeof window !== 'undefined') {
        const loggedInUser = localStorage.getItem('busqLoggedInUser');
        if (loggedInUser) {
            isUserLoggedIn = true;
            try {
                const userData = JSON.parse(loggedInUser);
                passengerName = userData.name || "Registered User"; 
            } catch (e) {
                console.error("Error parsing logged in user data", e);
            }
        }
    }


    if (!isUserLoggedIn) {
      router.push('/login');
      return;
    }

    const reservationDataForPayment: Reservation = {
      id: `res-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      passengerName: passengerName,
      tripId: trip.id,
      seatNumbers: Array.from({length: selectedSeatsCount}, (_, i) => `S${i+1}`), 
      busType: trip.busType,
      departureTime: trip.departureTime,
      origin: trip.origin,
      selectedDestination: selectedDropOff,
      tripDate: trip.tripDate,
      userType: passengerType,
      regularFareTotal: regularFareTotalForBooking, 
      discountApplied: discountApplied,
      amountDue: amountDueForBooking, 
      finalFarePaid: 0, 
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('pendingReservation', JSON.stringify(reservationDataForPayment));
      window.location.href = '/payment'; 
    }
  };


  return (
    <div className="container mx-auto py-8">
      <header className="text-center mb-8">
        <Ticket className="mx-auto h-12 w-12 text-primary mb-4" />
        <h1 className="text-4xl font-bold text-foreground">Select Seats & Passenger Details</h1>
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
              <CardTitle className="text-2xl text-foreground">Bus Layout ({trip.busType})</CardTitle>
              <CardDescription>Click on available seats to select them. Total seats: {trip.totalSeats}. Seats available: {trip.availableSeats}</CardDescription>
            </CardHeader>
            <CardContent>
              <SeatMap busType={trip.busType} onSeatSelectionChange={setSelectedSeatsCount} />
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-1 flex flex-col space-y-6">
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl text-foreground">Trip & Fare Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center"><Route className="h-4 w-4 mr-2" /> Route:</span>
                <span className="font-semibold">{trip.origin} to {trip.destination}</span>
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
              <Separator className="my-3 bg-border" />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center"><Tag className="h-4 w-4 mr-2" /> Regular Fare/Seat:</span>
                <span className="font-semibold">PHP {dynamicRegularFarePerSeat.toFixed(2)}</span>
              </div>
                {discountApplied && (
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center"><Percent className="h-4 w-4 mr-2" /> Discount (20%):</span>
                        <span className="font-semibold text-green-500">- PHP {(dynamicRegularFarePerSeat * discountRate).toFixed(2)}</span>
                    </div>
                )}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center"><Tag className="h-4 w-4 mr-2" /> Final Fare/Seat:</span>
                <span className="font-semibold">PHP {calculatedFarePerSeat.toFixed(2)}</span>
              </div>
              <Separator className="my-3 bg-border" />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center"><Armchair className="h-4 w-4 mr-2" /> Seats Selected:</span>
                <span className="font-semibold" id="selected-seats-count">{selectedSeatsCount}</span>
              </div>
              <div className="flex items-center justify-between text-lg">
                <span className="text-muted-foreground">Total Amount Due:</span>
                <span className="font-bold text-primary" id="total-price">PHP {amountDueForBooking.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl">
            <CardHeader>
                <CardTitle className="text-xl text-foreground flex items-center">
                    <MapPin className="h-5 w-5 mr-2" /> Select Your Drop-off Point
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <Label htmlFor="dropoff-select" className="text-muted-foreground">Your Destination:</Label>
                    <Select value={selectedDropOff} onValueChange={setSelectedDropOff} disabled={!trip}>
                        <SelectTrigger id="dropoff-select" className="w-full bg-input border-border focus:ring-primary">
                            <SelectValue placeholder="Select drop-off point" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-popover">
                            {trip && currentRouteStops.map(stop => (
                                <SelectItem key={stop} value={stop}>{stop}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                        The bus route is from {trip?.origin} to {trip?.destination}. Select your specific alighting point.
                    </p>
                </div>
            </CardContent>
          </Card>

           <Card className="shadow-xl">
            <CardHeader>
                <CardTitle className="text-xl text-foreground flex items-center">
                    <UserCircle className="h-5 w-5 mr-2" /> Select Passenger Type
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <Label htmlFor="passenger-type-select" className="text-muted-foreground">Passenger Type:</Label>
                    <Select value={passengerType} onValueChange={(value) => setPassengerType(value as PassengerType)}>
                        <SelectTrigger id="passenger-type-select" className="w-full bg-input border-border focus:ring-primary">
                            <SelectValue placeholder="Select passenger type" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-popover">
                            {passengerTypes.map(type => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                     {isDiscountableType && (
                        <Alert variant="default" className="mt-3 border-primary/50 bg-primary/10">
                           <UploadCloud className="h-4 w-4 text-primary" />
                           <AlertDescription className="text-primary/90">
                            Discounted fare selected. ID verification will be required at the terminal or upon boarding. (This is a placeholder for ID upload functionality).
                           </AlertDescription>
                        </Alert>
                    )}
                </div>
            </CardContent>
          </Card>
          
          <div className="space-y-2">
            <Button
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-6"
                disabled={!isBookable || !selectedDropOff || selectedSeatsCount === 0 || !trip}
                onClick={handleConfirmReservation}
            >
                {isBookable ? "Confirm Reservation" : "Booking Unavailable"}
            </Button>
            <Link href="/trips" className="w-full block">
                <Button variant="outline" className="w-full text-primary-foreground border-accent hover:bg-accent/20 hover:text-primary-foreground">
                Cancel
                </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

    