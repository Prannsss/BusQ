
import { Reservation } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { User, Ticket, Bus, CalendarDays, Clock, Tag, Hash, Route, MapPin, UserCircle, Percent, DollarSign, CreditCard } from "lucide-react";

interface ReceiptDetailsProps {
  reservation: Reservation;
}

export function ReceiptDetails({ reservation }: ReceiptDetailsProps) {
  const discountAmount = reservation.regularFareTotal - reservation.amountDue;

  return (
    <Card className="shadow-xl border-primary/30">
      <CardHeader>
        <CardTitle className="text-2xl text-primary text-center">Booking Confirmed!</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-foreground">
        <InfoRow icon={<Hash className="h-5 w-5 text-primary" />} label="Reservation ID" value={reservation.id} />
        <Separator className="bg-border" />
        <InfoRow icon={<UserCircle className="h-5 w-5 text-primary" />} label="Passenger Name" value={reservation.passengerName} />
        <InfoRow icon={<User className="h-5 w-5 text-primary" />} label="Passenger Type" value={reservation.userType} />
        
        {reservation.origin && reservation.selectedDestination && (
          <InfoRow 
            icon={<Route className="h-5 w-5 text-primary" />} 
            label="Route" 
            value={`${reservation.origin} to ${reservation.selectedDestination}`} 
          />
        )}
        <InfoRow icon={<Bus className="h-5 w-5 text-primary" />} label="Bus Type" value={reservation.busType} />
        {reservation.tripDate && <InfoRow icon={<CalendarDays className="h-5 w-5 text-primary" />} label="Departure Date" value={reservation.tripDate} /> }
        <InfoRow icon={<Clock className="h-5 w-5 text-primary" />} label="Departure Time" value={reservation.departureTime} />
        <InfoRow icon={<Ticket className="h-5 w-5 text-primary" />} label="Seat Number(s)" value={reservation.seatNumbers.join(", ")} />
        <Separator className="bg-border" />

        <h4 className="text-md font-semibold text-foreground pt-2">Fare Breakdown:</h4>
        <InfoRow icon={<Tag className="h-5 w-5 text-muted-foreground" />} label="Total Regular Fare" value={`PHP ${reservation.regularFareTotal.toFixed(2)}`} />
        {reservation.discountApplied && (
          <InfoRow 
            icon={<Percent className="h-5 w-5 text-green-500" />} 
            label="Discount Applied (20%)" 
            value={`- PHP ${discountAmount.toFixed(2)}`} 
            valueClassName="text-green-500"
          />
        )}
        <InfoRow icon={<DollarSign className="h-5 w-5 text-muted-foreground" />} label="Amount Due (After Discount)" value={`PHP ${reservation.amountDue.toFixed(2)}`} />
        
        {reservation.paymentType && reservation.amountPaid !== undefined && (
          <>
            <Separator className="my-1 bg-border" />
             <h4 className="text-md font-semibold text-foreground pt-2">Payment Details:</h4>
            <InfoRow 
                icon={<CreditCard className="h-5 w-5 text-primary" />} 
                label="Payment Type" 
                value={reservation.paymentType === "deposit" ? "30% Deposit" : "Full Payment"} 
            />
            <div className="flex justify-between items-center pt-2">
              <div className="flex items-center text-lg font-semibold text-foreground">
                <DollarSign className="h-6 w-6 text-primary mr-2" />
                Total Amount Paid:
              </div>
              <span className="text-xl font-bold text-primary">PHP {reservation.finalFarePaid.toFixed(2)}</span>
            </div>
            {reservation.paymentType === "deposit" && (
                <p className="text-xs text-muted-foreground text-center pt-2">
                    Remaining balance of PHP {(reservation.amountDue - reservation.finalFarePaid).toFixed(2)} to be paid to the bus conductor.
                </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  valueClassName?: string;
}

function InfoRow({ icon, label, value, valueClassName }: InfoRowProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center text-muted-foreground">
        {icon}
        <span className="ml-2">{label}:</span>
      </div>
      <span className={`font-semibold text-foreground ${valueClassName || ''}`}>{value}</span>
    </div>
  );
}

