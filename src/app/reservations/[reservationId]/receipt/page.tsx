import { ReceiptDetails } from "@/components/reservations/receipt-details";
import { Reservation } from "@/types";
import { Button } from "@/components/ui/button";
import { Download, Info, Printer } from "lucide-react";
import Link from "next/link";

// Mock function to get reservation details
async function getReservationDetails(reservationId: string): Promise<Reservation | null> {
  if (reservationId === "mock-reservation-123") {
    return {
      id: "mock-reservation-123",
      passengerName: "Juan Dela Cruz",
      tripId: "1",
      seatNumbers: ["A1", "A2"],
      busType: "Airconditioned",
      departureTime: "08:00 AM",
      totalAmount: 500,
    };
  }
  return null;
}

export default async function ReservationReceiptPage({ params }: { params: { reservationId: string } }) {
  const reservation = await getReservationDetails(params.reservationId);

  if (!reservation) {
    return (
      <div className="text-center py-10">
        <Info className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h1 className="text-2xl font-semibold">Reservation Not Found</h1>
        <p className="text-muted-foreground">The requested reservation could not be found.</p>
        <Link href="/trips">
          <Button variant="link" className="mt-4 text-primary">Browse Trips</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <header className="text-center mb-8">
        <Printer className="mx-auto h-12 w-12 text-primary mb-4" />
        <h1 className="text-4xl font-bold text-primary-foreground">Reservation Receipt</h1>
        <p className="mt-2 text-lg text-muted-foreground">Thank you for booking with BusQ!</p>
      </header>
      
      <ReceiptDetails reservation={reservation} />

      <div className="mt-8 flex justify-center gap-4">
        <Button 
          variant="default" 
          size="lg" 
          onClick={() => alert("PDF Download functionality not yet implemented.")}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Download className="mr-2 h-5 w-5" /> Download PDF
        </Button>
        <Button 
          variant="outline" 
          size="lg"
          onClick={() => typeof window !== 'undefined' && window.print()}
          className="text-accent-foreground border-accent hover:bg-accent/20"
        >
          <Printer className="mr-2 h-5 w-5" /> Print Receipt
        </Button>
      </div>
    </div>
  );
}
