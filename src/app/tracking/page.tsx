import { BusMap } from "@/components/tracking/bus-map";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Search } from "lucide-react";

export default function TrackingPage() {
  // In a real app, you might pass a bus ID or plate number to BusMap
  const busToTrack = "XYZ 123"; // Example bus plate number

  return (
    <div className="space-y-8">
      <header className="text-center">
        <MapPin className="mx-auto h-12 w-12 text-primary mb-4" />
        <h1 className="text-4xl font-bold text-primary-foreground">Real-Time Bus Tracking</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Follow your bus live from Mantalongon to Cebu City.
        </p>
      </header>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Track a Specific Bus</CardTitle>
          <CardDescription>Enter the bus plate number to see its current location.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex w-full max-w-sm items-center space-x-2 mx-auto">
            <Input type="text" placeholder="e.g., ABC 123" className="bg-input border-border focus:ring-primary" />
            <Button type="submit" variant="default" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Search className="h-4 w-4 mr-2" /> Track
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-xl overflow-hidden">
        <CardHeader>
            <CardTitle className="text-2xl text-primary">Live Map</CardTitle>
            <CardDescription>Showing location for bus: <span className="font-semibold text-primary">{busToTrack}</span></CardDescription>
        </CardHeader>
        <CardContent className="p-0 md:p-0"> {/* Remove padding for map to fill */}
          <div className="h-[500px] w-full bg-muted rounded-b-md">
            {/* The APIProvider and Map components will be inside BusMap */}
            <BusMap busId={busToTrack} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
