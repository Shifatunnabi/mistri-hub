"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Clock, DollarSign, MapPin } from "lucide-react"
import Link from "next/link"

export interface JobPost {
  id: string
  user: {
    name: string
    avatar?: string
  }
  title: string
  description: string
  image?: string
  location: string
  budgetMin?: number
  budgetMax?: number
  category: string
  postedAt: string
  status: string
}

interface JobPostCardProps {
  job: JobPost
  index?: number
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "open":
    case "Open":
      return "bg-green-500 text-white"
    case "assigned":
      return "bg-red-500 text-white"
    case "scheduled":
    case "in_progress":
      return "bg-blue-500 text-white"
    case "pending_review":
      return "bg-yellow-500 text-white"
    case "completed":
      return "bg-gray-500 text-white"
    default:
      return "bg-primary text-primary-foreground"
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case "open":
      return "Open"
    case "assigned":
      return "Booked"
    case "scheduled":
      return "Scheduled"
    case "in_progress":
      return "In Progress"
    case "pending_review":
      return "Pending Review"
    case "completed":
      return "Completed"
    default:
      return status
  }
}

export function JobPostCard({ job, index = 0 }: JobPostCardProps) {
  return (
    <Card
      className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary animate-fade-in-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Job Header */}
      <div className="flex items-start justify-between p-4 pb-3">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10 ring-2 ring-border">
            <AvatarImage src={job.user.avatar || "/placeholder.svg"} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {job.user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-bold text-sm">{job.user.name}</h3>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{job.postedAt}</span>
            </div>
          </div>
        </div>
        <Badge className={getStatusColor(job.status)}>{getStatusLabel(job.status)}</Badge>
      </div>

      {/* Job Content */}
      <div className="px-4 pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-lg font-bold mb-2">{job.title}</h2>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 text-primary shrink-0" />
              <span>{job.location}</span>
            </div>
          </div>
          {job.budgetMin && job.budgetMax && (
            <div className="flex items-center space-x-1 text-sm font-bold text-primary whitespace-nowrap">
              <DollarSign className="h-4 w-4" />
              <span>
                ৳{job.budgetMin} - ৳{job.budgetMax}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Job Image */}
      {job.image && (
        <div className="relative aspect-video overflow-hidden bg-muted">
          <img
            src={job.image}
            alt={job.title}
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          />
        </div>
      )}

      {/* Apply Button */}
      <div className="p-4">
        <Button asChild className="w-full transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
          <Link href={`/jobs/${job.id}`}>View Details & Apply</Link>
        </Button>
      </div>
    </Card>
  )
}
