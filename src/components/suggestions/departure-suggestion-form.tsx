"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, MapPin, ArrowRight, Clock, Lightbulb } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Assuming the AI flow `suggestDepartureTimes` is available and correctly imported/called
// For now, we will mock the AI flow interaction.
import { SuggestDepartureTimesInput, SuggestDepartureTimesOutput, suggestDepartureTimes } from "@/ai/flows/suggest-departure-times";

const suggestionFormSchema = z.object({
  origin: z.string().min(1, "Origin is required.").default("Mantalongon"),
  destination: z.string().min(1, "Destination is required.").default("Cebu City"),
});

type SuggestionFormValues = z.infer<typeof suggestionFormSchema>;

export function DepartureSuggestionForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestDepartureTimesOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<SuggestionFormValues>({
    resolver: zodResolver(suggestionFormSchema),
    defaultValues: {
      origin: "Mantalongon",
      destination: "Cebu City",
    },
  });

  async function onSubmit(values: SuggestionFormValues) {
    setIsLoading(true);
    setSuggestions(null);
    setError(null);
    try {
      // const result = await suggestDepartureTimes(values);
      // Mocking the AI call for now:
      await new Promise(resolve => setTimeout(resolve, 1500));
      const result: SuggestDepartureTimesOutput = {
        suggestedDepartureTimes: ["07:00 AM", "10:30 AM", "02:00 PM", "06:00 PM (night travel)"],
        reasoning: "These times are suggested to avoid peak morning (8-9 AM) and afternoon (4-6 PM) rush hours. 07:00 AM allows for early arrival. 10:30 AM is post-morning rush. 02:00 PM is mid-afternoon before evening congestion. 06:00 PM is for those preferring night travel, usually with lighter traffic.",
      };
      setSuggestions(result);
    } catch (e) {
      console.error("Error fetching suggestions:", e);
      setError("Failed to fetch suggestions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl text-primary">Find Optimal Departure Times</CardTitle>
        <CardDescription>
          Enter your origin and destination to get AI-powered suggestions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4 items-end">
              <FormField
                control={form.control}
                name="origin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Origin</FormLabel>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <FormControl>
                        <Input {...field} className="pl-10 bg-input border-border focus:ring-primary" readOnly />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="destination"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Destination</FormLabel>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <FormControl>
                        <Input {...field} className="pl-10 bg-input border-border focus:ring-primary" readOnly />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Getting Suggestions...
                </>
              ) : (
                <>
                  <Lightbulb className="mr-2 h-4 w-4" />
                  Get Suggestions
                </>
              )}
            </Button>
          </form>
        </Form>

        {error && (
          <Alert variant="destructive" className="mt-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {suggestions && (
          <div className="mt-8 space-y-4">
            <h3 className="text-xl font-semibold text-primary-foreground flex items-center">
              <Clock className="h-5 w-5 mr-2 text-primary" /> Suggested Departure Times:
            </h3>
            <ul className="list-disc list-inside pl-4 space-y-1 text-foreground">
              {suggestions.suggestedDepartureTimes.map((time) => (
                <li key={time} className="flex items-center">
                  <ArrowRight className="h-4 w-4 mr-2 text-primary/70" /> {time}
                </li>
              ))}
            </ul>
            <h3 className="text-xl font-semibold text-primary-foreground pt-2 flex items-center">
              <Lightbulb className="h-5 w-5 mr-2 text-primary" /> Reasoning:
            </h3>
            <p className="text-muted-foreground bg-card-foreground/5 p-4 rounded-md border border-border">
              {suggestions.reasoning}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
