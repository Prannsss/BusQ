"use client";

import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { CeresBusIcon } from "@/components/ui/ceres-bus-icon";
import {
  createCompletedBooking,
  decodeBookingPayload,
  encodeBookingPayload,
  type BookingDraft,
  type EWalletMethod,
} from "@/lib/booking-flow";

const WALLET_OPTIONS: Array<{
  key: EWalletMethod;
  subtitle: string;
  logo: string;
}> = [
  { key: "GCash", subtitle: "Instant confirmation", logo: "/wallets/gcash.svg" },
  { key: "Maya", subtitle: "Fast and secure checkout", logo: "/wallets/maya.svg" },
  { key: "MariBank", subtitle: "Pay using MariBank wallet", logo: "/wallets/maribank.svg" },
  { key: "GoTyme", subtitle: "One-tap wallet payment", logo: "/wallets/gotyme.svg" },
];

export default function BookingSummaryPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<EWalletMethod>("GCash");
  const [isPaying, setIsPaying] = useState(false);

  const booking = useMemo(
    () => decodeBookingPayload<BookingDraft>(searchParams.get("booking")),
    [searchParams],
  );

  const travelDateLabel = useMemo(() => {
    if (!booking) {
      return "";
    }

    const parseLocalDate = (value: string): Date | null => {
      const matched = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (!matched) {
        return null;
      }

      const year = Number(matched[1]);
      const month = Number(matched[2]);
      const day = Number(matched[3]);
      const local = new Date(year, month - 1, day);
      return Number.isNaN(local.getTime()) ? null : local;
    };

    const parsed = parseLocalDate(booking.tripDate) ?? new Date(booking.tripDate);
    if (Number.isNaN(parsed.getTime())) {
      return booking.tripDate;
    }

    return parsed.toLocaleDateString("en-PH", {
      weekday: "long",
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  }, [booking]);

  if (!booking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-center">
        <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-black text-[#1d348a]">Booking details missing</h1>
          <p className="mt-3 text-sm font-semibold text-slate-500">
            Please return to seat selection and continue to payment again.
          </p>
          <Link
            href="/client/trips"
            className="mt-6 inline-flex rounded-xl bg-[#1d348a] px-5 py-3 text-sm font-extrabold text-white"
          >
            Back to Trips
          </Link>
        </div>
      </div>
    );
  }

  const isCeresYellow = booking.terminal.includes("North");

  const handlePayNow = () => {
    setIsPaying(true);
    const completed = createCompletedBooking(booking, paymentMethod);
    const encoded = encodeBookingPayload(completed);
    router.push(`/client/reservations/${completed.reservationId}/receipt?booking=${encoded}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-[#1d348a] font-sans">
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-8 py-6 space-y-6 pb-64 lg:pb-10">
        <header className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Link
              href="/client/trips"
              className="flex items-center justify-center text-[#ff6802] w-12 h-12 rounded-full hover:bg-slate-200/50 transition-colors border-2 border-transparent hover:border-[#ff6802]/20"
            >
              <ArrowLeft className="w-6 h-6 stroke-[3]" />
            </Link>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-[#1d348a]">Payment</h1>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center p-1.5">
            <CeresBusIcon isCeresYellow={isCeresYellow} />
          </div>
        </header>

        <section className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] md:text-xs font-black tracking-widest text-[#ff6802] uppercase">Booking Summary</span>
              <h2 className="mt-1 text-lg md:text-xl font-black leading-tight">
                {booking.origin} <span className="text-slate-300">→</span> {booking.dropoffPoint}
              </h2>
            </div>
            <span className="text-[10px] md:text-xs font-black tracking-widest text-white bg-[#1d348a] px-3 py-1.5 rounded-xl uppercase">
              {booking.busType}
            </span>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 text-sm font-bold">
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <p className="text-slate-400 uppercase text-[10px] tracking-widest">Terminal</p>
              <p className="mt-1 text-[#1d348a]">{booking.terminal}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <p className="text-slate-400 uppercase text-[10px] tracking-widest">Bus Liner</p>
              <p className="mt-1 text-[#1d348a]">{booking.busLiner}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <p className="text-slate-400 uppercase text-[10px] tracking-widest">Departure</p>
              <p className="mt-1 text-[#1d348a]">{booking.departureTime}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <p className="text-slate-400 uppercase text-[10px] tracking-widest">Arrival</p>
              <p className="mt-1 text-[#1d348a]">{booking.arrivalTime}</p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-[#1d348a] text-white p-4">
            <p className="text-[10px] tracking-widest uppercase text-[#ff6802] font-black">Travel Date</p>
            <p className="mt-1 font-extrabold">{travelDateLabel}</p>
            <p className="mt-3 text-[10px] tracking-widest uppercase text-[#ff6802] font-black">Passenger Type</p>
            <p className="mt-1 font-extrabold">{booking.passengerType}</p>
            <p className="mt-3 text-[10px] tracking-widest uppercase text-[#ff6802] font-black">Selected Seats</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {booking.selectedSeats.map((seat) => (
                <span key={seat} className="rounded-lg bg-white text-[#1d348a] px-3 py-1 text-sm font-black">
                  {seat}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
          <h3 className="font-black text-lg md:text-xl text-[#1d348a] mb-6">Fare Details</h3>
          <div className="space-y-4 text-sm md:text-base">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-bold">Regular Fare / Seat</span>
              <span className="font-extrabold text-[#1d348a]">₱{booking.fare.regularFarePerSeat.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-bold">Final Fare / Seat</span>
              <span className="font-extrabold text-[#1d348a]">₱{booking.fare.finalFarePerSeat.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-bold">Regular Fare Total</span>
              <span className="font-extrabold text-[#1d348a]">₱{booking.fare.regularFareTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-bold">Discount</span>
              <span className="font-extrabold text-green-600">-₱{booking.fare.discountAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 flex justify-between items-end">
            <span className="font-black text-slate-400 text-sm md:text-base uppercase tracking-widest">Amount Due</span>
            <span className="font-black text-3xl md:text-4xl text-[#ff6802] leading-none tracking-tight">₱{booking.fare.amountDue.toFixed(2)}</span>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="font-black text-lg md:text-xl text-[#1d348a] ml-2">Pay via E-Wallet</h3>

          {WALLET_OPTIONS.map((wallet) => (
            <button
              type="button"
              key={wallet.key}
              className={`w-full text-left bg-white p-5 rounded-2xl border-2 transition-all flex items-center ${
                paymentMethod === wallet.key
                  ? "border-[#ff6802] shadow-[0_4px_15px_rgb(255,104,2,0.1)]"
                  : "border-slate-100 hover:border-slate-300"
              }`}
              onClick={() => setPaymentMethod(wallet.key)}
            >
              <div className="w-14 h-14 flex items-center justify-center shrink-0">
                <Image src={wallet.logo} alt={`${wallet.key} logo`} width={42} height={42} className="h-10 w-10 object-contain" />
              </div>
              <div className="ml-4 flex-1">
                <div className="font-black text-base md:text-lg text-[#1d348a]">{wallet.key}</div>
                <div className="text-xs md:text-sm font-bold text-slate-400 mt-0.5">{wallet.subtitle}</div>
              </div>
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                  paymentMethod === wallet.key ? "border-[#ff6802]" : "border-slate-300"
                }`}
              >
                {paymentMethod === wallet.key && <div className="w-3 h-3 bg-[#ff6802] rounded-full"></div>}
              </div>
            </button>
          ))}
        </section>

        <div className="fixed lg:static bottom-[5rem] left-0 right-0 p-4 lg:p-0 pb-6 lg:pb-0 z-50 lg:z-auto pointer-events-none lg:pointer-events-auto text-center bg-gradient-to-t lg:bg-none from-slate-50 via-slate-50 to-transparent pt-12 lg:pt-0">
          <div className="max-w-lg md:max-w-2xl lg:max-w-none mx-auto pointer-events-auto">
            <button
              type="button"
              onClick={handlePayNow}
              disabled={isPaying}
              className="w-full bg-[#1d348a] text-white font-extrabold px-6 py-4 md:py-5 rounded-2xl shadow-[0_8px_20px_rgb(29,52,138,0.15)] hover:shadow-[0_8px_30px_rgb(29,52,138,0.3)] hover:-translate-y-0.5 transition-all text-base md:text-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
            >
              {isPaying ? "Processing Payment..." : `Pay with ${paymentMethod}`}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
