import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bus, MapPin, Ticket, ArrowRight, LogIn, UserPlus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <header className="my-12">
        <h1 className="text-5xl font-bold text-primary">BusQ</h1>
        <p className="mt-4 text-xl text-muted-foreground">
          Your Journey, Simplified. Book seats, track buses, and travel smart.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-8 max-w-xl w-full mb-12">
        <FeatureCard
          icon={<Bus className="w-10 h-10 text-primary" />}
          title="View Trips"
          description="Explore available trips from Mantalongon to Cebu City. Filter by bus type and find your perfect ride."
          link="/trips"
          linkText="Browse Trips"
        />
        <FeatureCard
          icon={<MapPin className="w-10 h-10 text-primary" />}
          title="Real-Time Tracking"
          description="Track your bus in real-time on its journey. Know exactly when to expect its arrival."
          link="/tracking"
          linkText="Track a Bus"
        />
      </div>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
  linkText: string;
}

const FeatureCard = React.memo(function FeatureCard({ icon, title, description, link, linkText }: FeatureCardProps) {
  return (
    <Card className="bg-card border-border shadow-xl hover:shadow-primary/30 transition-shadow duration-300 flex flex-col">
      <CardHeader className="items-center">
        {icon}
        <CardTitle className="mt-4 text-2xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-center flex flex-col flex-grow justify-between p-6">
        <CardDescription>{description}</CardDescription>
        <div> {/* Wrapper for the button part */}
          <Link href={link} passHref>
            <Button variant="ghost" className="mt-6 text-primary hover:bg-primary/10 hover:text-primary">
              {linkText} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
});
FeatureCard.displayName = 'FeatureCard';
