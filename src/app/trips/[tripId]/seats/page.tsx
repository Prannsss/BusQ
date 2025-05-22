
import { SeatMap } from "@/components/seats/seat-map";
import { Trip, BusType, TripStatus } from "@/types"; // Added TripStatus
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Armchair, Ticket, Calendar, Clock, Info, Route, Tag } from "lucide-react"; // Added Route, Tag
import Link from "next/link";
import { format, addMinutes, parse } from 'date-fns'; // For date manipulations

// Mock data source - In a real app, this would be fetched
// Duplicating trip generation logic for simplicity in this standalone page.
// Ideally, this would come from a shared service or context.
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
    let tripIdCounter = 1; // Independent counter for this instance
  
    const createTrips = (
      schedule: Array<{ time: string; busType: BusType }>,
      direction: Trip["direction"],
      origin: string,
      destination: string
    ) => {
      schedule.forEach(item => {
        const [hours, minutes] = item.time.split(':').map(Number);
        const departureDateTime = new Date(todayStr);
        departureDateTime.setHours(hours, minutes, 0, 0);
        const arrivalDateTime = addMinutes(departureDateTime, TRAVEL_DURATION_MINS_SEATS);
        const totalSeatsForType = item.busType === "Airconditioned" ? 65 : 53;
        // Deterministic available seats to prevent hydration errors
        const availableSeatsForType = item.busType === "Airconditioned" 
          ? Math.max(0, Math.min(totalSeatsForType, (tripIdCounter * 7 % 60) + 5)) 
          : Math.max(0, Math.min(totalSeatsForType, (tripIdCounter * 5 % 50) + 3));
        
        // Deterministic price to prevent hydration errors
        const basePrice = item.busType === "Airconditioned" ? 250 : 180;
        const priceVariation = (tripIdCounter * 5 % 40) + 10; // Variation between 10 and 50 for this specific mock generation
        const finalPrice = basePrice + priceVariation;
  
        allTrips.push({
          id: `trip-${tripIdCounter++}`, busId: `bus-${tripIdCounter % 5}`, direction, origin, destination,
          departureTime: item.time, arrivalTime: format(arrivalDateTime, "HH:mm"),
          travelDurationMins: TRAVEL_DURATION_MINS_SEATS, stopoverDurationMins: STOPOVER_DURATION_MINS_SEATS,
          busType: item.busType, 
          availableSeats: availableSeatsForType,
          totalSeats: totalSeatsForType,
          price: finalPrice, 
          tripDate: todayStr, status: "Scheduled" as TripStatus,
        });
      });
    };
    createTrips(FIXED_SCHEDULE_A_TO_B_SEATS, "Mantalongon_to_Cebu", "Mantalongon", "Cebu City");
    createTrips(FIXED_SCHEDULE_B_TO_A_SEATS, "Cebu_to_Mantalongon", "Cebu City", "Mantalongon");
    allTrips.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
    return allTrips;
  };
  
const ALL_MOCK_TRIPS_SEATS = generateMockTripsForSeatsPage();


async function getTripDetails(tripId: string): Promise<Trip | null> {
  return ALL_MOCK_TRIPS_SEATS.find(trip => trip.id === tripId) || null;
}

export default async function SeatSelectionPage({ params }: { params: { tripId: string } }) {
  const trip = await getTripDetails(params.tripId);

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
  
  // This is a placeholder. In a real app, selectedSeatsCount would come from SeatMap state.
  const selectedSeatsCount = 0; // Example: 0 seats selected initially
  const totalPrice = trip.price * selectedSeatsCount;
  const isBookable = trip.status === "Scheduled" || trip.status === "On Standby";


  return (
    <div className="container mx-auto py-8">
      <header className="text-center mb-8">
        <Ticket className="mx-auto h-12 w-12 text-primary mb-4" />
        <h1 className="text-4xl font-bold text-primary-foreground">Select Your Seats</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Choose your preferred seats for the trip from {trip.origin} to {trip.destination}.
        </p>
         {!isBookable && (
            <p className="mt-2 text-yellow-500 font-semibold">This trip is currently {trip.status.toLowerCase()} and not available for booking.</p>
        )}
      </header>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl text-primary">Bus Layout ({trip.busType})</CardTitle>
              <CardDescription>Click on available seats to select them. Total seats: {trip.totalSeats}</CardDescription>
            </CardHeader>
            <CardContent>
              <SeatMap busType={trip.busType} />
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
                <span className="text-muted-foreground flex items-center"><Calendar className="h-4 w-4 mr-2" /> Date:</span>
                <span className="font-semibold">{trip.tripDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center"><Clock className="h-4 w-4 mr-2" /> Departure:</span>
                <span className="font-semibold">{trip.departureTime}</span>
              </div>
               <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center"><Clock className="h-4 w-4 mr-2" /> Arrival:</span>
                <span className="font-semibold">{trip.arrivalTime}</span>
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
            // onClick={() => { /* Implement actual reservation logic */ alert("Reservation logic not yet implemented.")}}
            disabled={!isBookable}
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

