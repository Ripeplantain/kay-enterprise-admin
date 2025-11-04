"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Trip, Route, Bus, PickupPoint, DropPoint } from "@/lib/types"
import { Plus, Trash2 } from "lucide-react"

interface TripFormData {
  route: number
  bus: number
  departure_datetime: string
  arrival_datetime: string
  price_per_seat: number
  available_seats: number
  status: 'scheduled' | 'boarding' | 'in_transit' | 'cancelled' | 'completed'
  pickup_points: PickupPoint[]
  drop_points: DropPoint[]
}

interface TripFormProps {
  onSubmit: (data: TripFormData) => Promise<void>
  onCancel: () => void
  submitting?: boolean
  initialData?: Trip | null
  mode?: "create" | "edit"
  routes: Route[]
  buses: Bus[]
}

const statusOptions = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'boarding', label: 'Boarding' },
  { value: 'in_transit', label: 'In Transit' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'completed', label: 'Completed' }
]

export default function TripForm({
  onSubmit,
  onCancel,
  submitting = false,
  initialData = null,
  mode = "create",
  routes,
  buses
}: TripFormProps) {
  const [formData, setFormData] = useState<TripFormData>({
    route: 0,
    bus: 0,
    departure_datetime: "",
    arrival_datetime: "",
    price_per_seat: 0,
    available_seats: 0,
    status: "scheduled",
    pickup_points: [{ name: "", time: "" }],
    drop_points: [{ name: "", time: "" }],
  })

  useEffect(() => {
    if (initialData) {
      // Convert datetime strings to format required by datetime-local input (YYYY-MM-DDTHH:MM)
      const formatDateTimeForInput = (datetime: string) => {
        if (!datetime) return ""
        const date = new Date(datetime)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        return `${year}-${month}-${day}T${hours}:${minutes}`
      }

      setFormData({
        route: initialData.route || 0,
        bus: initialData.bus || 0,
        departure_datetime: formatDateTimeForInput(initialData.departure_datetime),
        arrival_datetime: formatDateTimeForInput(initialData.arrival_datetime),
        price_per_seat: typeof initialData.price_per_seat === 'string'
          ? parseFloat(initialData.price_per_seat)
          : initialData.price_per_seat,
        available_seats: initialData.available_seats,
        status: initialData.status,
        pickup_points: initialData.pickup_points.length > 0 ? initialData.pickup_points : [{ name: "", time: "" }],
        drop_points: initialData.drop_points.length > 0 ? initialData.drop_points : [{ name: "", time: "" }],
      })
    }
  }, [initialData])

  // Auto-populate available_seats when bus is selected (only in create mode)
  useEffect(() => {
    if (formData.bus && buses && mode === "create") {
      const selectedBus = buses.find(bus => bus.id === formData.bus)
      if (selectedBus) {
        setFormData(prev => ({
          ...prev,
          available_seats: selectedBus.total_seats
        }))
      }
    }
  }, [formData.bus, buses, mode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Filter out empty pickup/drop points
    const cleanedData = {
      ...formData,
      pickup_points: formData.pickup_points.filter(p => p.name.trim() && p.time.trim()),
      drop_points: formData.drop_points.filter(p => p.name.trim() && p.time.trim()),
    }

    await onSubmit(cleanedData)
  }

  const addPickupPoint = () => {
    setFormData(prev => ({
      ...prev,
      pickup_points: [...prev.pickup_points, { name: "", time: "" }]
    }))
  }

  const removePickupPoint = (index: number) => {
    setFormData(prev => ({
      ...prev,
      pickup_points: prev.pickup_points.filter((_, i) => i !== index)
    }))
  }

  const updatePickupPoint = (index: number, field: 'name' | 'time', value: string) => {
    setFormData(prev => ({
      ...prev,
      pickup_points: prev.pickup_points.map((point, i) =>
        i === index ? { ...point, [field]: value } : point
      )
    }))
  }

  const addDropPoint = () => {
    setFormData(prev => ({
      ...prev,
      drop_points: [...prev.drop_points, { name: "", time: "" }]
    }))
  }

  const removeDropPoint = (index: number) => {
    setFormData(prev => ({
      ...prev,
      drop_points: prev.drop_points.filter((_, i) => i !== index)
    }))
  }

  const updateDropPoint = (index: number, field: 'name' | 'time', value: string) => {
    setFormData(prev => ({
      ...prev,
      drop_points: prev.drop_points.map((point, i) =>
        i === index ? { ...point, [field]: value } : point
      )
    }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === "create" ? "Create New Trip" : "Edit Trip"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Route *</label>
              <select
                value={formData.route || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, route: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border rounded-md bg-background"
                required
              >
                <option value="">Select Route</option>
                {routes?.map(route => (
                  <option key={route.id} value={route.id}>
                    {route.name} ({route.origin} → {route.destination})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Bus *</label>
              <select
                value={formData.bus || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, bus: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border rounded-md bg-background"
                required
              >
                <option value="">Select Bus</option>
                {buses?.map(bus => (
                  <option key={bus.id} value={bus.id}>
                    {bus.plate_number} ({bus.bus_type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Departure Date & Time *</label>
              <Input
                type="datetime-local"
                value={formData.departure_datetime}
                onChange={(e) => setFormData(prev => ({ ...prev, departure_datetime: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Arrival Date & Time *</label>
              <Input
                type="datetime-local"
                value={formData.arrival_datetime}
                onChange={(e) => setFormData(prev => ({ ...prev, arrival_datetime: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Price per Seat *</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.price_per_seat || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, price_per_seat: parseFloat(e.target.value) || 0 }))}
                required
                placeholder="e.g., 50.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Status *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full px-3 py-2 border rounded-md bg-background"
                required
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pickup Points */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium">Pickup Points</label>
              <Button type="button" size="sm" onClick={addPickupPoint} variant="outline">
                <Plus className="w-4 h-4 mr-1" />
                Add Pickup Point
              </Button>
            </div>
            <div className="space-y-2">
              {formData.pickup_points.map((point, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <Input
                    placeholder="Location name"
                    value={point.name}
                    onChange={(e) => updatePickupPoint(index, 'name', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="time"
                    value={point.time}
                    onChange={(e) => updatePickupPoint(index, 'time', e.target.value)}
                    className="w-32"
                  />
                  {formData.pickup_points.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removePickupPoint(index)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Drop Points */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium">Drop Points</label>
              <Button type="button" size="sm" onClick={addDropPoint} variant="outline">
                <Plus className="w-4 h-4 mr-1" />
                Add Drop Point
              </Button>
            </div>
            <div className="space-y-2">
              {formData.drop_points.map((point, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <Input
                    placeholder="Location name"
                    value={point.name}
                    onChange={(e) => updateDropPoint(index, 'name', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="time"
                    value={point.time}
                    onChange={(e) => updateDropPoint(index, 'time', e.target.value)}
                    className="w-32"
                  />
                  {formData.drop_points.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDropPoint(index)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (mode === "create" ? "Creating..." : "Updating...") : (mode === "create" ? "Create Trip" : "Update Trip")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
