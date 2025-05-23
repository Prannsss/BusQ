
import React from "react"; // Import React for React.memo
import type { Trip } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Clock, Users, Thermometer, TrendingUp, Tag, ArrowRight, Armchair, Route, CalendarDays, Info } from "lucide-react";
import Image from "next/image";

interface TripCardProps {
  trip: Trip;
}

const getStatusBadgeVariant = (status: Trip["status"]): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case "Scheduled":
      return "default"; // Blue or primary
    case "On Standby":
      return "secondary"; // Yellow-ish or secondary
    case "Travelling":
      return "outline"; // Green-ish or custom
    case "Completed":
      return "outline"; // Gray
    case "Cancelled":
      return "destructive"; // Red
    case "Parked":
      return "secondary";
    default:
      return "default";
  }
};

const getStatusBadgeColors = (status: Trip["status"]): string => {
    switch (status) {
      case "Scheduled":
        return "bg-blue-500 text-blue-50";
      case "On Standby":
        return "bg-yellow-500 text-yellow-50";
      case "Travelling":
        return "bg-green-500 text-green-50";
      case "Completed":
        return "bg-gray-500 text-gray-50";
      case "Cancelled":
        return "bg-red-500 text-red-50";
      case "Parked":
        return "bg-indigo-500 text-indigo-50";
      default:
        return "bg-primary text-primary-foreground";
    }
}

// Wrap TripCard with React.memo
const TripCard = React.memo(function TripCard({ trip }: TripCardProps) {
  const { id, departureTime, arrivalTime, busType, availableSeats, totalSeats, price, origin, destination, status, tripDate } = trip;

  const isBookable = status === "Scheduled" || status === "On Standby";

  return (
    <Card className="flex flex-col justify-between bg-card border-border shadow-lg hover:shadow-primary/30 transition-shadow duration-300 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="relative h-40 w-full mb-4">
            <Image 
                src={busType === "Airconditioned" ? "https://placehold.co/600x300.png" : "https://placehold.co/600x300.png"}
                alt={`${busType} bus`}
                layout="fill"
                objectFit="cover"
                className="rounded-t-lg"
                data-ai-hint={busType === "Airconditioned" ? "modern bus interior" : "classic bus exterior"}
            />
            <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-semibold ${busType === "Airconditioned" ? "bg-blue-600 text-blue-50" : "bg-yellow-600 text-yellow-50"}`}>
                {busType}
            </div>
             <Badge variant={getStatusBadgeVariant(status)} className={`absolute top-2 left-2 ${getStatusBadgeColors(status)}`}>
                {status}
            </Badge>
        </div>
        <CardTitle className="text-xl text-foreground">{origin} <Route className="inline h-5 w-5 mx-1 text-muted-foreground" /> {destination}</CardTitle>
        <CardDescription className="text-muted-foreground flex items-center">
          <Clock className="h-4 w-4 mr-2" /> {departureTime} - {arrivalTime}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 pt-0 pb-3">
        <div className="flex items-center text-sm text-muted-foreground">
          <CalendarDays className="h-4 w-4 mr-2 text-primary" />
          <span>Date: {tripDate}</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Armchair className="h-4 w-4 mr-2 text-primary" />
          <span>Seats: {availableSeats} / {totalSeats} available</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Tag className="h-4 w-4 mr-2 text-primary" />
          <span>Price: PHP {price.toFixed(2)}</span>
        </div>
      </CardContent>
      <CardFooter>
        {isBookable ? (
          <Link href={`/trips/${id}/seats`} passHref className="w-full">
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              Select Seats <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        ) : (
          <Button className="w-full" variant="outline" disabled>
            <Info className="mr-2 h-4 w-4" /> Not Bookable
          </Button>
        )}
      </CardFooter>
    </Card>
  );
});

export { TripCard };

