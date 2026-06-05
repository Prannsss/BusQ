'use client';

import { Banknote, Bus, Calendar, Plus, FileText } from 'lucide-react';

// Mock data
const mockStats = {
  revenue: 125450.75,
  bookingsToday: 84,
  pendingConfirmation: 4,
  dispatchedBuses: 12,
  totalFleet: 15,
  onStandby: 3,
};

// Mock recent bookings data
type RecentBooking = {
  id: string;
  route: string;
  time: string;
  status: 'confirmed' | 'pending' | 'completed';
};

const mockRecentBookings: RecentBooking[] = [
  { id: 'BK001', route: 'Route 101 → Downtown', time: '08:30 AM', status: 'confirmed' },
  { id: 'BK002', route: 'Route 202 → Airport', time: '09:15 AM', status: 'pending' },
  { id: 'BK003', route: 'Route 101 → Downtown', time: '10:00 AM', status: 'completed' },
  { id: 'BK004', route: 'Route 303 → Mall', time: '10:45 AM', status: 'confirmed' },
  { id: 'BK005', route: 'Route 202 → Airport', time: '11:30 AM', status: 'confirmed' },
];

// Mock booking trends data
const bookingTrends = [
  { day: 'MON', value: 45 },
  { day: 'TUE', value: 52 },
  { day: 'WED', value: 68 },
  { day: 'THU', value: 75 },
  { day: 'FRI', value: 90 },
  { day: 'SAT', value: 62 },
  { day: 'SUN', value: 38 },
];

export default function AdminHomePage() {
  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="border-2 border-[#1d348a] bg-white p-6 md:p-8">
        <p className="text-xs uppercase tracking-tight font-bold text-zinc-600">Admin Panel</p>
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-[#1d348a] mt-1">
          Dashboard
        </h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="border-2 border-[#1d348a] bg-white p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-tight font-bold text-zinc-600">Total Revenue</p>
              <p className="text-3xl font-black text-[#1d348a] mt-2">
                ${mockStats.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs font-medium text-green-600 mt-1">+12.5% this week</p>
            </div>
            <Banknote className="h-8 w-8 text-[#1d348a]" />
          </div>
        </div>

        <div className="border-2 border-[#1d348a] bg-white p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-tight font-bold text-zinc-600">Bookings Today</p>
              <p className="text-3xl font-black text-[#1d348a] mt-2">{mockStats.bookingsToday}</p>
              <p className="text-xs font-medium text-zinc-600 mt-1">{mockStats.pendingConfirmation} pending confirmation</p>
            </div>
            <Calendar className="h-8 w-8 text-[#1d348a]" />
          </div>
        </div>

        <div className="border-2 border-[#1d348a] bg-white p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-tight font-bold text-zinc-600">Dispatched Buses</p>
              <p className="text-3xl font-black text-[#1d348a] mt-2">{mockStats.dispatchedBuses}</p>
              <p className="text-xs font-medium text-zinc-600 mt-1">Out of {mockStats.totalFleet} total fleet</p>
            </div>
            <Bus className="h-8 w-8 text-[#1d348a]" />
          </div>
        </div>

        <div className="border-2 border-[#1d348a] bg-white p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-tight font-bold text-zinc-600">On Standby</p>
              <p className="text-3xl font-black text-[#1d348a] mt-2">{mockStats.onStandby}</p>
              <p className="text-xs font-medium text-[#ff6802] mt-1">Available for dispatch</p>
            </div>
            <Calendar className="h-8 w-8 text-[#ff6802]" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="border-2 border-[#1d348a] bg-[#1d348a] text-white py-4 font-bold uppercase tracking-tight text-lg hover:bg-opacity-90 transition-opacity">
          Bookings
        </button>
        <button className="border-2 border-[#ff6802] bg-[#ff6802] text-white py-4 font-bold uppercase tracking-tight text-lg hover:bg-opacity-90 transition-opacity">
          Dispatch Bus
        </button>
        <button className="border-2 border-[#1d348a] bg-white text-[#1d348a] py-4 font-bold uppercase tracking-tight text-lg hover:bg-zinc-100 transition-colors">
          View Reports
        </button>
      </div>

      {/* Main Content Area - Two Columns */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Bookings Table */}
        <div className="border-2 border-[#1d348a] bg-white">
          <div className="border-b-2 border-[#1d348a] px-5 py-3">
            <h2 className="text-lg font-black uppercase tracking-tighter text-[#1d348a]">Recent Bookings</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-[#1d348a] bg-zinc-50">
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-tight text-zinc-600">ID</th>
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-tight text-zinc-600">Route</th>
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-tight text-zinc-600">Time</th>
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-tight text-zinc-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {mockRecentBookings.map((booking) => (
                  <tr key={booking.id} className="border-b-2 border-[#1d348a]/10 last:border-0">
                    <td className="px-5 py-3 text-sm font-medium text-[#1d348a]">{booking.id}</td>
                    <td className="px-5 py-3 text-sm font-medium text-zinc-700">{booking.route}</td>
                    <td className="px-5 py-3 text-sm font-medium text-zinc-700">{booking.time}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-block px-3 py-1 text-xs font-bold uppercase tracking-tight rounded-full ${
                          booking.status === 'confirmed'
                            ? 'bg-green-100 text-green-700 border-2 border-green-600'
                            : booking.status === 'pending'
                            ? 'bg-orange-100 text-orange-700 border-2 border-orange-600'
                            : 'bg-zinc-100 text-zinc-700 border-2 border-zinc-600'
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Booking Trends Chart */}
        <div className="border-2 border-[#1d348a] bg-white">
          <div className="border-b-2 border-[#1d348a] px-5 py-3">
            <h2 className="text-lg font-black uppercase tracking-tighter text-[#1d348a]">Booking Trends (7 Days)</h2>
          </div>
          <div className="p-5">
            <div className="relative h-64">
              {/* Chart Container */}
              <div className="absolute inset-0 flex items-end justify-between px-2 pb-8">
                {bookingTrends.map((item) => (
                  <div key={item.day} className="flex flex-col items-center gap-2">
                    <div
                      className="w-10 bg-[#1d348a] rounded-t-sm"
                      style={{ height: `${(item.value / 100) * 180}px` }}
                    />
                    <span className="text-xs font-bold uppercase text-zinc-600">{item.day}</span>
                  </div>
                ))}
              </div>

              {/* Y-axis labels */}
              <div className="absolute top-0 left-0 w-8 flex flex-col justify-between h-full text-right pr-2">
                <span className="text-xs font-bold text-zinc-600">100</span>
                <span className="text-xs font-bold text-zinc-600">75</span>
                <span className="text-xs font-bold text-zinc-600">50</span>
                <span className="text-xs font-bold text-zinc-600">25</span>
                <span className="text-xs font-bold text-zinc-600">0</span>
              </div>

              {/* X-axis line */}
              <div className="absolute bottom-8 left-0 right-0 h-px bg-[#1d348a]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}