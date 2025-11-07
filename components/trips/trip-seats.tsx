"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, CheckCircle, XCircle, Armchair } from "lucide-react"
import { tripService } from "@/services/trips"
import { Seat } from "@/lib/types"
import toast from "react-hot-toast"

interface TripSeatsProps {
  readonly tripId: string
  readonly onClose: () => void
}

export default function TripSeats({ tripId, onClose }: TripSeatsProps) {
  const [seats, setSeats] = useState<Seat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSeats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId])

  const fetchSeats = async () => {
    const loadingToast = toast.loading("Loading seats...")

    try {
      setLoading(true)
      const response = await tripService.getTripSeats(tripId)
      setSeats(response.seats || [])
      toast.success("Seats loaded successfully", { id: loadingToast })
    } catch (error: unknown) {
      console.error("Failed to fetch seats:", error)
      const err = error as { response?: { data?: { message?: string; error?: string } }; message?: string }
      const errorMessage = err?.response?.data?.message ||
                          err?.response?.data?.error ||
                          err?.message ||
                          "Failed to load seats"
      toast.error(errorMessage, { id: loadingToast })
    } finally {
      setLoading(false)
    }
  }

  const availableSeats = seats.filter(s => s.is_available).length
  const bookedSeats = seats.filter(s => s.is_booked).length

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle>Trip Seats - Trip #{tripId}</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          <div className="flex gap-4 mt-4">
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
        </CardHeader>
        <CardContent className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Loading seats...</div>
            </div>
          ) : seats.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No seats found for this trip</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
              {seats.map((seat) => (
                <div
                  key={seat.id}
                  className={`
                    flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all
                    ${seat.is_booked
                      ? 'bg-red-50 border-red-300 cursor-not-allowed'
                      : seat.is_available
                        ? 'bg-green-50 border-green-300 hover:bg-green-100'
                        : 'bg-gray-50 border-gray-300 cursor-not-allowed'
                    }
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
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
