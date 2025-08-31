import { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
  size?: "sm" | "md" | "lg"
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action, 
  className,
  size = "md" 
}: EmptyStateProps) {
  const sizeClasses = {
    sm: {
      container: "py-8",
      icon: "w-8 h-8",
      title: "text-base",
      description: "text-sm"
    },
    md: {
      container: "py-12", 
      icon: "w-12 h-12",
      title: "text-lg",
      description: "text-base"
    },
    lg: {
      container: "py-16",
      icon: "w-16 h-16", 
      title: "text-xl",
      description: "text-lg"
    }
  }

  const currentSize = sizeClasses[size]

  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center",
      currentSize.container,
      className
    )}>
      <div className="flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
        <Icon className={cn("text-gray-400", currentSize.icon)} />
      </div>
      
      <h3 className={cn("font-semibold text-gray-900 mb-2", currentSize.title)}>
        {title}
      </h3>
      
      {description && (
        <p className={cn("text-gray-500 mb-6 max-w-md", currentSize.description)}>
          {description}
        </p>
      )}
      
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}