'use client';

import { Bus, Calendar, Clock } from 'lucide-react';
import { useState } from 'react';

// Mock data for buses
type BusSchedule = {
  id: string;
  busNumber: string;
  plateNumber: string;
  route: string;
  departureTime: string;
  arrivalTime: string;
  status: 'Travelling' | 'On Standby';
  driver: string;
};

const mockBuses: BusSchedule[] = [
  { id: 'BUS-001', busNumber: 'BUS-701', plateNumber: 'ABC-123', route: 'Southbound - East Coast Line', departureTime: '06:00 AM', arrivalTime: '09:30 AM', status: 'Travelling', driver: 'Juan Dela Cruz' },
  { id: 'BUS-002', busNumber: 'BUS-702', plateNumber: 'XYZ-789', route: 'Southbound - East Coast Line', departureTime: '07:00 AM', arrivalTime: '10:30 AM', status: 'Travelling', driver: 'Maria Santos' },
  { id: 'BUS-003', busNumber: 'BUS-703', plateNumber: 'DEF-456', route: 'Southbound - West Coast Line', departureTime: '08:00 AM', arrivalTime: '12:00 PM', status: 'Travelling', driver: 'Pedro Reyes' },
  { id: 'BUS-004', busNumber: 'BUS-704', plateNumber: 'GHI-321', route: 'Northbound - Eastern Line', departureTime: '09:00 AM', arrivalTime: '11:45 AM', status: 'On Standby', driver: 'Ana Lopez' },
  { id: 'BUS-005', busNumber: 'BUS-705', plateNumber: 'JKL-654', route: 'Northbound - Western Line', departureTime: '10:00 AM', arrivalTime: '02:00 PM', status: 'On Standby', driver: 'Carlos Mendez' },
  { id: 'BUS-006', busNumber: 'BUS-706', plateNumber: 'MNO-987', route: 'Southbound - East Coast Line', departureTime: '11:00 AM', arrivalTime: '02:30 PM', status: 'On Standby', driver: 'Luzviminda Cruz' },
  { id: 'BUS-007', busNumber: 'BUS-707', plateNumber: 'PQR-147', route: 'Northbound - Eastern Line', departureTime: '12:00 PM', arrivalTime: '03:00 PM', status: 'Travelling', driver: 'Roberto Garcia' },
  { id: 'BUS-008', busNumber: 'BUS-708', plateNumber: 'STU-258', route: 'Southbound - West Coast Line', departureTime: '01:00 PM', arrivalTime: '05:00 PM', status: 'On Standby', driver: 'Carmen Flores' },
];

export default function AdminSchedulePage() {
  const [statusFilter, setStatusFilter] = useState<'all' | 'Travelling' | 'On Standby'>('all');

  const filteredBuses = statusFilter === 'all'
    ? mockBuses
    : mockBuses.filter((b) => b.status === statusFilter);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-[#1d348a]">
          Schedule
        </h1>

        <div className="flex gap-2">
          <button className="border-2 border-[#1d348a] bg-white text-[#1d348a] px-4 py-2 font-bold uppercase tracking-tight text-xs hover:bg-zinc-100 transition-colors">
            + New Bus
          </button>
          <button className="border-2 border-[#ff6802] bg-[#ff6802] text-white px-4 py-2 font-bold uppercase tracking-tight text-xs hover:bg-opacity-90 transition-opacity">
            Create Schedule
          </button>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="border-2 border-[#1d348a] bg-white p-5">
          <div className="flex items-center gap-3">
            <Bus className="h-6 w-6 text-[#1d348a]" />
            <div>
              <p className="text-xs font-bold uppercase text-zinc-600">Total Buses</p>
              <p className="text-2xl font-black text-[#1d348a]">{mockBuses.length}</p>
            </div>
          </div>
        </div>

        <div className="border-2 border-emerald-600 bg-white p-5">
          <div className="flex items-center gap-3">
            <Bus className="h-6 w-6 text-emerald-600" />
            <div>
              <p className="text-xs font-bold uppercase text-zinc-600">Travelling</p>
              <p className="text-2xl font-black text-emerald-600">{mockBuses.filter(b => b.status === 'Travelling').length}</p>
            </div>
          </div>
        </div>

        <div className="border-2 border-amber-600 bg-white p-5">
          <div className="flex items-center gap-3">
            <Clock className="h-6 w-6 text-amber-600" />
            <div>
              <p className="text-xs font-bold uppercase text-zinc-600">On Standby</p>
              <p className="text-2xl font-black text-amber-600">{mockBuses.filter(b => b.status === 'On Standby').length}</p>
            </div>
          </div>
        </div>

        <div className="border-2 border-zinc-600 bg-white p-5">
          <div className="flex items-center gap-3">
            <Calendar className="h-6 w-6 text-zinc-600" />
            <div>
              <p className="text-xs font-bold uppercase text-zinc-600">Routes Active</p>
              <p className="text-2xl font-black text-zinc-600">4</p>
            </div>
          </div>
        </div>
      </div>

      {/* Buses Table */}
      <div className="border-2 border-[#1d348a] bg-white overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b-2 border-[#1d348a] bg-zinc-50">
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-tight text-zinc-600">Bus Number</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-tight text-zinc-600">Plate Number</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-tight text-zinc-600">Route</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-tight text-zinc-600">Departure</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-tight text-zinc-600">Arrival</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-tight text-zinc-600">Driver</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-tight text-zinc-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredBuses.map((bus) => (
              <tr key={bus.id} className="border-b-2 border-[#1d348a]/10 last:border-0">
                <td className="px-4 py-3 text-sm font-medium text-[#1d348a]">{bus.busNumber}</td>
                <td className="px-4 py-3 text-sm font-mono text-zinc-700">{bus.plateNumber}</td>
                <td className="px-4 py-3 text-sm font-medium text-zinc-700">{bus.route}</td>
                <td className="px-4 py-3 text-sm font-medium text-zinc-700">{bus.departureTime}</td>
                <td className="px-4 py-3 text-sm font-medium text-zinc-700">{bus.arrivalTime}</td>
                <td className="px-4 py-3 text-sm font-medium text-zinc-700">{bus.driver}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-3 py-1 text-xs font-bold uppercase tracking-tight rounded-full border-2 ${
                      bus.status === 'Travelling'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-600'
                        : 'bg-amber-50 text-amber-700 border-amber-600'
                    }`}
                  >
                    {bus.status}
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