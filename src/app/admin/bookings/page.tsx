'use client';

import { useState } from 'react';
import { ChevronDown, QrCode } from 'lucide-react';

// Mock data for bookings
type Booking = {
  id: string;
  name: string;
  bookedBus: string;
  plateNumber: string;
  bookingDate: string;
  boardedTime: string;
  arrivalTime: string;
  boardingQR: string;
  status: 'boarded' | 'no-show';
};

const mockBookings: Booking[] = [
  { id: 'BK001', name: 'Alice Johnson', bookedBus: 'Express Route 1', plateNumber: 'ABC-123', bookingDate: '2026-06-01', boardedTime: '08:15 AM', arrivalTime: '08:45 AM', boardingQR: 'QR-BK001', status: 'boarded' },
  { id: 'BK002', name: 'Bob Smith', bookedBus: 'Express Route 2', plateNumber: 'XYZ-789', bookingDate: '2026-06-01', boardedTime: '09:00 AM', arrivalTime: '09:30 AM', boardingQR: 'QR-BK002', status: 'boarded' },
  { id: 'BK003', name: 'Carol Williams', bookedBus: 'Local Transit A', plateNumber: 'DEF-456', bookingDate: '2026-06-02', boardedTime: '-', arrivalTime: '-', boardingQR: 'QR-BK003', status: 'no-show' },
  { id: 'BK004', name: 'David Brown', bookedBus: 'Express Route 1', plateNumber: 'ABC-123', bookingDate: '2026-06-02', boardedTime: '07:45 AM', arrivalTime: '08:15 AM', boardingQR: 'QR-BK004', status: 'boarded' },
  { id: 'BK005', name: 'Eva Martinez', bookedBus: 'Local Transit B', plateNumber: 'GHI-321', bookingDate: '2026-06-02', boardedTime: '-', arrivalTime: '-', boardingQR: 'QR-BK005', status: 'no-show' },
  { id: 'BK006', name: 'Frank Lee', bookedBus: 'Express Route 3', plateNumber: 'JKL-654', bookingDate: '2026-06-03', boardedTime: '10:30 AM', arrivalTime: '11:00 AM', boardingQR: 'QR-BK006', status: 'boarded' },
  { id: 'BK007', name: 'Grace Kim', bookedBus: 'Local Transit A', plateNumber: 'DEF-456', bookingDate: '2026-06-03', boardedTime: '08:00 AM', arrivalTime: '08:30 AM', boardingQR: 'QR-BK007', status: 'boarded' },
  { id: 'BK008', name: 'Henry Davis', bookedBus: 'Express Route 2', plateNumber: 'XYZ-789', bookingDate: '2026-06-03', boardedTime: '09:15 AM', arrivalTime: '09:45 AM', boardingQR: 'QR-BK008', status: 'boarded' },
];

export default function AdminBookingsPage() {
  const [statusFilter, setStatusFilter] = useState<'all' | 'boarded' | 'no-show'>('all');

  const filteredBookings = statusFilter === 'all'
    ? mockBookings
    : mockBookings.filter((b) => b.status === statusFilter);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-[#1d348a]">
          Bookings
        </h1>

        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'boarded' | 'no-show')}
            className="appearance-none border-2 border-[#1d348a] bg-white px-4 py-2 pr-10 font-bold uppercase tracking-tight text-xs text-[#1d348a] focus:outline-none focus:bg-zinc-100"
          >
            <option value="all">All Status</option>
            <option value="boarded">Boarded</option>
            <option value="no-show">No Show</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1d348a] pointer-events-none" />
        </div>
      </div>

      <div className="border-2 border-[#1d348a] bg-white overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b-2 border-[#1d348a] bg-zinc-50">
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-tight text-zinc-600">Name</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-tight text-zinc-600">Booked Bus</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-tight text-zinc-600">Plate Number</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-tight text-zinc-600">Booking Date</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-tight text-zinc-600">Boarded Time</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-tight text-zinc-600">Arrival Time</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-tight text-zinc-600">Boarding QR</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-tight text-zinc-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((booking) => (
              <tr key={booking.id} className="border-b-2 border-[#1d348a]/10 last:border-0">
                <td className="px-4 py-3 text-sm font-medium text-[#1d348a]">{booking.name}</td>
                <td className="px-4 py-3 text-sm font-medium text-[#1d348a]">{booking.bookedBus}</td>
                <td className="px-4 py-3 text-sm font-medium text-[#1d348a]">{booking.plateNumber}</td>
                <td className="px-4 py-3 text-sm font-medium text-zinc-700">{booking.bookingDate}</td>
                <td className="px-4 py-3 text-sm font-medium text-zinc-700">{booking.boardedTime}</td>
                <td className="px-4 py-3 text-sm font-medium text-zinc-700">{booking.arrivalTime}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <QrCode className="h-4 w-4 text-[#1d348a]" />
                    <span className="text-sm font-mono text-zinc-700">{booking.boardingQR}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-2 py-1 text-xs font-bold uppercase tracking-tight border-2 ${
                      booking.status === 'boarded'
                        ? 'bg-[#1d348a] text-white border-[#1d348a]'
                        : 'text-red-600 border-red-600'
                    }`}
                  >
                    {booking.status === 'boarded' ? 'Boarded' : 'No Show'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
