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
  const layout: SeatLayout = { mainSeatRows: [], rearBenchRow: [] };
  const ROWNUMS = Array.from({ length: 12 }, (_, i) => i + 1); // Rows 1 to 12
  const REAR_BENCH_SEAT_COUNT = 5;

  if (busType === 'Traditional') {
    // 4 columns of seats (A, B, C, D) for 12 rows. Aisle after B. (2-aisle-2)
    // (4 seats * 12 rows) = 48 main seats
    // 5 rear bench seats
    // Total = 53
    const COLS = ['A', 'B', 'C', 'D'];
    const AISLE_AFTER_COL_LETTER = 'B';

    ROWNUMS.forEach(rowNum => {
      const rowArray: (Seat | null)[] = [];
      COLS.forEach(colLetter => {
        // Mock some reserved seats
        const isReserved = Math.random() < 0.2;
        rowArray.push({
          id: `${colLetter}${rowNum}`,
          label: `${colLetter}${rowNum}`,
          status: isReserved ? 'reserved' : 'available',
        });
        if (colLetter === AISLE_AFTER_COL_LETTER) {
          rowArray.push(null); // Aisle
        }
      });
      layout.mainSeatRows.push(rowArray);
    });

    for (let i = 1; i <= REAR_BENCH_SEAT_COUNT; i++) {
      const isReserved = Math.random() < 0.1;
      layout.rearBenchRow.push({
        id: `R${i}`,
        label: `R${i}`,
        status: isReserved ? 'reserved' : 'available',
      });
    }

  } else if (busType === 'Airconditioned') {
    // 5 columns of seats (A, B, C, D, E) for 12 rows. Aisle after B. (2-aisle-3)
    // (5 seats * 12 rows) = 60 main seats
    // 5 rear bench seats
    // Total = 65
    const COLS = ['A', 'B', 'C', 'D', 'E'];
    const AISLE_AFTER_COL_LETTER = 'B';

    ROWNUMS.forEach(rowNum => {
      const rowArray: (Seat | null)[] = [];
      COLS.forEach(colLetter => {
        const isReserved = Math.random() < 0.2;
        rowArray.push({
          id: `${colLetter}${rowNum}`,
          label: `${colLetter}${rowNum}`,
          status: isReserved ? 'reserved' : 'available',
        });
        if (colLetter === AISLE_AFTER_COL_LETTER) {
          rowArray.push(null); // Aisle
        }
      });
      layout.mainSeatRows.push(rowArray);
    });
    
    for (let i = 1; i <= REAR_BENCH_SEAT_COUNT; i++) {
      const isReserved = Math.random() < 0.1;
      layout.rearBenchRow.push({
        id: `R${i}`,
        label: `R${i}`,
        status: isReserved ? 'reserved' : 'available',
      });
    }
  }
  return layout;
};


export function SeatMap({ busType }: SeatMapProps) {
  const [seatLayout, setSeatLayout] = useState<SeatLayout | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  useEffect(() => {
    setSeatLayout(generateSeatLayout(busType));
    setSelectedSeats([]); // Reset selected seats when bus type or layout changes
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
      // status === 'selected' is now covered by 'available' && isSelected
    );
  };
  
  // Calculate column widths for grid based on bus type
  // Traditional: A, B, Aisle, C, D (5 visual columns)
  // Airconditioned: A, B, Aisle, C, D, E (6 visual columns)
  const gridColsClass = busType === 'Airconditioned' ? 'grid-cols-6' : 'grid-cols-5';

  return (
    <div className="p-4 bg-card-foreground/5 rounded-lg shadow">
      <div className="flex justify-around mb-6 text-sm">
        <div className="flex items-center"><Armchair className="w-5 h-5 mr-2 text-green-500" /> Available</div>
        <div className="flex items-center"><Armchair className="w-5 h-5 mr-2 text-primary" /> Selected</div>
        <div className="flex items-center"><Armchair className="w-5 h-5 mr-2 text-muted-foreground opacity-60" /> Reserved</div>
      </div>

      <div className="mb-4 p-2 bg-muted text-muted-foreground text-center rounded-md font-semibold">
        FRONT OF BUS
      </div>

      <div className={`grid ${gridColsClass} gap-2 max-w-md mx-auto select-none`}>
        {seatLayout.mainSeatRows.map((row, rowIndex) => (
          <React.Fragment key={`main-row-${rowIndex}`}>
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
          </React.Fragment>
        ))}
      </div>
      
      {seatLayout.rearBenchRow.length > 0 && (
        <div className="mt-8 pt-4 border-t border-border">
          <div className="mb-3 p-2 bg-muted text-muted-foreground text-center rounded-md font-semibold">
            REAR BENCH
          </div>
          <div className="flex justify-center items-center gap-2 flex-wrap max-w-md mx-auto">
            {seatLayout.rearBenchRow.map(seat => (
              seat ? ( // Should always be a seat object based on generation logic
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
              ) : null 
            ))}
          </div>
        </div>
      )}
      
      <div className="mt-6 text-center">
        <p className="text-muted-foreground">Selected Seats: {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}</p>
        {/* TODO: Add logic to calculate total price based on selectedSeats and trip.price */}
      </div>
    </div>
  );
}
