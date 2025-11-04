"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { X } from "lucide-react"

interface ApprovalModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (commissionRate: number) => void
  agentName: string
  agentReference: string
  isLoading?: boolean
}

export default function ApprovalModal({
  isOpen,
  onClose,
  onConfirm,
  agentName,
  agentReference,
  isLoading = false
}: ApprovalModalProps) {
  const [commissionRate, setCommissionRate] = useState<number>(10)

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onConfirm(commissionRate)
  }

  return (
    <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold">Approve Agent</h3>
              <p className="text-sm text-gray-600 mt-1">
                {agentName} ({agentReference})
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Commission Rate (%)
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={commissionRate}
                onChange={(e) => setCommissionRate(parseFloat(e.target.value) || 0)}
                required
                placeholder="10.00"
              />
              <p className="text-xs text-gray-500 mt-1">
                This agent will earn {commissionRate}% commission on every booking
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Approving..." : "Approve Agent"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
