"use client";

import { SlidersHorizontal } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  TERMINALS,
  busOperationalStatusLabels,
  busLinerLabels,
  busTypeLabels,
  getBusLinersByTerminal,
  type FilterableBusLiner,
  type FilterableBusOperationalStatus,
  type FilterableBusType,
  type Terminal,
} from "@/types";
import { useIsMobile } from "@/hooks/use-mobile";

export interface TripsFilterValues {
  busType: FilterableBusType;
  busLiner: FilterableBusLiner;
  status: FilterableBusOperationalStatus;
}

interface TripsFilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  terminal: Terminal;
  values: TripsFilterValues;
  onValuesChange: (values: TripsFilterValues) => void;
}

export function TripsFilterSheet({
  open,
  onOpenChange,
  terminal,
  values,
  onValuesChange,
}: TripsFilterSheetProps) {
  const isMobile = useIsMobile();
  const terminalLiners = getBusLinersByTerminal(terminal);

  const handleBusTypeChange = (nextBusType: string) => {
    onValuesChange({
      ...values,
      busType: nextBusType as FilterableBusType,
    });
  };

  const handleBusLinerChange = (nextBusLiner: string) => {
    onValuesChange({
      ...values,
      busLiner: nextBusLiner as FilterableBusLiner,
    });
  };

  const handleStatusChange = (nextStatus: string) => {
    onValuesChange({
      ...values,
      status: nextStatus as FilterableBusOperationalStatus,
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={
          isMobile
            ? "rounded-t-[2rem] border-t-2 border-slate-100 bg-white px-6 pb-10 pt-8"
            : "h-full w-full max-w-md border-l-2 border-slate-100 bg-white px-6 pb-10 pt-8"
        }
      >
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-[#1d348a]">
            <SlidersHorizontal className="h-5 w-5 text-[#ff6802]" />
            Trips Filters
          </SheetTitle>
          <SheetDescription>
            Showing liners for {terminal === TERMINALS.NORTH ? "North" : "South"} terminal.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-8 space-y-5">
          <div className="space-y-2">
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Bus Type</p>
            <Select value={values.busType} onValueChange={handleBusTypeChange}>
              <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50 font-semibold text-[#1d348a]">
                <SelectValue placeholder="Select bus type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{busTypeLabels.all}</SelectItem>
                <SelectItem value="Traditional">{busTypeLabels.Traditional}</SelectItem>
                <SelectItem value="Airconditioned">{busTypeLabels.Airconditioned}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Bus Liner</p>
            <Select value={values.busLiner} onValueChange={handleBusLinerChange}>
              <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50 font-semibold text-[#1d348a]">
                <SelectValue placeholder="Select bus liner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{busLinerLabels.all}</SelectItem>
                {terminalLiners.map((liner) => (
                  <SelectItem key={liner} value={liner}>
                    {busLinerLabels[liner]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Status</p>
            <Select value={values.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50 font-semibold text-[#1d348a]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{busOperationalStatusLabels.all}</SelectItem>
                <SelectItem value="On Standby">{busOperationalStatusLabels["On Standby"]}</SelectItem>
                <SelectItem value="Travelling">{busOperationalStatusLabels.Travelling}</SelectItem>
                <SelectItem value="Arrived">{busOperationalStatusLabels.Arrived}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <button
            type="button"
            onClick={() => onValuesChange({ busType: "all", busLiner: "all", status: "all" })}
            className="mt-2 w-full rounded-xl border border-slate-200 py-3 text-sm font-black uppercase tracking-widest text-slate-500 transition-colors hover:border-[#ff6802]/30 hover:text-[#ff6802]"
          >
            Reset Filters
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
