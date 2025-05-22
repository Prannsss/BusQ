import { SeatMap } from "@/components/seats/seat-map";
import { Trip, BusType } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Armchair, Ticket, Calendar, Clock, Info } from "lucide-react";
import Link from "next/link";

// Mock function to get trip details by ID
async function getTripDetails(tripId: string): Promise<Trip | null> {
  // In a real app, fetch this from your data source
  const mockTrips: Trip[] = [
    { id: "1", departureTime: "08:00 AM", arrivalTime: "11:00 AM", busType: "Airconditioned", availableSeats: 15, totalSeats: 45, price: 250, origin: "Mantalongon", destination: "Cebu City" },
    { id: "2", departureTime: "09:30 AM", arrivalTime: "01:00 PM", busType: "Traditional", availableSeats: 30, totalSeats: 60, price: 180, origin: "Mantalongon", destination: "Cebu City" },
  ];
  return mockTrips.find(trip => trip.id === tripId) || null;
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
  
  // Calculate total price based on selected seats (mock for now)
  const selectedSeatsCount = 2; // Example: 2 seats selected
  const totalPrice = trip.price * selectedSeatsCount;

  return (
    <div className="container mx-auto py-8">
      <header className="text-center mb-8">
        <Ticket className="mx-auto h-12 w-12 text-primary mb-4" />
        <h1 className="text-4xl font-bold text-primary-foreground">Select Your Seats</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Choose your preferred seats for the trip from {trip.origin} to {trip.destination}.
        </p>
      </header>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl text-primary">Bus Layout ({trip.busType})</CardTitle>
              <CardDescription>Click on available seats to select them.</CardDescription>
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
                <span className="text-muted-foreground flex items-center"><Calendar className="h-4 w-4 mr-2" /> Date:</span>
                <span className="font-semibold">Today (Example)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center"><Clock className="h-4 w-4 mr-2" /> Departure:</span>
                <span className="font-semibold">{trip.departureTime}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Bus Type:</span>
                <span className="font-semibold">{trip.busType}</span>
              </div>
              <Separator className="my-3 bg-border" />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center"><Armchair className="h-4 w-4 mr-2" /> Seats Selected:</span>
                <span className="font-semibold">{selectedSeatsCount}</span>
              </div>
              <div className="flex items-center justify-between text-lg">
                <span className="text-muted-foreground">Total Price:</span>
                <span className="font-bold text-primary">PHP {totalPrice.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
          <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-6">
            Confirm Reservation
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
