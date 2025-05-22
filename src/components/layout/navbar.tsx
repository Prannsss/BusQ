"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Bus, LogIn, Map, Ticket, UserPlus, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home", icon: <Home className="h-4 w-4" /> },
  { href: "/trips", label: "Trips", icon: <Bus className="h-4 w-4" /> },
  { href: "/tracking", label: "Track Bus", icon: <Map className="h-4 w-4" /> },
  // { href: "/suggestions", label: "Suggestions", icon: <MessageSquareQuote className="h-4 w-4" /> },
];

const authLinks = [
  { href: "/login", label: "Login", icon: <LogIn className="h-4 w-4" /> },
  { href: "/signup", label: "Sign Up", icon: <UserPlus className="h-4 w-4" /> },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-card border-b border-border shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" passHref>
            <div className="flex items-center space-x-2 cursor-pointer">
              <Ticket className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-primary-foreground">Bus<span className="text-primary">Q</span></span>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} passHref>
                <Button
                  variant="ghost"
                  className={cn(
                    "text-muted-foreground hover:text-primary hover:bg-primary/10",
                    pathname === link.href && "text-primary bg-primary/10 font-semibold"
                  )}
                >
                  {link.icon}
                  <span className="ml-2">{link.label}</span>
                </Button>
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-2">
            {authLinks.map((link) => (
               <Link key={link.href} href={link.href} passHref>
                <Button
                  variant={link.label === "Sign Up" ? "default" : "outline"}
                  className={cn(
                    pathname === link.href && "ring-2 ring-primary"
                  )}
                >
                  {link.icon}
                   <span className="ml-2">{link.label}</span>
                </Button>
              </Link>
            ))}
          </div>
          
          {/* Mobile Menu Button (optional, not implemented here) */}
          <div className="md:hidden">
            {/* Hamburger icon could go here */}
          </div>
        </div>
      </div>
    </nav>
  );
}
