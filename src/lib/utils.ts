import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import {
  getEstimatedFarePerSeat,
  getPassengerDiscountRate,
  type BusType,
  type PassengerType,
  type Terminal,
  type TerminalDestination,
} from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface TripFareSummaryInput {
  terminal: Terminal
  destination: TerminalDestination
  busType: BusType
  passengerType: PassengerType
  seatCount: number
  fallbackFarePerSeat: number
}

export interface TripFareSummary {
  regularFarePerSeat: number
  finalFarePerSeat: number
  regularFareTotal: number
  discountRate: number
  discountAmount: number
  amountDue: number
  discountApplied: boolean
}

const roundToTwo = (value: number): number => Math.round(value * 100) / 100

export function calculateTripFareSummary(input: TripFareSummaryInput): TripFareSummary {
  const resolvedBaseFare =
    getEstimatedFarePerSeat(input.terminal, input.destination, input.busType) ?? input.fallbackFarePerSeat

  const discountRate = getPassengerDiscountRate(input.passengerType)
  const finalFarePerSeat = roundToTwo(resolvedBaseFare * (1 - discountRate))
  const regularFareTotal = roundToTwo(resolvedBaseFare * input.seatCount)
  const amountDue = roundToTwo(finalFarePerSeat * input.seatCount)
  const discountAmount = roundToTwo(regularFareTotal - amountDue)

  return {
    regularFarePerSeat: resolvedBaseFare,
    finalFarePerSeat,
    regularFareTotal,
    discountRate,
    discountAmount,
    amountDue,
    discountApplied: discountRate > 0,
  }
}
