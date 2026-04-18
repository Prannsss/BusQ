'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LogOut,
  BookOpen,
  CalendarDays,
  ChartColumn,
  Gauge,
  MapPinned,
  Settings,
  Ticket,
} from 'lucide-react';

const links = [
  { href: '/admin', label: 'Dashboard', icon: Gauge },
  { href: '/admin/bookings', label: 'Bookings', icon: Ticket },
  { href: '/admin/tracking', label: 'Tracking', icon: MapPinned },
  { href: '/admin/schedule', label: 'Schedule', icon: CalendarDays },
  { href: '/admin/reports', label: 'Reports', icon: ChartColumn },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('busqLoggedInUser');
    }
    router.push('/login');
  };

  return (
    <aside className="w-full md:w-72 md:h-screen flex flex-col border-b-2 md:border-b-0 md:border-r-2 border-[#1d348a] bg-white md:sticky md:top-0">
      <div className="shrink-0 px-4 md:px-6 py-4 md:py-6 border-b-2 border-[#1d348a]">
        <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase text-[#1d348a]">
          BusQ Admin
        </h1>
        <p className="text-sm md:text-base text-zinc-600 font-medium mt-1">
          Fleet, schedule, bookings, and revenue ops
        </p>
      </div>

      <div className="flex flex-col flex-1 overflow-hidden p-3 md:p-4">
        <nav className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto pb-1 md:pb-0">
          {links.map((link) => {
            const isActive = 
              link.href === '/admin' 
                ? pathname === '/admin' 
                : pathname === link.href || pathname.startsWith(`${link.href}/`);
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`shrink-0 flex items-center gap-2 md:gap-3 px-3 py-2 border-2 rounded-none font-bold uppercase tracking-tight transition-colors ${
                  isActive
                    ? 'bg-[#1d348a] text-white border-[#1d348a]'
                    : 'bg-white text-[#1d348a] border-transparent hover:border-[#1d348a] hover:bg-zinc-100'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs md:text-sm">{link.label}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="mt-auto hidden md:block pt-4 border-t-2 border-[#1d348a]/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 md:gap-3 px-3 py-2 border-2 rounded-none font-bold uppercase tracking-tight transition-colors bg-white text-red-600 border-transparent hover:border-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-xs md:text-sm">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
