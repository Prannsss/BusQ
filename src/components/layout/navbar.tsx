
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Bus, LogIn, Map, Ticket, UserPlus, Home, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle, // Added SheetTitle
} from "@/components/ui/sheet";
// import { Separator } from "@/components/ui/separator";

const navLinks = [
  { href: "/", label: "Home", icon: <Home className="h-4 w-4 md:h-4 md:w-4 lg:h-5 lg:w-5" /> },
  { href: "/trips", label: "Trips", icon: <Bus className="h-4 w-4 md:h-4 md:w-4 lg:h-5 lg:w-5" /> },
  { href: "/tracking", label: "Track Bus", icon: <Map className="h-4 w-4 md:h-4 md:w-4 lg:h-5 lg:w-5" /> },
];

const authLinks = [
  { href: "/login", label: "Login", icon: <LogIn className="h-4 w-4 md:h-4 md:w-4 lg:h-5 lg:w-5" /> },
  { href: "/signup", label: "Sign Up", icon: <UserPlus className="h-4 w-4 md:h-4 md:w-4 lg:h-5 lg:w-5" /> },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="bg-card border-b border-border shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" passHref>
            <div className="flex items-center space-x-2 cursor-pointer">
              <Ticket className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-primary-foreground">Bus<span className="text-primary">Q</span></span>
            </div>
          </Link>

          {/* Desktop Navigation */}
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
                  {React.cloneElement(link.icon, { className: "h-4 w-4" })}
                  <span className="ml-2">{link.label}</span>
                </Button>
              </Link>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-2">
            {authLinks.map((link) => (
               <Link key={link.href} href={link.href} passHref>
                <Button
                  variant={link.label === "Sign Up" ? "default" : "outline"}
                  className={cn(
                    "text-sm px-3 py-1.5 md:px-4 md:py-2",
                     link.label === "Sign Up" ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "text-accent-foreground border-accent hover:bg-accent/20",
                    pathname === link.href && "ring-2 ring-primary"
                  )}
                >
                  {React.cloneElement(link.icon, { className: "h-4 w-4" })}
                   <span className="ml-1.5 md:ml-2">{link.label}</span>
                </Button>
              </Link>
            ))}
          </div>
          
          {/* Mobile Menu Button and Sheet */}
          <div className="md:hidden flex items-center">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] bg-card p-0 pt-6 flex flex-col">
                <SheetTitle><span className="sr-only">Main menu</span></SheetTitle> 
                <div className="px-4 mb-6">
                   <Link href="/" passHref onClick={closeMobileMenu}>
                    <div className="flex items-center space-x-2 cursor-pointer">
                      <Ticket className="h-8 w-8 text-primary" />
                      <span className="text-2xl font-bold text-primary-foreground">Bus<span className="text-primary">Q</span></span>
                    </div>
                  </Link>
                </div>
                
                <nav className="flex flex-col space-y-1 px-2 mb-auto">
                  {navLinks.map((link) => (
                    <SheetClose asChild key={`mobile-nav-${link.href}`}>
                      <Link
                        href={link.href}
                        onClick={closeMobileMenu}
                        className={cn(
                          "flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium",
                          "text-muted-foreground hover:text-primary hover:bg-primary/10",
                          pathname === link.href && "text-primary bg-primary/10 font-semibold"
                        )}
                      >
                        {React.cloneElement(link.icon, { className: "h-5 w-5" })}
                        <span>{link.label}</span>
                      </Link>
                    </SheetClose>
                  ))}
                </nav>
                
                {/* <Separator className="my-4 bg-border" /> */}

                <div className="flex flex-col space-y-2 p-4 border-t border-border">
                  {authLinks.map((link) => (
                     <SheetClose asChild key={`mobile-auth-${link.href}`}>
                      <Link
                        href={link.href}
                        onClick={closeMobileMenu}
                        className={cn(
                          "flex items-center justify-center space-x-3 px-3 py-3 rounded-md text-base font-medium text-center",
                           link.label === "Sign Up" 
                             ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                             : "text-accent-foreground border border-accent hover:bg-accent/20",
                           pathname === link.href && "ring-2 ring-offset-2 ring-offset-card ring-primary"
                        )}
                      >
                        {React.cloneElement(link.icon, { className: "h-5 w-5" })}
                        <span>{link.label}</span>
                      </Link>
                    </SheetClose>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
