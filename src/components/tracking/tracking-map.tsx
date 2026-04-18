"use client";

import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap } from "react-leaflet";
import { divIcon, type LatLngExpression } from "leaflet";
import { LocateFixed } from "lucide-react";
import "leaflet/dist/leaflet.css";
import { municipalityCoordinates } from "@/lib/route-tracking/routes";
import type { LiveBusState, Route, RouteTerminal } from "@/lib/route-tracking/types";

interface TrackingMapProps {
  route: Route;
  buses: LiveBusState[];
  selectedBusId: string;
  selectedTerminal?: RouteTerminal;
}

const TERMINAL_PINS: Record<RouteTerminal, [number, number]> = {
  "South Bus Terminal": [10.2978881, 123.8934661],
  "North Bus Terminal": [10.3109640, 123.9208190],
};

function createBusIcon(isSelected: boolean, rotationDeg: number): ReturnType<typeof divIcon> {
  const width = isSelected ? 68 : 56;
  const height = isSelected ? 24 : 20;
  const strokeW = isSelected ? "3" : "2";

  return divIcon({
    className: "bg-transparent border-none",
    html: `
      <div style="width:${width}px;height:${height}px;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 4px 6px rgba(29,52,138,0.3));transform:rotate(${rotationDeg}deg);transform-origin:center center;">
        <svg width="${width}" height="${height}" viewBox="0 0 140 44" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <defs>
            <linearGradient id="beam" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#FFF000" stop-opacity="0.8"/>
              <stop offset="100%" stop-color="#FFF000" stop-opacity="0"/>
            </linearGradient>
          </defs>

          <!-- Mirrors -->
          <rect x="98" y="2" width="6" height="40" rx="3" fill="#0F1F5A" />
          
          <!-- Bus Body -->
          <rect x="24" y="6" width="92" height="32" rx="8" fill="#1D348A" stroke="white" stroke-width="${strokeW}"/>
          
          <!-- Front Windshield -->
          <path d="M 102 10 Q 113 22 102 34 L 95 34 L 95 10 Z" fill="#0F1F5A"/>

          <!-- Rear Window -->
          <rect x="28" y="12" width="6" height="20" rx="2" fill="#0F1F5A"/>

          <!-- Roof A/C Unit 1 (Front) -->
          <rect x="78" y="14" width="12" height="16" rx="2" fill="#DDE7FF" fill-opacity="0.9"/>
          
          <!-- Roof A/C Unit 2 (Rear) -->
          <rect x="50" y="12" width="18" height="20" rx="2" fill="#DDE7FF" fill-opacity="0.9"/>

          <!-- Orange Stripe -->
          <rect x="38" y="20" width="60" height="4" fill="#FF6802"/>

          <!-- Headlights / Lamps -->
          <rect x="112" y="9" width="4" height="6" rx="2" fill="#FFF59D" />
          <rect x="112" y="29" width="4" height="6" rx="2" fill="#FFF59D" />

          <!-- Light Beams -->
          <path d="M 116 12 L 140 0 L 140 20 Z" fill="url(#beam)"/>
          <path d="M 116 32 L 140 24 L 140 44 Z" fill="url(#beam)"/>
        </svg>
      </div>
    `,
    iconSize: [width, height],
    iconAnchor: [width / 2, height / 2],
  });
}

function createTerminalIcon(): ReturnType<typeof divIcon> {
  return divIcon({
    className: "bg-transparent border-none",
    html: `<div style="width:16px;height:16px;border-radius:9999px;background:#ff6802;border:3px solid white;box-shadow:0 0 0 4px rgba(255,104,2,0.18)"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

function RecenterControl({ position }: { position: LatLngExpression }) {
  const map = useMap();

  return (
    <div className="absolute right-4 bottom-6 z-[1000]">
      <button
        type="button"
        onClick={() => map.flyTo(position, map.getZoom(), { animate: true, duration: 0.6 })}
        className="h-10 w-10 rounded-full border border-white/90 bg-[#1d348a] text-white shadow-[0_8px_24px_rgba(29,52,138,0.35)] backdrop-blur-sm transition-transform hover:scale-105"
        aria-label="Recenter to bus"
      >
        <LocateFixed className="mx-auto h-4 w-4" />
      </button>
    </div>
  );
}

function pointDistance(a: [number, number], b: [number, number]): number {
  const dLat = a[0] - b[0];
  const dLng = a[1] - b[1];
  return Math.sqrt(dLat * dLat + dLng * dLng);
}

function interpolateOnPolyline(points: [number, number][], progress: number): [number, number] {
  if (points.length === 0) {
    return [municipalityCoordinates["Cebu City"].lat, municipalityCoordinates["Cebu City"].lng];
  }
  if (points.length === 1) {
    return points[0];
  }

  const clamped = Math.max(0, Math.min(1, progress));
  const segmentLengths = points.slice(0, -1).map((point, index) => pointDistance(point, points[index + 1]));
  const totalLength = segmentLengths.reduce((sum, value) => sum + value, 0);
  if (totalLength <= 0) {
    return points[0];
  }

  const target = totalLength * clamped;
  let traversed = 0;

  for (let index = 0; index < segmentLengths.length; index += 1) {
    const length = segmentLengths[index];
    if (traversed + length >= target) {
      const local = (target - traversed) / length;
      const start = points[index];
      const end = points[index + 1];
      return [start[0] + (end[0] - start[0]) * local, start[1] + (end[1] - start[1]) * local];
    }
    traversed += length;
  }

  return points[points.length - 1];
}

function getBusHeadingDeg(points: [number, number][], progress: number): number {
  if (points.length < 2) {
    return 0;
  }

  const clamped = Math.max(0, Math.min(1, progress));
  const lookAhead = Math.min(1, clamped + 0.01);
  const lookBehind = Math.max(0, clamped - 0.01);

  const current = interpolateOnPolyline(points, clamped);
  let target = interpolateOnPolyline(points, lookAhead);

  if (current[0] === target[0] && current[1] === target[1]) {
    target = interpolateOnPolyline(points, lookBehind);
  }

  const dLat = target[0] - current[0];
  const dLng = target[1] - current[1];
  if (dLat === 0 && dLng === 0) {
    return 0;
  }

  return (Math.atan2(-dLat, dLng) * 180) / Math.PI;
}

export default function TrackingMap({ route, buses, selectedBusId, selectedTerminal }: TrackingMapProps) {
  const fallbackCoordinates = useMemo(
    () => route.path.map((municipality) => {
      const coordinate = municipalityCoordinates[municipality] ?? municipalityCoordinates["Cebu City"];
      return [coordinate.lat, coordinate.lng] as [number, number];
    }),
    [route],
  );

  const [roadCoordinates, setRoadCoordinates] = useState<[number, number][]>(fallbackCoordinates);

  useEffect(() => {
    let disposed = false;

    async function fetchRoadGeometry() {
      try {
        const coordsParam = fallbackCoordinates.map(([lat, lng]) => `${lng},${lat}`).join(";");
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${coordsParam}?overview=full&geometries=geojson`,
        );

        if (!response.ok) {
          throw new Error(`OSRM error ${response.status}`);
        }

        const payload = await response.json();
        const geometry = payload?.routes?.[0]?.geometry?.coordinates as [number, number][] | undefined;
        const mapped = geometry?.map(([lng, lat]) => [lat, lng] as [number, number]);

        if (!disposed && mapped && mapped.length > 1) {
          setRoadCoordinates(mapped);
        }
      } catch {
        if (!disposed) {
          setRoadCoordinates(fallbackCoordinates);
        }
      }
    }

    fetchRoadGeometry();

    return () => {
      disposed = true;
    };
  }, [fallbackCoordinates]);

  const selectedBus = buses.find((item) => item.bus.id === selectedBusId) ?? buses[0];
  const fallbackCenter: [number, number] = selectedTerminal
    ? TERMINAL_PINS[selectedTerminal]
    : [municipalityCoordinates["Cebu City"].lat, municipalityCoordinates["Cebu City"].lng];
  const selectedPosition: [number, number] = selectedBus
    ? interpolateOnPolyline(roadCoordinates, selectedBus.progress)
    : fallbackCenter;
  const selectedBusHeading = selectedBus ? getBusHeadingDeg(roadCoordinates, selectedBus.progress) : 0;

  return (
    <MapContainer
      center={selectedPosition}
      zoom={10}
      zoomControl={false}
      attributionControl
      className="w-full h-full brightness-[0.98] contrast-[1.1] saturate-[1.2]"
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Polyline
        positions={roadCoordinates}
        color="#1d348a"
        weight={5}
        opacity={0.35}
        lineCap="round"
        lineJoin="round"
      />

      {selectedBus ? (
          <Marker key={selectedBus.bus.id} position={selectedPosition} icon={createBusIcon(true, selectedBusHeading)}>
            <Tooltip direction="top" offset={[0, -16]} opacity={1}>
              <div className="text-xs font-bold text-[#1d348a]">
                {selectedBus.bus.code} • ETA {Math.max(0, selectedBus.remainingMinutes)}m
              </div>
            </Tooltip>
          </Marker>
      ) : null}

      {selectedTerminal ? (
        <Marker position={TERMINAL_PINS[selectedTerminal]} icon={createTerminalIcon()}>
          <Tooltip direction="top" offset={[0, -12]} opacity={1}>
            <div className="text-xs font-bold text-[#1d348a]">
              {selectedTerminal}
            </div>
          </Tooltip>
        </Marker>
      ) : null}

      {(selectedBus || selectedTerminal) ? <RecenterControl position={selectedPosition} /> : null}
    </MapContainer>
  );
}