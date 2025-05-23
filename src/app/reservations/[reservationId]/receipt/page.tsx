
"use client"; // Mark as client component to use localStorage

import { useEffect, useState } from 'react'; // Import hooks
import { useParams, useRouter } from 'next/navigation'; // Import useRouter
import { ReceiptDetails } from "@/components/reservations/receipt-details";
import { Reservation, PassengerType } from "@/types";
import { Button } from "@/components/ui/button";
import { Download, Info, CheckCircle } from "lucide-react"; // Added CheckCircle
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
    const regularFareTotal = 250 * 2; // Example for 2 seats
    const userType: PassengerType = "Student"; 
    const discountApplied = userType === "Student" || userType === "Senior" || userType === "PWD";
    const discountRate = 0.20;
    
    const amountDueAfterDiscount = discountApplied ? regularFareTotal * (1 - discountRate) : regularFareTotal;
    const amountPaidExample = amountDueAfterDiscount * 0.3; // Example: 30% deposit paid

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
      regularFareTotal: regularFareTotal, 
      discountApplied: discountApplied,
      amountDue: amountDueAfterDiscount, // Total after discount
      paymentType: "deposit",
      amountPaid: amountPaidExample, // Amount paid for deposit
      finalFarePaid: amountPaidExample, // Actual final amount paid
    };
  }
  return null;
}

function generateReceiptHtml(reservation: Reservation): string {
  const discountAmount = reservation.regularFareTotal - reservation.amountDue;
  return `
    <html>
      <head>
        <title>BusQ Reservation Receipt - ${reservation.id}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 20px; color: #333; background-color: #f9f9f9; }
          .container { background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); max-width: 600px; margin: auto; }
          h1 { color: #FF6600; text-align: center; border-bottom: 2px solid #FF6600; padding-bottom: 10px; }
          h2 { color: #FF6600; margin-top: 30px; border-bottom: 1px solid #eee; padding-bottom: 5px;}
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 0.9em; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background-color: #f8f8f8; font-weight: 600; }
          .total { font-weight: bold; font-size: 1.1em; }
          .footer-note { text-align: center; margin-top: 30px; font-size: 0.8em; color: #777; }
          hr { border: 0; border-top: 1px dashed #ccc; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>BusQ Reservation Receipt</h1>
          <p><strong>Reservation ID:</strong> ${reservation.id}</p>
          
          <h2>Passenger & Trip Details</h2>
          <table>
            <tr><th>Passenger Name:</th><td>${reservation.passengerName}</td></tr>
            <tr><th>Passenger Type:</th><td>${reservation.userType}</td></tr>
            ${reservation.origin && reservation.selectedDestination ? `<tr><th>Route:</th><td>${reservation.origin} to ${reservation.selectedDestination}</td></tr>` : ''}
            <tr><th>Bus Type:</th><td>${reservation.busType}</td></tr>
            ${reservation.tripDate ? `<tr><th>Departure Date:</th><td>${reservation.tripDate}</td></tr>` : ''}
            <tr><th>Departure Time:</th><td>${reservation.departureTime}</td></tr>
            <tr><th>Seat Number(s):</th><td>${reservation.seatNumbers.join(", ")}</td></tr>
          </table>
          
          <h2>Fare Breakdown</h2>
          <table>
            <tr><th>Total Regular Fare:</th><td>PHP ${reservation.regularFareTotal.toFixed(2)}</td></tr>
            ${reservation.discountApplied ? `<tr><th>Discount Applied (20%):</th><td style="color: green;">- PHP ${discountAmount.toFixed(2)}</td></tr>` : ''}
            <tr><th>Amount Due (After Discount):</th><td>PHP ${reservation.amountDue.toFixed(2)}</td></tr>
          </table>
          
          ${reservation.paymentType && reservation.finalFarePaid !== undefined ? `
            <h2>Payment Details</h2>
            <table>
              <tr><th>Payment Type:</th><td>${reservation.paymentType === "deposit" ? "30% Deposit" : "Full Payment"}</td></tr>
              <tr><th class="total">Total Amount Paid:</th><td class="total" style="color: #FF6600;">PHP ${reservation.finalFarePaid.toFixed(2)}</td></tr>
            </table>
            ${reservation.paymentType === "deposit" && (reservation.amountDue - reservation.finalFarePaid) > 0 ? `<p class="footer-note">Remaining balance of PHP ${(reservation.amountDue - reservation.finalFarePaid).toFixed(2)} to be paid to the bus conductor.</p>` : ''}
          ` : ''}
          <p class="footer-note">Thank you for choosing BusQ! Have a safe trip.</p>
        </div>
      </body>
    </html>
  `;
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

  const handleDownloadHtmlReceipt = () => {
    if (!reservation) return;
    const htmlContent = generateReceiptHtml(reservation);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BusQ_Receipt_${reservation.id}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };


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
        <CheckCircle className="mx-auto h-12 w-12 text-primary mb-4" />
        <h1 className="text-4xl font-bold text-primary-foreground">Reservation Receipt</h1>
        <p className="mt-2 text-lg text-muted-foreground">Thank you for booking with BusQ!</p>
      </header>
      
      <ReceiptDetails reservation={reservation} />

      <div className="mt-8 flex justify-center gap-4">
        <Button 
          variant="default" 
          size="lg" 
          onClick={handleDownloadHtmlReceipt}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Download className="mr-2 h-5 w-5" /> Download Receipt
        </Button>
        <Button 
          variant="outline" 
          size="lg"
          onClick={() => router.push('/')}
          className="text-primary-foreground border-accent hover:bg-accent/20 hover:text-primary-foreground"
        >
          Done
        </Button>
      </div>
    </div>
  );
}

