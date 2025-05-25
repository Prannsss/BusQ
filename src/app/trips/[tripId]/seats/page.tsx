
"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SeatMap } from "@/components/seats/seat-map";
import type { Trip, BusType, TripStatus, TripDirection, MantalongonRouteStop, CebuRouteStop, PassengerType, Reservation, PhysicalBusId } from "@/types";
import { passengerTypes, mantalongonRouteStops, cebuRouteStops } from "@/types";
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
import { format, addMinutes, setHours, setMinutes, setSeconds, setMilliseconds, addHours as dateFnsAddHours, parse, addDays } from 'date-fns';
import { Alert, AlertDescription } from '@/components/ui/alert';

const TRAVEL_DURATION_HOURS_SEATS = 4;
const PARK_DURATION_HOURS_SEATS = 1;

const FARE_MATRIX: {
  [destination: string]: {
    [key in BusType]?: number;
  };
} = {
  "Dalaguete": { "Traditional": 60, "Airconditioned": 70 },
  "Argao": { "Traditional": 75, "Airconditioned": 90 },
  "Sibonga": { "Traditional": 90, "Airconditioned": 110 },
  "Carcar City": { "Traditional": 105, "Airconditioned": 130 },
  "San Fernando": { "Traditional": 120, "Airconditioned": 145 },
  "Naga City": { "Traditional": 135, "Airconditioned": 160 },
  "Minglanilla": { "Traditional": 150, "Airconditioned": 175 },
  "Talisay City": { "Traditional": 165, "Airconditioned": 190 },
  "Cebu City": { "Traditional": 180, "Airconditioned": 200 },
  "Mantalongon": { "Traditional": 180, "Airconditioned": 200 }
};

const PHYSICAL_BUS_SCHEDULES_SEATS: Array<{
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

const generateMockTripsForSeatsPage = (): Trip[] => {
    const allTripLegs: Trip[] = [];
    const today = new Date(); // "Today" is determined when the module loads

    PHYSICAL_BUS_SCHEDULES_SEATS.forEach(busSchedule => {
        const [hours, minutes] = busSchedule.mantalongonDepartureTime.split(':').map(Number);
        let outboundDepartureDateTime = setHours(setMinutes(setSeconds(setMilliseconds(new Date(today), 0), 0), minutes), hours);
        let outboundArrivalDateTime = dateFnsAddHours(outboundDepartureDateTime, TRAVEL_DURATION_HOURS_SEATS);

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
            travelDurationMins: TRAVEL_DURATION_HOURS_SEATS * 60,
            stopoverDurationMins: PARK_DURATION_HOURS_SEATS * 60,
        };
        allTripLegs.push(outboundTripLeg);

        let returnDepartureDateTime = dateFnsAddHours(outboundArrivalDateTime, PARK_DURATION_HOURS_SEATS);
        let returnArrivalDateTime = dateFnsAddHours(returnDepartureDateTime, TRAVEL_DURATION_HOURS_SEATS);

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
            travelDurationMins: TRAVEL_DURATION_HOURS_SEATS * 60,
            stopoverDurationMins: PARK_DURATION_HOURS_SEATS * 60,
        };
        allTripLegs.push(returnTripLeg);
    });
    
    allTripLegs.sort((a, b) => a.departureTimestamp - b.departureTimestamp);
    return allTripLegs;
};

const ALL_MOCK_TRIPS_SEATS = generateMockTripsForSeatsPage();

async function getTripDetails(tripIdToFind: string): Promise<Trip | null> {
  return ALL_MOCK_TRIPS_SEATS.find(trip => trip.id === tripIdToFind) || null;
}

export default function SeatSelectionPage() {
  const router = useRouter();
  const routeParams = useParams<{ tripId: string }>();
  
  let currentTripId: string | undefined;
    if (routeParams?.tripId) {
    currentTripId = Array.isArray(routeParams.tripId) ? routeParams.tripId[0] : routeParams.tripId;
    }


  const [trip, setTrip] = useState<Trip | null>(null);
  const [displayStatus, setDisplayStatus] = useState<TripStatus>("Scheduled"); 
  const [selectedDropOff, setSelectedDropOff] = useState<string>('');
  const [passengerType, setPassengerType] = useState<PassengerType>("Regular");
  const [loading, setLoading] = useState(true);
  const [selectedSeatsCount, setSelectedSeatsCount] = useState(0);
  const [dynamicRegularFarePerSeat, setDynamicRegularFarePerSeat] = useState<number>(0);

  useEffect(() => {
    async function loadTrip() {
      if (!currentTripId) {
        setTrip(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      const tripDetails = await getTripDetails(currentTripId);
      setTrip(tripDetails);
      if (tripDetails) {
        setSelectedDropOff(tripDetails.destination); 
        // Calculate initial display status on client
        const now = new Date().getTime();
        let newStatus: TripStatus;
        if (now < tripDetails.departureTimestamp) newStatus = "Scheduled";
        else if (now >= tripDetails.departureTimestamp && now < tripDetails.arrivalTimestamp) newStatus = "Travelling";
        else newStatus = "Completed for Day"; // Simplified status for individual leg
        setDisplayStatus(newStatus);
      }
      setLoading(false);
    }
    loadTrip();
  }, [currentTripId]);

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
      fareFromMatrix = FARE_MATRIX[selectedDropOff]?.[busType]; 
    }

    if (fareFromMatrix !== undefined) {
      setDynamicRegularFarePerSeat(fareFromMatrix);
    } else if (selectedDropOff === tripFinalDestination) {
      setDynamicRegularFarePerSeat(fullRoutePrice);
    } else {
      console.warn(`Fare not found in FARE_MATRIX for destination: "${selectedDropOff}" from "${origin}", bus type: "${busType}". Defaulting to full route price: ${fullRoutePrice}`);
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
        <h1 className="text-2xl font-semibold text-foreground">Trip not found</h1>
        <p className="text-muted-foreground">The requested trip could not be found or an ID is missing.</p>
        <Link href="/trips">
          <Button variant="link" className="mt-4 text-primary">Go back to trips</Button>
        </Link>
      </div>
    );
  }

  // Determine bookable status based on client-side displayStatus
  const isBookable = displayStatus === "Scheduled";
  const currentRouteStops = trip.origin === "Mantalongon" ? mantalongonRouteStops : cebuRouteStops;

  const handleConfirmReservation = () => {
    if (!trip) return;

    let passengerName = "Guest User"; 
    let isUserLoggedIn = false;

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
      paymentType: undefined, 
      amountPaid: undefined, 
      finalFarePaid: 0, 
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('pendingReservation', JSON.stringify(reservationDataForPayment));
      router.push('/payment'); 
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
            <p className="mt-2 text-yellow-500 font-semibold">This trip is currently {displayStatus.toLowerCase()} and not available for booking.</p>
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
                <span className="font-semibold">{displayStatus}</span>
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
                <Button 
                    variant="outline" 
                    className="w-full text-muted-foreground border-accent hover:bg-accent/20 hover:text-accent-foreground"
                >
                    Cancel
                </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
