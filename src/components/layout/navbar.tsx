
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Bus, LogIn, Map, Ticket, UserPlus, Home, Menu, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggleButton } from "@/components/theme/theme-toggle-button";

const navLinks = [
  { href: "/", label: "Home", icon: <Home className="h-4 w-4 md:h-4 md:w-4 lg:h-5 lg:w-5" /> },
  { href: "/trips", label: "Trips", icon: <Bus className="h-4 w-4 md:h-4 md:w-4 lg:h-5 lg:w-5" /> },
  { href: "/tracking", label: "Track Bus", icon: <Map className="h-4 w-4 md:h-4 md:w-4 lg:h-5 lg:w-5" /> },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('busqLoggedInUser');
      setIsLoggedIn(!!user);
    }
  }, [pathname]); 

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('busqLoggedInUser');
    }
    setIsLoggedIn(false);
    closeMobileMenu(); 
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    router.push('/login');
  };

  const DesktopAuthButtons = () => {
    if (isLoggedIn) {
      return (
        <Button
          onClick={handleLogout}
          variant="outline"
          className="text-sm px-3 py-1.5 md:px-4 md:py-2 text-muted-foreground border-accent hover:bg-accent/20 hover:text-accent-foreground"
        >
          <LogOut className="h-4 w-4" />
          <span className="ml-1.5 md:ml-2">Logout</span>
        </Button>
      );
    }
    return (
      <>
        <Link href="/login" passHref>
          <Button
            variant="outline"
            className={cn(
              "text-sm px-3 py-1.5 md:px-4 md:py-2 text-muted-foreground border-accent hover:bg-accent/20 hover:text-accent-foreground",
              pathname === "/login" && "ring-2 ring-primary"
            )}
          >
            <LogIn className="h-4 w-4" />
            <span className="ml-1.5 md:ml-2">Login</span>
          </Button>
        </Link>
        <Link href="/signup" passHref>
          <Button
            variant="default"
            className={cn(
              "text-sm px-3 py-1.5 md:px-4 md:py-2 bg-primary hover:bg-primary/90 text-primary-foreground",
              pathname === "/signup" && "ring-2 ring-primary"
            )}
          >
            <UserPlus className="h-4 w-4" />
            <span className="ml-1.5 md:ml-2">Sign Up</span>
          </Button>
        </Link>
      </>
    );
  };

  const MobileAuthButtons = () => {
    if (isLoggedIn) {
      return (
        <SheetClose asChild>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="flex items-center justify-center space-x-3 px-3 py-3 rounded-md text-base font-medium text-center w-full text-muted-foreground border-accent hover:bg-accent/20 hover:text-accent-foreground"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </Button>
        </SheetClose>
      );
    }
    return (
      <>
        <SheetClose asChild>
          <Link
            href="/login"
            onClick={closeMobileMenu}
            className={cn(
              "flex items-center justify-center space-x-3 px-3 py-3 rounded-md text-base font-medium text-center",
              "text-muted-foreground border border-accent hover:bg-accent/20 hover:text-accent-foreground",
              pathname === "/login" && "ring-2 ring-offset-2 ring-offset-card ring-primary"
            )}
          >
            <LogIn className="h-5 w-5" />
            <span>Login</span>
          </Link>
        </SheetClose>
        <SheetClose asChild>
          <Link
            href="/signup"
            onClick={closeMobileMenu}
            className={cn(
              "flex items-center justify-center space-x-3 px-3 py-3 rounded-md text-base font-medium text-center",
              "bg-primary text-primary-foreground hover:bg-primary/90",
              pathname === "/signup" && "ring-2 ring-offset-2 ring-offset-card ring-primary"
            )}
          >
            <UserPlus className="h-5 w-5" />
            <span>Sign Up</span>
          </Link>
        </SheetClose>
      </>
    );
  };

  return (
    <nav className="bg-card border-b border-border shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" passHref>
            <div className="flex items-center space-x-2 cursor-pointer">
              <Ticket className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-foreground">Bus<span className="text-primary">Q</span></span>
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
                  {React.cloneElement(link.icon, { className: "h-4 w-4" })}
                  <span className="ml-2">{link.label}</span>
                </Button>
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-2">
            <ThemeToggleButton />
            <DesktopAuthButtons />
          </div>
          
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggleButton />
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] bg-card p-0 pt-6 flex flex-col">
                <SheetTitle className="sr-only">Main menu</SheetTitle> 
                <div className="px-4 mb-6">
                   <Link href="/" passHref onClick={closeMobileMenu}>
                    <div className="flex items-center space-x-2 cursor-pointer">
                      <Ticket className="h-8 w-8 text-primary" />
                      <span className="text-2xl font-bold text-foreground">Bus<span className="text-primary">Q</span></span>
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
                
                <div className="flex flex-col space-y-2 p-4 border-t border-border">
                  <MobileAuthButtons />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
