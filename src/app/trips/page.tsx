
"use client";

import { useState } from "react";
import { useSearchParams } from 'next/navigation'; // Import useSearchParams
import { TripList } from "@/components/trips/trip-list";
import { TripFilters } from "@/components/trips/trip-filters";
import { Separator } from "@/components/ui/separator";
import { Bus } from "lucide-react";
import type { FilterableBusType } from "@/types";

export default function TripsPage() {
  const searchParams = useSearchParams(); // Use the hook to access search parameters

  // Example: You could potentially use searchParams to initialize filters:
  // const initialBusType = searchParams.get('busType') as FilterableBusType || "all";

  const [activeBusTypeFilter, setActiveBusTypeFilter] = useState<FilterableBusType>("all");

  return (
    <div className="space-y-8">
      <header className="text-center">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
          <Bus className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-4xl font-bold text-foreground">Available Trips</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Find and book your bus from South Bus Terminal.
        </p>
      </header>
      
      <TripFilters 
        activeBusTypeFilter={activeBusTypeFilter} 
        onBusTypeFilterChange={setActiveBusTypeFilter}
      />
      <Separator className="my-6 bg-border" />
      <TripList 
        activeBusTypeFilter={activeBusTypeFilter} 
      />
    </div>
  );
}
