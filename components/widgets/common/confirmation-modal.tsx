"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, X } from "lucide-react"

interface ConfirmationModalProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly onConfirm: () => void
  readonly title: string
  readonly message: string
  readonly confirmText?: string
  readonly cancelText?: string
  readonly variant?: 'danger' | 'warning' | 'info'
  readonly isLoading?: boolean
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = 'danger',
  isLoading = false
}: ConfirmationModalProps) {
  if (!isOpen) return null

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: 'text-red-600',
          confirmBtn: 'bg-red-600 hover:bg-red-700 text-white',
          border: 'border-red-200'
        }
      case 'warning':
        return {
          icon: 'text-yellow-600',
          confirmBtn: 'bg-yellow-600 hover:bg-yellow-700 text-white',
          border: 'border-yellow-200'
        }
      default:
        return {
          icon: 'text-blue-600',
          confirmBtn: 'bg-blue-600 hover:bg-blue-700 text-white',
          border: 'border-blue-200'
        }
    }
  }

  const styles = getVariantStyles()

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose()
    }
  }

  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm()
    }
  }

  const handleCancel = () => {
    if (!isLoading) {
      onClose()
    }
  }

  return (
    <div
      role="dialog"
      aria-label="Confirmation Modal"
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <Card className={`w-full max-w-md mx-auto ${styles.border}`}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900">
              {title}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              disabled={isLoading}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-start gap-4 mb-6">
            <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center ${styles.icon}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-gray-700 leading-relaxed">
                {message}
              </p>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className="border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              {cancelText}
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isLoading}
              className={styles.confirmBtn}
            >
              {isLoading ? "Processing..." : confirmText}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}