'use client';

import { useMemo, useState } from 'react';
import { Banknote, Ticket, Gauge, Bus, ChevronDown } from 'lucide-react';

type Period = '7d' | '30d' | 'all';

// Mock revenue/occupancy series per day
const dailySeries = [
  { day: 'MON', revenue: 14250, occupancy: 62 },
  { day: 'TUE', revenue: 16800, occupancy: 71 },
  { day: 'WED', revenue: 19200, occupancy: 78 },
  { day: 'THU', revenue: 21450, occupancy: 84 },
  { day: 'FRI', revenue: 25600, occupancy: 92 },
  { day: 'SAT', revenue: 18400, occupancy: 74 },
  { day: 'SUN', revenue: 9700, occupancy: 48 },
];

// Mock trip history
const tripHistory = [
  { id: 'TRP-2041', route: 'Southbound - East Coast Line', date: '2026-06-06', passengers: 42, revenue: 6300, status: 'Completed' },
  { id: 'TRP-2042', route: 'Northbound - Eastern Line', date: '2026-06-06', passengers: 38, revenue: 5700, status: 'Completed' },
  { id: 'TRP-2043', route: 'Southbound - West Coast Line', date: '2026-06-05', passengers: 29, revenue: 4350, status: 'Completed' },
  { id: 'TRP-2044', route: 'Northbound - Western Line', date: '2026-06-05', passengers: 45, revenue: 6750, status: 'Completed' },
  { id: 'TRP-2045', route: 'Southbound - East Coast Line', date: '2026-06-04', passengers: 33, revenue: 4950, status: 'Completed' },
];

const periodMultiplier: Record<Period, number> = {
  '7d': 1,
  '30d': 4.2,
  all: 11.5,
};

export default function AdminReportsPage() {
  const [period, setPeriod] = useState<Period>('7d');

  const stats = useMemo(() => {
    const factor = periodMultiplier[period];
    const weeklyRevenue = dailySeries.reduce((sum, d) => sum + d.revenue, 0);
    const weeklyBookings = 384;
    const avgOccupancy = Math.round(
      dailySeries.reduce((sum, d) => sum + d.occupancy, 0) / dailySeries.length,
    );
    return {
      revenue: Math.round(weeklyRevenue * factor),
      bookings: Math.round(weeklyBookings * factor),
      avgOccupancy,
      trips: Math.round(56 * factor),
    };
  }, [period]);

  const maxRevenue = Math.max(...dailySeries.map((d) => d.revenue));

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-[#1d348a]">
          Reports
        </h1>

        <div className="relative">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as Period)}
            className="appearance-none border-2 border-[#1d348a] bg-white px-4 py-2 pr-10 font-bold uppercase tracking-tight text-xs text-[#1d348a] focus:outline-none focus:bg-zinc-100"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1d348a] pointer-events-none" />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="border-2 border-[#1d348a] bg-white p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-tight font-bold text-zinc-600">Total Revenue</p>
              <p className="text-3xl font-black text-[#1d348a] mt-2">
                ${stats.revenue.toLocaleString('en-US')}
              </p>
            </div>
            <Banknote className="h-8 w-8 text-[#1d348a]" />
          </div>
        </div>

        <div className="border-2 border-[#1d348a] bg-white p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-tight font-bold text-zinc-600">Total Bookings</p>
              <p className="text-3xl font-black text-[#1d348a] mt-2">{stats.bookings.toLocaleString('en-US')}</p>
            </div>
            <Ticket className="h-8 w-8 text-[#1d348a]" />
          </div>
        </div>

        <div className="border-2 border-[#1d348a] bg-white p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-tight font-bold text-zinc-600">Avg Occupancy</p>
              <p className="text-3xl font-black text-[#1d348a] mt-2">{stats.avgOccupancy}%</p>
            </div>
            <Gauge className="h-8 w-8 text-[#1d348a]" />
          </div>
        </div>

        <div className="border-2 border-[#1d348a] bg-white p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-tight font-bold text-zinc-600">Trips Completed</p>
              <p className="text-3xl font-black text-[#1d348a] mt-2">{stats.trips}</p>
            </div>
            <Bus className="h-8 w-8 text-[#1d348a]" />
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="border-2 border-[#1d348a] bg-white">
        <div className="border-b-2 border-[#1d348a] px-5 py-3">
          <h2 className="text-lg font-black uppercase tracking-tighter text-[#1d348a]">Revenue (7 Days)</h2>
        </div>
        <div className="p-5">
          <div className="relative h-64">
            <div className="absolute inset-0 flex items-end justify-between px-2 pb-8">
              {dailySeries.map((item) => (
                <div key={item.day} className="flex flex-col items-center gap-2">
                  <div
                    className="w-10 bg-[#1d348a] rounded-t-sm"
                    style={{ height: `${(item.revenue / maxRevenue) * 200}px` }}
                  />
                  <span className="text-xs font-bold uppercase text-zinc-600">{item.day}</span>
                </div>
              ))}
            </div>
            <div className="absolute bottom-8 left-0 right-0 h-px bg-[#1d348a]" />
          </div>
        </div>
      </div>

      {/* Trip History Table */}
      <div className="border-2 border-[#1d348a] bg-white overflow-x-auto">
        <div className="border-b-2 border-[#1d348a] px-5 py-3">
          <h2 className="text-lg font-black uppercase tracking-tighter text-[#1d348a]">Trip History</h2>
        </div>
        <table className="w-full min-w-[720px]">
          <thead>
            <tr className="border-b-2 border-[#1d348a] bg-zinc-50">
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-tight text-zinc-600">Trip ID</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-tight text-zinc-600">Route</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-tight text-zinc-600">Date</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-tight text-zinc-600">Passengers</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-tight text-zinc-600">Revenue</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-tight text-zinc-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {tripHistory.map((trip) => (
              <tr key={trip.id} className="border-b-2 border-[#1d348a]/10 last:border-0">
                <td className="px-4 py-3 text-sm font-medium text-[#1d348a]">{trip.id}</td>
                <td className="px-4 py-3 text-sm font-medium text-zinc-700">{trip.route}</td>
                <td className="px-4 py-3 text-sm font-medium text-zinc-700">{trip.date}</td>
                <td className="px-4 py-3 text-sm font-medium text-zinc-700">{trip.passengers}</td>
                <td className="px-4 py-3 text-sm font-medium text-zinc-700">${trip.revenue.toLocaleString('en-US')}</td>
                <td className="px-4 py-3">
                  <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-tight rounded-full bg-emerald-50 text-emerald-700 border-2 border-emerald-600">
                    {trip.status}
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
