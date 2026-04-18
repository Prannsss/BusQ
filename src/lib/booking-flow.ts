import type { PassengerType, Terminal } from "@/types";

export type EWalletMethod = "GCash" | "Maya" | "MariBank" | "GoTyme";

export interface BookingDraft {
  tripId: string;
  terminal: Terminal;
  origin: string;
  destination: string;
  dropoffPoint: string;
  tripDate: string;
  departureTime: string;
  arrivalTime: string;
  busType: string;
  busLiner: string;
  passengerType: PassengerType;
  selectedSeats: string[];
  fare: {
    regularFarePerSeat: number;
    finalFarePerSeat: number;
    regularFareTotal: number;
    discountRate: number;
    discountAmount: number;
    amountDue: number;
  };
}

export interface SeatQrEntry {
  seatNumber: string;
  token: string;
}

export interface CompletedBooking extends BookingDraft {
  reservationId: string;
  paidAtISO: string;
  paymentMethod: EWalletMethod;
  qrCodes: SeatQrEntry[];
}

export function encodeBookingPayload(payload: BookingDraft | CompletedBooking): string {
  const asJson = JSON.stringify(payload);
  return encodeURIComponent(btoa(asJson));
}

export function decodeBookingPayload<T extends BookingDraft | CompletedBooking>(encoded: string | null): T | null {
  if (!encoded) {
    return null;
  }

  try {
    const json = atob(decodeURIComponent(encoded));
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

function randomToken(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
}

export function createCompletedBooking(draft: BookingDraft, paymentMethod: EWalletMethod): CompletedBooking {
  return {
    ...draft,
    reservationId: randomToken("BQ"),
    paidAtISO: new Date().toISOString(),
    paymentMethod,
    qrCodes: draft.selectedSeats.map((seatNumber) => ({
      seatNumber,
      token: randomToken("QR"),
    })),
  };
}
