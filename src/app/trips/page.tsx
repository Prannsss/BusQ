import { TripList } from "@/components/trips/trip-list";
import { TripFilters } from "@/components/trips/trip-filters";
import { Separator } from "@/components/ui/separator";
import { Bus } from "lucide-react";

export default function TripsPage() {
  return (
    <div className="space-y-8">
      <header className="text-center">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
          <Bus className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-4xl font-bold text-primary-foreground">Available Trips</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Find and book your bus from Mantalongon to Cebu City.
        </p>
      </header>
      
      <TripFilters />
      <Separator className="my-6 bg-border" />
      <TripList />
    </div>
  );
}
