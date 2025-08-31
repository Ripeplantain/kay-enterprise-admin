import { Loader2, LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoaderProps {
  size?: "sm" | "md" | "lg"
  message?: string
  icon?: LucideIcon
  className?: string
}

export function Loader({ 
  size = "md", 
  message = "Loading...", 
  icon: Icon = Loader2,
  className 
}: LoaderProps) {
  const sizeClasses = {
    sm: {
      container: "py-6",
      icon: "w-4 h-4",
      text: "text-sm"
    },
    md: {
      container: "py-12",
      icon: "w-6 h-6", 
      text: "text-base"
    },
    lg: {
      container: "py-16",
      icon: "w-8 h-8",
      text: "text-lg"
    }
  }

  const currentSize = sizeClasses[size]

  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center",
      currentSize.container,
      className
    )}>
      <Icon className={cn("animate-spin text-blue-600 mb-3", currentSize.icon)} />
      <span className={cn("text-gray-600", currentSize.text)}>
        {message}
      </span>
    </div>
  )
}