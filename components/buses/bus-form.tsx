"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { type Bus } from "@/lib/types"

interface BusFormData {
  plate_number: string
  bus_type: string
  total_seats: number
}

interface BusFormProps {
  bus?: Bus | null
  onSubmit: (data: BusFormData) => Promise<void>
  onCancel: () => void
  submitting?: boolean
}

const busTypes = ["vip", "express"]

export default function BusForm({ bus, onSubmit, onCancel, submitting = false }: BusFormProps) {
  const [formData, setFormData] = useState<BusFormData>({
    plate_number: bus?.plate_number || "",
    bus_type: bus?.bus_type || "",
    total_seats: bus?.total_seats || 30,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{bus ? "Edit Bus" : "Create New Bus"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Plate Number</label>
              <Input
                value={formData.plate_number}
                onChange={(e) => setFormData(prev => ({ ...prev, plate_number: e.target.value }))}
                required
                placeholder="e.g., GH-101-24"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Bus Type</label>
              <select
                value={formData.bus_type}
                onChange={(e) => setFormData(prev => ({ ...prev, bus_type: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md bg-background"
                required
              >
                <option value="">Select Type</option>
                {busTypes.map(type => (
                  <option key={type} value={type}>{type.toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Total Seats</label>
              <Input
                type="number"
                value={formData.total_seats}
                onChange={(e) => setFormData(prev => ({ ...prev, total_seats: parseInt(e.target.value) || 30 }))}
                required
                min="15"
                max="60"
                placeholder="Enter total seats"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : bus ? "Update Bus" : "Create Bus"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}