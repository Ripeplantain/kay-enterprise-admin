"use client"

import { Badge } from "@/components/ui/badge"
import { Armchair, CheckCircle, XCircle } from "lucide-react"
import { Seat } from "@/lib/types"

interface SeatsGridProps {
  seats: Seat[]
  onSeatClick?: (seat: Seat) => void
  showStats?: boolean
  columns?: number // Number of columns (default: 8)
}

export default function SeatsGrid({
  seats,
  onSeatClick,
  showStats = true,
  columns = 8
}: SeatsGridProps) {
  const availableSeats = seats.filter(s => s.is_available).length
  const bookedSeats = seats.filter(s => s.is_booked).length

  return (
    <div className="space-y-4">
      {/* Stats */}
      {showStats && (
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm">Available: {availableSeats}</span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-600" />
            <span className="text-sm">Booked: {bookedSeats}</span>
          </div>
          <div className="flex items-center gap-2">
            <Armchair className="w-4 h-4 text-gray-600" />
            <span className="text-sm">Total: {seats.length}</span>
          </div>
        </div>
      )}

      {/* Seats Grid */}
      {seats.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No seats available</p>
        </div>
      ) : (
        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`
          }}
        >
          {seats.map((seat) => (
            <button
              key={seat.id}
              onClick={() => onSeatClick?.(seat)}
              disabled={seat.is_booked || !seat.is_available}
              className={`
                flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all
                ${seat.is_booked
                  ? 'bg-red-50 border-red-300 cursor-not-allowed'
                  : seat.is_available
                    ? 'bg-green-50 border-green-300 hover:bg-green-100 cursor-pointer'
                    : 'bg-gray-50 border-gray-300 cursor-not-allowed'
                }
                ${onSeatClick && seat.is_available && !seat.is_booked ? 'hover:scale-105' : ''}
              `}
            >
              <Armchair
                className={`w-6 h-6 mb-1 ${
                  seat.is_booked
                    ? 'text-red-600'
                    : seat.is_available
                      ? 'text-green-600'
                      : 'text-gray-400'
                }`}
              />
              <span className="text-xs font-semibold">{seat.seat_number}</span>
              <Badge
                variant={seat.is_available ? "default" : "destructive"}
                className="mt-1 text-[10px] px-1 py-0"
              >
                {seat.seat_type}
              </Badge>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
