"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Booking } from "@/lib/types"
import { X, User, Calendar, Hash, Tag, Bus, DollarSign } from "lucide-react"

interface BookingDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  booking: Booking | null
}

export default function BookingDetailsModal({ isOpen, onClose, booking }: BookingDetailsModalProps) {
  if (!isOpen || !booking) return null

  const getStatusColor = (status: string): "default" | "destructive" | "outline" | "secondary" => {
    switch (status) {
      case "confirmed": return "default"
      case "pending": return "outline"
      case "cancelled": return "destructive"
      case "completed": return "secondary"
      default: return "outline"
    }
  }

  return (
    <div
      role="dialog"
      aria-label="Booking Details Modal"
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <Card className="w-full max-w-2xl mx-auto" onClick={(e) => e.stopPropagation()}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900">
              Booking Details
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0 grid gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-gray-500" />
              <span className="font-mono text-sm">{booking.booking_reference}</span>
            </div>
            <Badge variant={getStatusColor(booking.status)}>
              {booking.status}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
            <div>
              <h3 className="font-semibold mb-2">Customer</h3>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <span>{booking.agent_name || booking.user_details?.full_name || 'N/A'}</span>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Trip</h3>
              <div className="flex items-center gap-2">
                <Bus className="w-4 h-4 text-gray-500" />
                <span>{booking.trip_details.route_name}</span>
              </div>
              <div className="text-sm text-gray-500 ml-6">
                {booking.trip_details.origin} → {booking.trip_details.destination}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
            <div>
              <h3 className="font-semibold mb-2">Travel Information</h3>
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span>{new Date(booking.trip_details.departure_datetime).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-gray-500" />
                <span>Seat {booking.seat_number}</span>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Payment</h3>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <span className="font-semibold">GHS {booking.total_amount}</span>
              </div>
            </div>
          </div>

          {booking.agent_name && (
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Agent Details</h3>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <span>{booking.agent_name} ({booking.agent_reference})</span>
              </div>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  )
}
