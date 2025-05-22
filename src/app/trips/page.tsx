
"use client";

import { useState } from "react";
import { TripList } from "@/components/trips/trip-list";
import { TripFilters } from "@/components/trips/trip-filters";
import { Separator } from "@/components/ui/separator";
import { Bus } from "lucide-react";
import type { FilterableBusType, FilterableTripDirection } from "@/types";

export default function TripsPage() {
  const [activeBusTypeFilter, setActiveBusTypeFilter] = useState<FilterableBusType>("all");
  const [activeDirectionFilter, setActiveDirectionFilter] = useState<FilterableTripDirection>("all");

  return (
    <div className="space-y-8">
      <header className="text-center">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
          <Bus className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-4xl font-bold text-primary-foreground">Available Trips</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Find and book your bus from Mantalongon to Cebu City or vice versa.
        </p>
      </header>
      
      <TripFilters 
        activeBusTypeFilter={activeBusTypeFilter} 
        onBusTypeFilterChange={setActiveBusTypeFilter}
        activeDirectionFilter={activeDirectionFilter}
        onDirectionFilterChange={setActiveDirectionFilter} 
      />
      <Separator className="my-6 bg-border" />
      <TripList activeBusTypeFilter={activeBusTypeFilter} activeDirectionFilter={activeDirectionFilter} />
    </div>
  );
}
