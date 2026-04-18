"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Bus, Compass, User } from "lucide-react";
import { cn } from "@/lib/utils";

const clientNavItems = [
  {
    href: "/client",
    label: "Home",
    icon: Home,
    isActive: (pathname: string) => pathname === "/client",
  },
  {
    href: "/client/trips",
    label: "Trips",
    icon: Bus,
    isActive: (pathname: string) => pathname === "/client/trips" || pathname.startsWith("/client/trips/"),
  },
  {
    href: "/client/tracking",
    label: "Tracking",
    icon: Compass,
    isActive: (pathname: string) => pathname === "/client/tracking",
  },
  {
    href: "/client/profile",
    label: "Profile",
    icon: User,
    isActive: (pathname: string) => pathname === "/client/profile",
  },
];

function isClientExperiencePath(pathname: string) {
  return pathname === "/client" || pathname.startsWith("/client/");
}

export function ClientNavbarPill() {
  const pathname = usePathname();
  const hideOnPage =
    pathname === "/client/trips" ||
    pathname === "/client/payment" ||
    pathname === "/client/tracking" ||
    /\/client\/reservations\/[^/]+\/receipt$/.test(pathname);

  if (!isClientExperiencePath(pathname) || pathname.includes("/seats") || hideOnPage) {
    return null;
  }

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm z-[300] pointer-events-auto">
      <div className="rounded-[2rem] border border-slate-100 bg-white/95 backdrop-blur-xl shadow-[0_10px_40px_rgb(29,52,138,0.15)] px-2 py-2">
        <ul className="grid grid-cols-4 gap-1">
          {clientNavItems.map(({ href, label, icon: Icon, isActive }) => {      
            const active = isActive(pathname);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-[1.5rem] py-3 text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all",
                    active
                      ? "bg-[#1d348a] text-white shadow-md scale-105"
                      : "text-slate-400 hover:bg-blue-50 hover:text-[#1d348a]"
                  )}
                >
                  <Icon className={cn("h-5 w-5 md:h-6 md:w-6 transition-transform", active ? "mb-1 scale-110" : "mb-1")} strokeWidth={active ? 2.5 : 2} />
                  <span className="leading-none">{label}</span>                </Link>              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
