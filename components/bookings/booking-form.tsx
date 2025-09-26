"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { BookingCreateData, Booking } from "@/lib/types"

interface BookingFormProps {
  booking?: Booking | null
  onSubmit: (data: BookingCreateData) => Promise<void>
  onCancel: () => void
  submitting?: boolean
}

export default function BookingForm({ booking, onSubmit, onCancel, submitting = false }: BookingFormProps) {
  const [formData, setFormData] = useState<BookingCreateData>({
    trip_id: booking?.trip_id || "",
    user: booking?.user || "",
    seat_number: booking?.seat_number || "",
    ticket_price: booking ? parseFloat(booking.ticket_price) : 0,
    booking_fee: booking ? parseFloat(booking.booking_fee) : 0,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>{booking ? "Edit Booking" : "Create New Booking"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Trip ID</label>
              <Input
                value={formData.trip_id}
                onChange={(e) => setFormData(prev => ({ ...prev, trip_id: e.target.value }))}
                required
                placeholder="Enter trip ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">User ID</label>
              <Input
                value={formData.user}
                onChange={(e) => setFormData(prev => ({ ...prev, user: e.target.value }))}
                required
                placeholder="Enter user ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Seat Number</label>
              <Input
                value={formData.seat_number}
                onChange={(e) => setFormData(prev => ({ ...prev, seat_number: e.target.value }))}
                required
                placeholder="e.g., A12, B08"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ticket Price (GHS)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.ticket_price}
                onChange={(e) => setFormData(prev => ({ ...prev, ticket_price: parseFloat(e.target.value) || 0 }))}
                required
                min="0"
                placeholder="Enter ticket price"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Booking Fee (GHS)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.booking_fee}
                onChange={(e) => setFormData(prev => ({ ...prev, booking_fee: parseFloat(e.target.value) || 0 }))}
                required
                min="0"
                placeholder="Enter booking fee"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : booking ? "Update Booking" : "Create Booking"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}