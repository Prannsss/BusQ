
import { Reservation } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { User, Ticket, Bus, CalendarDays, Clock, Tag, Hash, Route, MapPin } from "lucide-react";

interface ReceiptDetailsProps {
  reservation: Reservation;
}

export function ReceiptDetails({ reservation }: ReceiptDetailsProps) {
  return (
    <Card className="shadow-xl border-primary/30">
      <CardHeader>
        <CardTitle className="text-2xl text-primary text-center">Booking Confirmed!</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-foreground">
        <InfoRow icon={<Hash className="h-5 w-5 text-primary" />} label="Reservation ID" value={reservation.id} />
        <Separator className="bg-border" />
        <InfoRow icon={<User className="h-5 w-5 text-primary" />} label="Passenger Name" value={reservation.passengerName} />
        {reservation.origin && reservation.selectedDestination && (
          <InfoRow 
            icon={<Route className="h-5 w-5 text-primary" />} 
            label="Route" 
            value={`${reservation.origin} to ${reservation.selectedDestination}`} 
          />
        )}
        <InfoRow icon={<MapPin className="h-5 w-5 text-primary" />} label="Your Destination" value={reservation.selectedDestination} />
        <InfoRow icon={<Bus className="h-5 w-5 text-primary" />} label="Bus Type" value={reservation.busType} />
        {reservation.tripDate && <InfoRow icon={<CalendarDays className="h-5 w-5 text-primary" />} label="Departure Date" value={reservation.tripDate} /> }
        <InfoRow icon={<Clock className="h-5 w-5 text-primary" />} label="Departure Time" value={reservation.departureTime} />
        <InfoRow icon={<Ticket className="h-5 w-5 text-primary" />} label="Seat Number(s)" value={reservation.seatNumbers.join(", ")} />
        <Separator className="bg-border" />
        <div className="flex justify-between items-center pt-2">
          <div className="flex items-center text-lg font-semibold">
            <Tag className="h-6 w-6 text-primary mr-2" />
            Total Amount:
          </div>
          <span className="text-xl font-bold text-primary">PHP {reservation.totalAmount.toFixed(2)}</span>
        </div>
      </CardContent>
    </Card>
  );
}

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center text-muted-foreground">
        {icon}
        <span className="ml-2">{label}:</span>
      </div>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}
