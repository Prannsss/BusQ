
"use client";

import { useEffect, useState } from 'react';
import { APIProvider, Map, Marker, AdvancedMarker } from '@vis.gl/react-google-maps';
import { Loader2, AlertTriangle, Construction } from 'lucide-react'; // Added Construction

interface BusMapProps {
  busId: string; // To fetch specific bus location
}

// Mock GPS coordinates for Mantalongon and Cebu City area
const MANTALONGON_COORDS = { lat: 9.7833, lng: 123.4 }; // Approximate
const CEBU_CITY_COORDS = { lat: 10.3157, lng: 123.8854 }; // Approximate

// Calculate a point somewhere in between for initial mock bus position
const INITIAL_BUS_POSITION = {
  lat: (MANTALONGON_COORDS.lat + CEBU_CITY_COORDS.lat) / 2,
  lng: (MANTALONGON_COORDS.lng + CEBU_CITY_COORDS.lng) / 2,
};

export function BusMap({ busId }: BusMapProps) {
  const [busPosition, setBusPosition] = useState(INITIAL_BUS_POSITION);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!googleMapsApiKey) {
      setError("Google Maps API key is not configured. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.");
      setLoading(false);
      return;
    }
    setLoading(false); // Assume API key is present for now

    // Simulate real-time updates
    const intervalId = setInterval(() => {
      setBusPosition(prevPos => ({
        lat: prevPos.lat + (Math.random() - 0.5) * 0.005, // Simulate small movement
        lng: prevPos.lng + (Math.random() - 0.5) * 0.005,
      }));
    }, 5000); // Update every 5 seconds

    return () => clearInterval(intervalId);
  }, [busId, googleMapsApiKey]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-muted text-muted-foreground">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p>Loading map...</p>
      </div>
    );
  }
  
  if (error) { // This will be true if googleMapsApiKey is missing
    return (
      <div className="flex flex-col items-center justify-center h-full bg-card text-card-foreground p-6 rounded-lg shadow-lg">
        <Construction className="h-16 w-16 text-primary mb-5" />
        <h2 className="text-2xl font-semibold text-foreground mb-3">Under Development</h2>
        <p className="text-center text-muted-foreground text-md max-w-sm">
          This feature is currently under development and will be coming soon.
        </p>
      </div>
    );
  }


  return (
    <APIProvider apiKey={googleMapsApiKey!}>
      <Map
        defaultCenter={INITIAL_BUS_POSITION}
        defaultZoom={10}
        mapId="busq-map"
        className="w-full h-full"
        gestureHandling={'greedy'}
        disableDefaultUI={true}
      >
        <AdvancedMarker position={busPosition} title={`Bus ${busId}`}>
            <div style={{
                width: '30px',
                height: '30px',
                backgroundColor: 'hsl(var(--primary))', // Orange
                borderRadius: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'hsl(var(--primary-foreground))', // White
                fontWeight: 'bold',
                boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
                border: '2px solid hsl(var(--primary-foreground))'
            }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 7.6 16 5 12 5s-6.7 2.6-8.5 6.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2"/><path d="M12 17H8.5c-.8 0-1.5-.7-1.5-1.5V13c0-.8.7-1.5 1.5-1.5H12V5H4"/><path d="M12 5v12"/><path d="M16 17a2 2 0 1 0-4 0"/><path d="M8 17a2 2 0 1 0-4 0"/></svg>
            </div>
        </AdvancedMarker>
        <Marker position={MANTALONGON_COORDS} title="Mantalongon" />
        <Marker position={CEBU_CITY_COORDS} title="Cebu City" />
      </Map>
    </APIProvider>
  );
}


    