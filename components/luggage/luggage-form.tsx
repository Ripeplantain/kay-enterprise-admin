"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { LuggageTypeCreateData } from "@/lib/types"

interface LuggageFormProps {
  onSubmit: (data: LuggageTypeCreateData) => Promise<void>
  onCancel: () => void
  submitting?: boolean
}

export default function LuggageForm({ onSubmit, onCancel, submitting = false }: LuggageFormProps) {
  const [formData, setFormData] = useState<LuggageTypeCreateData>({
    name: "",
    max_weight_kg: 0,
    price: 0,
    is_active: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Luggage Type</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                placeholder="e.g., Small Bag"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Max Weight (kg)</label>
              <Input
                type="text"
                value={formData.max_weight_kg}
                onChange={(e) => setFormData(prev => ({ ...prev, max_weight_kg: parseFloat(e.target.value) || 0 }))}
                required
                placeholder="e.g., 10.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Price</label>
              <Input
                type="text"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                required
                placeholder="e.g., 500.00"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create Luggage Type"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
