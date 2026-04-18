"use client";

import { Download, Info, X } from "lucide-react";
import Link from "next/link";
import QRCode from "qrcode";
import { toPng } from "html-to-image";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState, Suspense } from "react";
import { CeresBusIcon } from "@/components/ui/ceres-bus-icon";
import { decodeBookingPayload, type CompletedBooking } from "@/lib/booking-flow";

export default function ReceiptPage() {
  return (
    <Suspense fallback={<div>Loading receipt...</div>}>
      <ReceiptPageContent />
    </Suspense>
  );
}

function ReceiptPageContent() {
  const searchParams = useSearchParams();
  const rawBooking = searchParams.get("booking");
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isDownloadingReceipt, setIsDownloadingReceipt] = useState(false);
  const [primaryQrImage, setPrimaryQrImage] = useState<string>("");

  const booking = useMemo(
    () => decodeBookingPayload<CompletedBooking>(rawBooking),
    [rawBooking],
  );

  useEffect(() => {
    let cancelled = false;

    const buildPrimaryQr = async () => {
      if (!booking || booking.qrCodes.length === 0) {
        return;
      }

      const primary = booking.qrCodes[0];
      const payload = JSON.stringify({
        reservationId: booking.reservationId,
        seat: primary.seatNumber,
        token: primary.token,
        route: `${booking.origin} -> ${booking.dropoffPoint}`,
        departureTime: booking.departureTime,
      });

      const dataUrl = await QRCode.toDataURL(payload, {
        margin: 1,
        width: 360,
        color: {
          dark: "#1d348a",
          light: "#ffffff",
        },
      });

      if (!cancelled) {
        setPrimaryQrImage(dataUrl);
      }
    };

    void buildPrimaryQr();

    return () => {
      cancelled = true;
    };
  }, [booking]);

  const paidAtLabel = useMemo(() => {
    if (!booking) {
      return "";
    }

    return new Date(booking.paidAtISO).toLocaleString("en-PH", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [booking]);

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

  const handleDownloadReceipt = async () => {
    if (!receiptRef.current || !booking) {
      return;
    }

    setIsDownloadingReceipt(true);
    try {
      const png = await toPng(receiptRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });

      const a = document.createElement("a");
      a.download = `BusQ-Receipt-${booking.reservationId}.png`;
      a.href = png;
      a.click();
    } finally {
      setIsDownloadingReceipt(false);
    }
  };

  if (!booking || !rawBooking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-center">
        <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-black text-[#1d348a]">Receipt not found</h1>
          <p className="mt-3 text-sm font-semibold text-slate-500">
            We could not load your paid booking details. Please complete payment again.
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

  const firstSeat = booking.selectedSeats[0] ?? "-";

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-[#1d348a] font-sans pb-16">
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 md:px-8 py-6 space-y-6">
        <header className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Link
              href="/client/trips"
              className="text-[#ff6802] w-12 h-12 rounded-full hover:bg-slate-200/50 transition-colors flex items-center justify-center border-2 border-transparent hover:border-[#ff6802]/20"
            >
              <X className="w-6 h-6 stroke-[3]" />
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">Receipt</h1>
              <p className="text-xs md:text-sm text-slate-500 font-bold">Reservation #{booking.reservationId}</p>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center p-1.5 overflow-hidden">
            <CeresBusIcon isCeresYellow={booking.terminal.includes("North")} />
          </div>
        </header>

        <div
          ref={receiptRef}
          className="rounded-[3rem] bg-[#1d348a] p-4 md:p-5 shadow-[0_16px_40px_rgba(29,52,138,0.35)]"
        >
          <section className="relative bg-white rounded-[2.8rem] shadow-sm px-6 md:px-8 pt-7 pb-8 overflow-hidden">
            <div className="relative z-10 flex flex-col items-center text-center pb-8">
            <span className="rounded-full bg-emerald-50 px-4 py-2 text-[10px] font-black tracking-widest uppercase text-emerald-600 border border-emerald-200">
              Paid Ticket
            </span>
            <h2 className="mt-3 text-2xl md:text-3xl font-black">{booking.origin} → {booking.dropoffPoint}</h2>
            <p className="mt-1 text-sm font-bold text-slate-500">{booking.busLiner} • {booking.busType}</p>

            <div className="mt-5 rounded-[2rem] border border-slate-200 bg-slate-50 p-4 shadow-inner">
              {primaryQrImage ? (
                <img
                  src={primaryQrImage}
                  alt={`Primary QR for seat ${firstSeat}`}
                  className="h-48 w-48 md:h-56 md:w-56 rounded-xl bg-white p-3"
                />
              ) : (
                <div className="h-48 w-48 md:h-56 md:w-56 rounded-xl bg-white flex items-center justify-center text-xs font-bold text-slate-400">
                  Generating QR code...
                </div>
              )}
              <p className="mt-3 text-xs font-black uppercase tracking-widest text-[#ff6802]">Seat {firstSeat}</p>
            </div>
          </div>

            <div className="relative mt-6 pt-8 -mx-6 md:-mx-8 px-6 md:px-8">
              <div className="absolute left-0 right-0 top-0 border-t-2 border-dashed border-slate-200" />
              <div className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-[#1d348a]" />
              <div className="absolute right-0 top-0 translate-x-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-[#1d348a]" />

              <div className="relative z-10 grid grid-cols-2 gap-3 text-xs md:text-sm font-bold">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <p className="text-slate-400 uppercase tracking-widest text-[10px]">Terminal</p>
                  <p className="mt-1 text-[#1d348a]">{booking.terminal}</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <p className="text-slate-400 uppercase tracking-widest text-[10px]">Travel Date</p>
                  <p className="mt-1 text-[#1d348a]">{travelDateLabel}</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <p className="text-slate-400 uppercase tracking-widest text-[10px]">Departure</p>
                  <p className="mt-1 text-[#1d348a]">{booking.departureTime}</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <p className="text-slate-400 uppercase tracking-widest text-[10px]">Arrival</p>
                  <p className="mt-1 text-[#1d348a]">{booking.arrivalTime}</p>
                </div>
            </div>

              <div className="relative z-10 mt-5 rounded-2xl bg-[#ff6802] text-white p-4">
                <p className="text-[10px] tracking-widest uppercase text-[#1d348a] font-black">Passenger</p>
                <p className="mt-1 text-sm font-extrabold">{booking.passengerType}</p>
                <p className="mt-3 text-[10px] tracking-widest uppercase text-[#1d348a] font-black">Seats</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {booking.selectedSeats.map((seat) => (
                    <span key={seat} className="rounded-lg bg-white text-[#1d348a] px-3 py-1 text-xs font-black">
                      {seat}
                    </span>
                  ))}
                </div>
              </div>

              <div className="relative z-10 mt-5 border-t border-slate-100 pt-5 space-y-2 text-sm font-bold">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Regular Fare Total</span>
                  <span>₱{booking.fare.regularFareTotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Discount</span>
                  <span className="text-green-600">-₱{booking.fare.discountAmount.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Amount Paid via {booking.paymentMethod}</span>
                  <span className="text-[#ff6802]">₱{booking.fare.amountDue.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Paid At</span>
                  <span>{paidAtLabel}</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <button
            type="button"
            onClick={handleDownloadReceipt}
            disabled={isDownloadingReceipt}
            className="w-full rounded-2xl bg-[#1d348a] px-5 py-4 text-sm font-extrabold text-white shadow-sm hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            {isDownloadingReceipt ? "Preparing Receipt PNG..." : "Download Receipt PNG"}
          </button>
        </div>

        <Link
          href="/client/"
          className="w-full rounded-2xl border border-slate-200 px-5 py-4 text-sm font-extrabold text-[#1d348a] hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
        >
          Back to Home
        </Link>

        <section className="bg-blue-50/50 rounded-[1.5rem] p-4 md:p-5 border border-[#1d348a]/10 flex items-start gap-4">
          <div className="text-[#1d348a] mt-0.5 bg-white p-1.5 rounded-lg shadow-sm">
            <Info className="w-5 h-5" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col flex-1">
            <p className="text-xs md:text-sm font-bold text-[#1d348a] leading-snug">Present this ticket QR at boarding.</p>
            <p className="text-[10px] md:text-xs font-semibold text-slate-500 mt-1">Use the QR page if you booked multiple seats and need each code.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
