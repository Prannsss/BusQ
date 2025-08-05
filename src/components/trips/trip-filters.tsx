
"use client";

import React from "react"; // Import React for React.memo
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { FilterableBusType } from "@/types";
import { Card, CardContent } from "../ui/card";
import { Filter } from "lucide-react";

interface TripFiltersProps {
  activeBusTypeFilter: FilterableBusType;
  onBusTypeFilterChange: (value: FilterableBusType) => void;
}

// Wrap TripFilters with React.memo
const TripFilters = React.memo(function TripFilters({ 
    activeBusTypeFilter, 
    onBusTypeFilterChange,
}: TripFiltersProps) {
  
  const handleBusTypeChange = (value: string) => {
    onBusTypeFilterChange(value as FilterableBusType);
  };

  return (
    <Card className="shadow-lg">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 flex-wrap">
            <div className="flex items-center text-lg font-semibold text-foreground">
                <Filter className="h-5 w-5 mr-2 text-primary" />
                Filter Trips
            </div>
            <div className="flex-grow"></div> {/* Spacer */}

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Label htmlFor="bus-type-select" className="text-muted-foreground whitespace-nowrap">Bus Type:</Label>
              <Select value={activeBusTypeFilter} onValueChange={handleBusTypeChange}>
                  <SelectTrigger id="bus-type-select" className="w-full sm:w-[200px] bg-input border-border focus:ring-primary">
                  <SelectValue placeholder="Select bus type" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-popover">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Traditional">Non-Airconditioned</SelectItem>
                  <SelectItem value="Airconditioned">Airconditioned</SelectItem>
                  </SelectContent>
              </Select>
            </div>
        </div>
      </CardContent>
    </Card>
  );
});

export { TripFilters };

