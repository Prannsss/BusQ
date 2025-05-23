
"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { Reservation } from '@/types';
import { Armchair, Bus, CalendarDays, Clock, CreditCard, DollarSign, MapPin, Percent, Route, Tag, UserCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast'; // Import useToast

export default function PaymentPage() {
  const router = useRouter();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast(); // Initialize useToast

  useEffect(() => {
    const storedReservation = localStorage.getItem('pendingReservation');
    if (storedReservation) {
      try {
        const parsedReservation: Reservation = JSON.parse(storedReservation);
        // Ensure all necessary fields are present, or provide defaults
        setReservation({
            ...parsedReservation,
            amountDue: parsedReservation.amountDue || 0,
            finalFarePaid: parsedReservation.finalFarePaid || 0, 
        });
      } catch (error) {
        console.error("Error parsing reservation from localStorage:", error);
        // Handle error, e.g., redirect to trips page or show error message
        router.push('/trips');
      }
    } else {
      // No pending reservation found, redirect
      router.push('/trips');
    }
    setLoading(false);
  }, [router]);

  const handlePayment = (paymentType: "deposit" | "full") => {
    if (!reservation) return;

    let amountToPay = 0;
    const depositRate = 0.30; // 30%

    if (paymentType === "deposit") {
      amountToPay = reservation.amountDue * depositRate;
    } else {
      amountToPay = reservation.amountDue;
    }

    // Simulate payment success
    toast({
      title: "Mock Payment Successful!",
      description: `Amount Paid: PHP ${amountToPay.toFixed(2)}\nPayment Type: ${paymentType === "deposit" ? "30% Deposit" : "Full Fare"}`,
    });
    // alert(`Mock Payment Successful!\nAmount Paid: PHP ${amountToPay.toFixed(2)}\nPayment Type: ${paymentType === "deposit" ? "30% Deposit" : "Full Fare"}`);


    const confirmedReservation: Reservation = {
      ...reservation,
      paymentType: paymentType,
      amountPaid: amountToPay,
      finalFarePaid: amountToPay, // Update finalFarePaid to what was actually paid
    };

    localStorage.setItem('mockReservationDetails', JSON.stringify(confirmedReservation));
    localStorage.removeItem('pendingReservation'); // Clean up pending reservation
    router.push(`/reservations/${confirmedReservation.id}/receipt`);
  };

  if (loading || !reservation) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]"><p className="text-muted-foreground">Loading reservation details...</p></div>;
  }

  const depositAmount = reservation.amountDue * 0.30;
  const discountAmount = reservation.regularFareTotal - reservation.amountDue;

  return (
    <div className="container mx-auto py-12 max-w-2xl">
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <CreditCard className="mx-auto h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-3xl font-bold text-primary">Complete Your Reservation</CardTitle>
          <CardDescription className="text-muted-foreground">
            Review your booking details and choose a payment option.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-primary-foreground mb-3">Booking Summary</h3>
            <div className="space-y-2 text-sm rounded-lg border bg-card-foreground/5 p-4">
              <InfoRow icon={<UserCircle className="h-4 w-4 text-primary" />} label="Passenger" value={reservation.passengerName} />
              <InfoRow icon={<UserCircle className="h-4 w-4 text-primary" />} label="Passenger Type" value={reservation.userType} />
              <InfoRow icon={<Route className="h-4 w-4 text-primary" />} label="Route" value={`${reservation.origin} to ${reservation.selectedDestination}`} />
              <InfoRow icon={<Bus className="h-4 w-4 text-primary" />} label="Bus Type" value={reservation.busType} />
              <InfoRow icon={<CalendarDays className="h-4 w-4 text-primary" />} label="Date" value={reservation.tripDate || 'N/A'} />
              <InfoRow icon={<Clock className="h-4 w-4 text-primary" />} label="Departure" value={reservation.departureTime} />
              <InfoRow icon={<Armchair className="h-4 w-4 text-primary" />} label="Seats" value={reservation.seatNumbers.join(', ')} />
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-primary-foreground mb-3">Fare Details</h3>
            <div className="space-y-2 text-sm rounded-lg border bg-card-foreground/5 p-4">
              <InfoRow icon={<Tag className="h-4 w-4 text-primary" />} label="Total Regular Fare" value={`PHP ${reservation.regularFareTotal.toFixed(2)}`} />
              {reservation.discountApplied && (
                <InfoRow 
                  icon={<Percent className="h-4 w-4 text-green-500" />} 
                  label="Discount Applied" 
                  value={`- PHP ${discountAmount.toFixed(2)}`}
                  valueClassName="text-green-500"
                />
              )}
              <Separator className="my-2 bg-border" />
              <InfoRow icon={<DollarSign className="h-5 w-5 text-primary" />} label="Total Amount Due" value={`PHP ${reservation.amountDue.toFixed(2)}`} isLarge={true} />
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-primary-foreground mb-3">Payment Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                variant="default" 
                size="lg" 
                className="w-full py-6 text-base bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => handlePayment("deposit")}
              >
                Pay 30% Deposit <br /> (PHP {depositAmount.toFixed(2)})
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full py-6 text-base text-primary-foreground border-accent hover:bg-accent/20 hover:text-primary-foreground"
                onClick={() => handlePayment("full")}
              >
                Pay Full Fare <br /> (PHP {reservation.amountDue.toFixed(2)})
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              Remaining balance (if any) to be paid to the bus conductor.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
            <Button variant="link" onClick={() => router.back()} className="text-primary">
                Go Back
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  valueClassName?: string;
  isLarge?: boolean;
}

function InfoRow({ icon, label, value, valueClassName, isLarge }: InfoRowProps) {
  return (
    <div className={`flex items-center justify-between ${isLarge ? 'text-base' : ''}`}>
      <div className="flex items-center text-muted-foreground">
        {icon}
        <span className="ml-2">{label}:</span>
      </div>
      <span className={`font-semibold text-foreground ${isLarge ? 'text-lg' : ''} ${valueClassName || ''}`}>{value}</span>
    </div>
  );
}

