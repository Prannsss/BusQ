"use client";

import { useState, useEffect } from 'react';
import { Seat, SeatLayout, SeatStatus, BusType } from '@/types';
import { cn } from '@/lib/utils';
import { Armchair } from 'lucide-react';

interface SeatMapProps {
  busType: BusType;
  // initialSeatLayout?: SeatLayout; // Could be passed if pre-fetching layout
}

const generateSeatLayout = (busType: BusType): SeatLayout => {
  const rows = busType === 'Airconditioned' ? 10 : 12;
  const seatsPerRow = busType === 'Airconditioned' ? 4 : 5; // 2-2 or 2-aisle-3
  const aisleIndex = 2;

  let layout: SeatLayout = { rows: [] };
  let seatCounter = 1;

  for (let r = 0; r < rows; r++) {
    const row: (Seat | null)[] = [];
    for (let s = 0; s < seatsPerRow; s++) {
      if (busType === 'Airconditioned' && s === aisleIndex) {
        row.push(null); // Aisle for 2-2
      } else if (busType === 'Traditional' && s === aisleIndex) {
        row.push(null); // Aisle for 2-aisle-3
      }
      else {
        // Mock some reserved seats
        const isReserved = Math.random() < 0.2;
        row.push({
          id: `${String.fromCharCode(65 + r)}${seatCounter}`,
          label: `${String.fromCharCode(65 + r)}${seatCounter}`,
          status: isReserved ? 'reserved' : 'available',
        });
        seatCounter++;
      }
    }
    if (busType === 'Traditional') seatCounter = 1; // Reset for next row labels like A1, A2, B1, B2
    else seatCounter = (r * (seatsPerRow - (busType === 'Airconditioned' ? 1:1) )) +1;


    layout.rows.push(row);
  }
  return layout;
};


export function SeatMap({ busType }: SeatMapProps) {
  const [seatLayout, setSeatLayout] = useState<SeatLayout | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  useEffect(() => {
    setSeatLayout(generateSeatLayout(busType));
    setSelectedSeats([]); // Reset selected seats when bus type changes
  }, [busType]);


  const handleSeatClick = (seatId: string, status: SeatStatus) => {
    if (status === 'reserved') return;

    setSelectedSeats(prevSelected =>
      prevSelected.includes(seatId)
        ? prevSelected.filter(id => id !== seatId)
        : [...prevSelected, seatId]
    );
  };

  if (!seatLayout) {
    return <div className="flex justify-center items-center h-64 text-muted-foreground">Loading seat map...</div>;
  }

  const getSeatClassName = (status: SeatStatus, seatId: string) => {
    const isSelected = selectedSeats.includes(seatId);
    return cn(
      "w-10 h-10 rounded-md flex items-center justify-center cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-110",
      "border-2",
      status === 'available' && !isSelected && "bg-green-200/30 border-green-500 text-green-700 hover:bg-green-300/50",
      status === 'available' && isSelected && "bg-primary border-primary/70 text-primary-foreground ring-2 ring-offset-2 ring-offset-card ring-primary",
      status === 'reserved' && "bg-muted border-muted-foreground text-muted-foreground cursor-not-allowed opacity-60",
      status === 'selected' && "bg-primary border-primary/70 text-primary-foreground ring-2 ring-offset-2 ring-offset-card ring-primary", // Legacy, now handled by isSelected
    );
  };
  
  // Calculate column widths for grid based on bus type
  const gridColsClass = busType === 'Airconditioned' ? 'grid-cols-5' : 'grid-cols-5'; // 2-aisle-2 vs 2-aisle-3, +1 for row labels

  return (
    <div className="p-4 bg-card-foreground/5 rounded-lg shadow">
      <div className="flex justify-around mb-6 text-sm">
        <div className="flex items-center"><Armchair className="w-5 h-5 mr-2 text-green-500" /> Available</div>
        <div className="flex items-center"><Armchair className="w-5 h-5 mr-2 text-primary" /> Selected</div>
        <div className="flex items-center"><Armchair className="w-5 h-5 mr-2 text-muted-foreground opacity-60" /> Reserved</div>
      </div>

      {/* Bus front indicator */}
      <div className="mb-4 p-2 bg-muted text-muted-foreground text-center rounded-md font-semibold">
        FRONT OF BUS
      </div>

      <div className={`grid ${gridColsClass} gap-2 max-w-md mx-auto select-none`}>
        {seatLayout.rows.map((row, rowIndex) => (
          <>
            {/* Row Label on the left if needed, for now, we'll simplify */}
            {row.map((seat, seatIndex) => (
              seat ? (
                <div
                  key={seat.id}
                  className={getSeatClassName(seat.status, seat.id)}
                  onClick={() => handleSeatClick(seat.id, seat.status)}
                  role="button"
                  aria-pressed={selectedSeats.includes(seat.id)}
                  aria-label={`Seat ${seat.label}, Status: ${selectedSeats.includes(seat.id) ? 'selected' : seat.status}`}
                >
                  <span className="text-xs font-medium">{seat.label}</span>
                </div>
              ) : (
                <div key={`aisle-${rowIndex}-${seatIndex}`} className="w-10 h-10" /> // Aisle spacer
              )
            ))}
          </>
        ))}
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-muted-foreground">Selected Seats: {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}</p>
      </div>
    </div>
  );
}
