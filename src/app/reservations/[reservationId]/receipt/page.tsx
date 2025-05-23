
"use client"; // Mark as client component to use localStorage

import { useEffect, useState } from 'react'; // Import hooks
import { useParams, useRouter } from 'next/navigation'; // Import useRouter
import { ReceiptDetails } from "@/components/reservations/receipt-details";
import { Reservation, PassengerType } from "@/types";
import { Button } from "@/components/ui/button";
import { Download, Info, Printer } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

// Mock function to get reservation details - now reads from localStorage
async function getReservationDetails(reservationId: string): Promise<Reservation | null> {
  if (typeof window !== 'undefined') {
    const storedReservation = localStorage.getItem('mockReservationDetails');
    if (storedReservation) {
      try {
        const parsedReservation: Reservation = JSON.parse(storedReservation);
        // Ensure it's the correct reservation if multiple are stored, or if id matters
        if (parsedReservation.id === reservationId) {
          return parsedReservation;
        }
      } catch (error) {
        console.error("Error parsing reservation from localStorage for receipt:", error);
        // Fall through to default mock if parsing fails or ID doesn't match
      }
    }
  }

  // Fallback mock if not found in localStorage or for server-side rendering (though this page is client-side)
  if (reservationId === "mock-reservation-123") {
    const regularFare = 250;
    const userType: PassengerType = "Student"; 
    const discountApplied = userType === "Student" || userType === "Senior" || userType === "PWD";
    const discountRate = 0.20;
    
    const amountDue = discountApplied ? regularFare * (1 - discountRate) * 2 : regularFare * 2; // For 2 seats
    const amountPaid = amountDue * 0.3; // Example: 30% deposit paid

    return {
      id: "mock-reservation-123",
      passengerName: "Juan Dela Cruz (Default)",
      tripId: "trip-fallback", 
      seatNumbers: ["F1", "F2"],
      busType: "Airconditioned",
      departureTime: "10:00 AM", 
      origin: "Mantalongon (Default)",
      selectedDestination: "Cebu City (Default)",
      tripDate: format(new Date(), "yyyy-MM-dd"),
      userType: userType,
      regularFareTotal: regularFare * 2, 
      discountApplied: discountApplied,
      amountDue: amountDue,
      paymentType: "deposit",
      amountPaid: amountPaid,
      finalFarePaid: amountPaid,
    };
  }
  return null;
}

export default function ReservationReceiptPage() {
  const params = useParams<{ reservationId: string }>();
  const router = useRouter();
  const reservationId = params?.reservationId ? (Array.isArray(params.reservationId) ? params.reservationId[0] : params.reservationId) : undefined;

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!reservationId) {
      router.push('/trips'); // Redirect if no reservationId
      return;
    }

    async function loadReservation() {
      const details = await getReservationDetails(reservationId!);
      setReservation(details);
      setLoading(false);
    }
    loadReservation();
  }, [reservationId, router]);


  if (loading) {
    return <div className="text-center py-10 text-muted-foreground">Loading receipt...</div>;
  }

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
