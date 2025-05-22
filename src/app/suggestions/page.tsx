import { DepartureSuggestionForm } from "@/components/suggestions/departure-suggestion-form";
import { MessageSquareQuote } from "lucide-react";

export default function SuggestionsPage() {
  return (
    <div className="space-y-8">
      <header className="text-center">
        <MessageSquareQuote className="mx-auto h-12 w-12 text-primary mb-4" />
        <h1 className="text-4xl font-bold text-primary-foreground">Smart Departure Suggestions</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Let our AI find the best times to travel from Mantalongon to Cebu City, avoiding traffic.
        </p>
      </header>
      
      <DepartureSuggestionForm />
    </div>
  );
}
