"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { X } from "lucide-react"
import { Label } from "../ui/label"

interface RejectionModalProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly onConfirm: (reason: string) => void
  readonly agentName: string
  readonly agentReference: string
  readonly isLoading?: boolean
}

export default function RejectionModal({
  isOpen,
  onClose,
  onConfirm,
  agentName,
  agentReference,
  isLoading = false
}: RejectionModalProps) {
  const [reason, setReason] = useState<string>("")

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (reason.trim().length < 10) {
      alert("Rejection reason must be at least 10 characters")
      return
    }
    onConfirm(reason)
  }

  return (
    <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-red-600">Reject Agent</h3>
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
              <Label className="block text-sm font-medium mb-2">
                Rejection Reason *
              </Label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                minLength={10}
                rows={4}
                className="w-full px-3 py-2 border rounded-md bg-background resize-none"
                placeholder="Please provide a reason for rejecting this agent application (minimum 10 characters)"
              />
              <p className="text-xs text-gray-500 mt-1">
                Examples: &rdquo;Incomplete documentation&rdquo;, &rdquo;Invalid ID number&rdquo;, etc.
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
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700"
              >
                {isLoading ? "Rejecting..." : "Reject Agent"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
