import { Check } from "lucide-react"

interface VerifiedBadgeProps {
  isVerified: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

export function VerifiedBadge({ isVerified, size = "md", className = "" }: VerifiedBadgeProps) {
  if (!isVerified) return null

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  }

  const iconSizes = {
    sm: "h-2.5 w-2.5",
    md: "h-3 w-3",
    lg: "h-3.5 w-3.5",
  }

  return (
    <div className={`inline-flex items-center ${className}`}>
      <div className={`${sizeClasses[size]} rounded-full bg-primary flex items-center justify-center`}>
        <Check className={`${iconSizes[size]} text-white stroke-[3]`} />
      </div>
    </div>
  )
}
