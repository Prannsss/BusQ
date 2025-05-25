
import React from "react";
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
      return "default";
    case "Travelling":
    case "Returning":
      return "default";
    case "Completed for Day":
      return "secondary";
    default:
      return "default";
  }
};

const getStatusBadgeColors = (badgeColorKey: BadgeColorKey): string => {
    switch (badgeColorKey) {
        case "blue": // Scheduled
            return "bg-sky-500 text-sky-50";
        case "green": // Travelling
            return "bg-emerald-500 text-emerald-50";
        case "orange": // Returning
            return "bg-orange-500 text-orange-50";
        case "gray": // Completed for Day
            return "bg-slate-500 text-slate-50";
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
    displayStatus,
    badgeColorKey
  } = trip;

  const isBookable = displayStatus === "Scheduled";

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
            <Badge 
              variant={getStatusBadgeVariant(displayStatus)} 
              className={`absolute top-2 left-2 ${getStatusBadgeColors(badgeColorKey)}`}
            >
              {displayStatus}
            </Badge>
        </div>
        <CardTitle className="text-foreground">{origin} <Route className="inline h-5 w-5 mx-1 text-muted-foreground" /> {destination}</CardTitle>
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
            {displayStatus === "Travelling" ? "Bus Travelling" :
             displayStatus === "Returning" ? "Bus Returning" :
             displayStatus === "Completed for Day" ? "Trip Completed" :
             "Not Bookable"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
});

export { TripCard };
