"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { BusType } from "@/types";
import { Card, CardContent } from "../ui/card";
import { Filter } from "lucide-react";

export function TripFilters() {
  const [busType, setBusType] = useState<BusType | "all">("all");

  const handleBusTypeChange = (value: string) => {
    setBusType(value as BusType | "all");
    // TODO: Implement actual filtering logic
    console.log("Selected bus type:", value);
  };

  return (
    <Card className="shadow-lg">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center text-lg font-semibold text-primary-foreground">
                <Filter className="h-5 w-5 mr-2 text-primary" />
                Filter Trips
            </div>
            <div className="flex-grow"></div> {/* Spacer */}
            <div className="flex items-center gap-2">
            <Label htmlFor="bus-type-select" className="text-muted-foreground">Bus Type:</Label>
            <Select value={busType} onValueChange={handleBusTypeChange}>
                <SelectTrigger id="bus-type-select" className="w-full sm:w-[200px] bg-input border-border focus:ring-primary">
                <SelectValue placeholder="Select bus type" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-popover">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Traditional">Traditional</SelectItem>
                <SelectItem value="Airconditioned">Airconditioned</SelectItem>
                </SelectContent>
            </Select>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
