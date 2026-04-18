"use client";

import { Download, Info, Ticket, X } from "lucide-react";
import Link from "next/link";
import QRCode from "qrcode";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, Suspense } from "react";
import { CeresBusIcon } from "@/components/ui/ceres-bus-icon";
import { decodeBookingPayload, type CompletedBooking } from "@/lib/booking-flow";

export default function BookingQrPage() {
  return (
    <Suspense fallback={<div>Loading QR...</div>}>
      <BookingQrPageContent />
    </Suspense>
  );
}

function BookingQrPageContent() {
  const searchParams = useSearchParams();
  const rawBooking = searchParams.get("booking");
  const [qrImages, setQrImages] = useState<Record<string, string>>({});

  const booking = useMemo(
    () => decodeBookingPayload<CompletedBooking>(rawBooking),
    [rawBooking],
  );

  useEffect(() => {
    let isCancelled = false;

    const buildQrs = async () => {
      if (!booking) {
        return;
      }

      const generated = await Promise.all(
        booking.qrCodes.map(async (entry) => {
          const payload = JSON.stringify({
            reservationId: booking.reservationId,
            seat: entry.seatNumber,
            token: entry.token,
            route: `${booking.origin} -> ${booking.dropoffPoint}`,
            departureTime: booking.departureTime,
          });

          const dataUrl = await QRCode.toDataURL(payload, {
            margin: 1,
            width: 320,
            color: {
              dark: "#1d348a",
              light: "#ffffff",
            },
          });

          return [entry.seatNumber, dataUrl] as const;
        }),
      );

      if (!isCancelled) {
        setQrImages(Object.fromEntries(generated));
      }
    };

    void buildQrs();

    return () => {
      isCancelled = true;
    };
  }, [booking]);

  const handleDownloadQr = (seatNumber: string) => {
    const image = qrImages[seatNumber];
    if (!image || !booking) {
      return;
    }

    const a = document.createElement("a");
    a.download = `BusQ-QR-${booking.reservationId}-${seatNumber}.png`;
    a.href = image;
    a.click();
  };

  if (!booking || !rawBooking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-center">
        <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-black text-[#1d348a]">QR details not found</h1>
          <p className="mt-3 text-sm font-semibold text-slate-500">Please open your receipt again and view QR codes there.</p>
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

  const receiptHref = `/client/reservations/${booking.reservationId}/receipt?booking=${rawBooking}`;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-[#1d348a] font-sans pb-20">
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6">
        <header className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Link
              href={receiptHref}
              className="text-[#ff6802] w-12 h-12 rounded-full hover:bg-slate-200/50 transition-colors flex items-center justify-center border-2 border-transparent hover:border-[#ff6802]/20"
            >
              <X className="w-6 h-6 stroke-[3]" />
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">QR Codes</h1>
              <p className="text-xs md:text-sm text-slate-500 font-bold">Reservation #{booking.reservationId}</p>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center p-1.5 overflow-hidden">
            <CeresBusIcon isCeresYellow={booking.terminal.includes("North")} />
          </div>
        </header>

        <section className="space-y-4">
          <h2 className="text-lg md:text-2xl font-black">Seat QR Tickets</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {booking.qrCodes.map((entry) => {
              const qrImage = qrImages[entry.seatNumber];

              return (
                <article
                  key={entry.seatNumber}
                  className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-black">Seat {entry.seatNumber}</h3>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black tracking-widest uppercase text-emerald-600 border border-emerald-200">
                      Ready
                    </span>
                  </div>

                  <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 flex items-center justify-center min-h-[170px]">
                    {qrImage ? (
                      <img src={qrImage} alt={`QR code for seat ${entry.seatNumber}`} className="w-44 h-44 rounded-lg bg-white p-2" />
                    ) : (
                      <div className="text-xs font-bold text-slate-400">Generating QR code...</div>
                    )}
                  </div>

                  <p className="mt-3 text-[11px] font-bold text-slate-500">Token: {entry.token}</p>

                  <button
                    type="button"
                    onClick={() => handleDownloadQr(entry.seatNumber)}
                    disabled={!qrImage}
                    className="mt-4 w-full rounded-xl border border-slate-200 px-4 py-2 text-xs font-black uppercase tracking-widest text-[#1d348a] hover:bg-slate-50 disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download QR PNG
                  </button>
                </article>
              );
            })}
          </div>
        </section>

        <section className="bg-blue-50/50 rounded-[1.5rem] p-4 md:p-5 border border-[#1d348a]/10 flex items-start gap-4">
          <div className="text-[#1d348a] mt-0.5 bg-white p-1.5 rounded-lg shadow-sm">
            <Info className="w-5 h-5" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col flex-1">
            <p className="text-xs md:text-sm font-bold text-[#1d348a] leading-snug">Present any one QR at boarding.</p>
            <p className="text-[10px] md:text-xs font-semibold text-slate-500 mt-1">
              Downloaded images can be shown offline to conductors.
            </p>
          </div>
          <div className="text-[#ff6802] mt-1">
            <Ticket className="w-5 h-5" />
          </div>
        </section>
      </main>
    </div>
  );
}
