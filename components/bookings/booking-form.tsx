"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { BookingCreateData, Booking, Trip, Seat } from "@/lib/types"
import { tripService } from "@/services/trips"
import toast from "react-hot-toast"
import { X } from "lucide-react"

interface BookingFormProps {
  readonly booking?: Booking | null
  readonly onSubmit: (data: BookingCreateData) => Promise<void>
  readonly onCancel: () => void
  readonly submitting?: boolean
  readonly trips?: Trip[]
}

export default function BookingForm({
  booking,
  onSubmit,
  onCancel,
  submitting = false,
  trips: initialTrips = []
}: BookingFormProps) {
  const [trips, setTrips] = useState<Trip[]>(initialTrips)
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)
  const [availableSeats, setAvailableSeats] = useState<Seat[]>([])
  const [loadingSeats, setLoadingSeats] = useState(false)

  const [formData, setFormData] = useState<BookingCreateData>({
    trip_id: 0,
    seat_ids: [],
    pickup_point_id: "",
    drop_point_id: "",
  })

  // Fetch trips if not provided
  useEffect(() => {
    if (initialTrips.length === 0) {
      const fetchTrips = async () => {
        try {
          const response = await tripService.getTrips({ status: 'scheduled' })
          setTrips(response.results)
        } catch (error) {
          console.error("Failed to fetch trips:", error)
          toast.error("Failed to load trips")
        }
      }
      fetchTrips()
    }
  }, [initialTrips])

  // Fetch seats when trip is selected
  useEffect(() => {
    const fetchSeats = async () => {
      if (!formData.trip_id) {
        setAvailableSeats([])
        return
      }

      setLoadingSeats(true)
      try {
        const response = await tripService.getTripSeats(formData.trip_id.toString())
        setAvailableSeats(response.seats.filter(seat => seat.is_available && !seat.is_booked))
      } catch (error) {
        console.error("Failed to fetch seats:", error)
        toast.error("Failed to load seats")
        setAvailableSeats([])
      } finally {
        setLoadingSeats(false)
      }
    }

    fetchSeats()
  }, [formData.trip_id])

  const handleTripChange = (tripId: string) => {
    const trip = trips.find(t => t.id === parseInt(tripId))
    setSelectedTrip(trip || null)
    setFormData(prev => ({
      ...prev,
      trip_id: parseInt(tripId),
      seat_ids: [],
      pickup_point_id: "",
      drop_point_id: ""
    }))
  }

  const handleSeatToggle = (seatId: number) => {
    setFormData(prev => ({
      ...prev,
      seat_ids: prev.seat_ids.includes(seatId)
        ? prev.seat_ids.filter(id => id !== seatId)
        : [...prev.seat_ids, seatId]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.seat_ids.length === 0) {
      toast.error("Please select at least one seat")
      return
    }

    await onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{booking ? "Edit Booking" : "Create New Booking"}</CardTitle>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Trip Selection */}
            <div>
              <label className="block text-sm font-medium mb-1">Select Trip *</label>
              <select
                value={formData.trip_id || ""}
                onChange={(e) => handleTripChange(e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background"
                required
              >
                <option value="">Choose a trip</option>
                {trips.map(trip => (
                  <option key={trip.id} value={trip.id}>
                    {trip.route_name} - {new Date(trip.departure_datetime).toLocaleString()} ({trip.bus_plate})
                  </option>
                ))}
              </select>
            </div>

            {selectedTrip && (
              <>
                {/* Pickup Point */}
                <div>
                  <label className="block text-sm font-medium mb-1">Pickup Point *</label>
                  <select
                    value={formData.pickup_point_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, pickup_point_id: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    required
                  >
                    <option value="">Select pickup point</option>
                    {selectedTrip.pickup_points.map((point, index) => (
                      <option key={index} value={point.id || index.toString()}>
                        {point.name} - {point.time}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Drop Point */}
                <div>
                  <label className="block text-sm font-medium mb-1">Drop Point *</label>
                  <select
                    value={formData.drop_point_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, drop_point_id: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    required
                  >
                    <option value="">Select drop point</option>
                    {selectedTrip.drop_points.map((point, index) => (
                      <option key={index} value={point.id || index.toString()}>
                        {point.name} - {point.time}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Seat Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Select Seats * ({formData.seat_ids.length} selected)
                  </label>
                  {loadingSeats ? (
                    <div className="text-sm text-gray-500 py-4">Loading available seats...</div>
                  ) : availableSeats.length === 0 ? (
                    <div className="text-sm text-gray-500 py-4">No available seats for this trip</div>
                  ) : (
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                      {availableSeats.map((seat) => (
                        <button
                          key={seat.id}
                          type="button"
                          onClick={() => handleSeatToggle(seat.id)}
                          className={`
                            p-3 rounded-lg border-2 transition-all text-center
                            ${formData.seat_ids.includes(seat.id)
                              ? 'bg-blue-500 border-blue-600 text-white'
                              : 'bg-white border-gray-300 hover:border-blue-400'
                            }
                          `}
                        >
                          <div className="text-xs font-semibold">{seat.seat_number}</div>
                          <div className="text-[10px] mt-1">{seat.seat_type}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting || !selectedTrip}>
                {submitting ? "Saving..." : booking ? "Update Booking" : "Create Booking"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
