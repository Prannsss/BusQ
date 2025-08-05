
"use client";
import React, { useEffect, useState } from "react"; // Ensured React is imported
import type { DisplayTripInfo, TripStatus, BadgeColorKey } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Clock, Users, Thermometer, TrendingUp, Tag, ArrowRight, Armchair, Route, CalendarDays, Info } from "lucide-react";
import Image from "next/image";

interface TripCardProps {
  trip: DisplayTripInfo;
}

const getStatusBadgeVariant = (status: TripStatus): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case "Scheduled":
      return "default"; // Blue
    case "Travelling":
      return "default"; // Green
    case "Completed for Day":
      return "secondary"; // Gray
    default:
      return "secondary";
  }
};

const getStatusBadgeColors = (badgeColorKey: BadgeColorKey): string => {
    switch (badgeColorKey) {
        case "blue": // Scheduled
            return "bg-sky-500 text-sky-50 hover:bg-sky-600";
        case "green": // Travelling
            return "bg-emerald-500 text-emerald-50 hover:bg-emerald-600";
        case "gray": // Completed for Day
            return "bg-slate-500 text-slate-50 hover:bg-slate-600";
        default:
            return "bg-primary text-primary-foreground"; 
    }
}

const TripCard = React.memo(function TripCard({ trip }: TripCardProps) {
  const { 
    id, 
    departureTime, 
    arrivalTime, 
    busType, 
    availableSeats, 
    totalSeats, 
    price, 
    origin, 
    destination, 
    tripDate,
    displayStatus, // This is now passed directly
    badgeColorKey,   // This is now passed directly
    departureTimestamp,
    arrivalTimestamp,
    busName = "Unknown Bus" // Default bus name if not provided
  } = trip;

  // State for client-side status updates
  const [currentDisplayStatus, setCurrentDisplayStatus] = useState<TripStatus>(displayStatus);
  const [currentBadgeColorKey, setCurrentBadgeColorKey] = useState<BadgeColorKey>(badgeColorKey);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Component has mounted on the client

    const updateStatus = () => {
      const now = new Date().getTime();
      let newStatus: TripStatus = "Completed for Day"; // Default to completed
      let newColorKey: BadgeColorKey = "gray";

      // This logic should mirror the one in TripList for determining the *current actual phase*
      // For South Terminal trips, it's a simple one-way journey to the destination.
      // We no longer have the complex MtoC and CtoM cycle logic.

      if (now < departureTimestamp) {
        newStatus = "Scheduled";
        newColorKey = "blue";
      } else if (now < arrivalTimestamp) {
        // For South Terminal trips, it's always "Travelling" when en route
        newStatus = "Travelling";
        newColorKey = "green";
      } else {
        // Trip has completed
        newStatus = "Completed for Day";
        newColorKey = "gray";
         if (displayStatus === "Scheduled" && now >= departureTimestamp) { // Catch if it just started
            newStatus = "Travelling";
            newColorKey = "green";
         }
      }
      
      setCurrentDisplayStatus(newStatus);
      setCurrentBadgeColorKey(newColorKey);
    };

    updateStatus(); // Initial calculation on client mount

    const timerId = setInterval(updateStatus, 30000); // Update every 30 seconds
    return () => clearInterval(timerId); // Cleanup on unmount

  }, [departureTimestamp, arrivalTimestamp, id, trip.direction, displayStatus, badgeColorKey]);


  const isBookable = currentDisplayStatus === "Scheduled";

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
            <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-semibold ${busType === "Airconditioned" ? "bg-sky-500 text-sky-50" : "bg-rose-500 text-rose-50"}`}>
                {busType}
            </div>
            {isClient ? (
              <Badge 
                variant={getStatusBadgeVariant(currentDisplayStatus)} 
                className={`absolute top-2 left-2 ${getStatusBadgeColors(currentBadgeColorKey)}`}
              >
                {currentDisplayStatus}
              </Badge>
            ) : (
              <Badge variant="secondary" className="absolute top-2 left-2">Loading...</Badge>
            )}
        </div>
        <CardTitle className="text-foreground">{busName}</CardTitle>
        <CardDescription className="text-muted-foreground flex items-center">
          <Route className="h-4 w-4 mr-2" /> South Terminal → All Southern Destinations
        </CardDescription>
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
            <Info className="mr-2 h-4 w-4" /> 
            {currentDisplayStatus === "Travelling" ? "Bus Travelling" :
             currentDisplayStatus === "Completed for Day" ? "Trip Completed" :
             !isClient ? "Checking Status..." : // Fallback if client hasn't determined status yet
             "Not Bookable"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
});
TripCard.displayName = 'TripCard';


export { TripCard };
