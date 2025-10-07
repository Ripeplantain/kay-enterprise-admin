"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Route } from "@/lib/types"

interface RouteFormData {
  name: string
  origin: string
  destination: string
  distance_km: number
  estimated_duration_hours: number
  is_active: boolean
}

interface RouteFormProps {
  onSubmit: (data: RouteFormData) => Promise<void>
  onCancel: () => void
  submitting?: boolean
  initialData?: Route | null
  mode?: "create" | "edit"
}

export default function RouteForm({
  onSubmit,
  onCancel,
  submitting = false,
  initialData = null,
  mode = "create"
}: RouteFormProps) {
  const [formData, setFormData] = useState<RouteFormData>({
    name: "",
    origin: "",
    destination: "",
    distance_km: 0,
    estimated_duration_hours: 0,
    is_active: true,
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        origin: initialData.origin,
        destination: initialData.destination,
        distance_km: initialData.distance_km,
        estimated_duration_hours: initialData.estimated_duration_hours,
        is_active: initialData.is_active,
      })
    }
  }, [initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === "create" ? "Create New Route" : "Edit Route"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Route Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                placeholder="e.g., Accra-Kumasi Express"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Origin</label>
              <Input
                value={formData.origin}
                onChange={(e) => setFormData(prev => ({ ...prev, origin: e.target.value }))}
                required
                placeholder="e.g., Accra"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Destination</label>
              <Input
                value={formData.destination}
                onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                required
                placeholder="e.g., Kumasi"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Distance (km)</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.distance_km || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, distance_km: parseFloat(e.target.value) || 0 }))}
                required
                placeholder="e.g., 250.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Estimated Duration (hours)</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.estimated_duration_hours || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, estimated_duration_hours: parseFloat(e.target.value) || 0 }))}
                required
                placeholder="e.g., 4.5"
              />
            </div>
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300"
                />
                Active Route
              </label>
              <p className="text-xs text-gray-500 mt-1 ml-6">
                Active routes are available for booking
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (mode === "create" ? "Creating..." : "Updating...") : (mode === "create" ? "Create Route" : "Update Route")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
