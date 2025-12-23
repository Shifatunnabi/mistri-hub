"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, DollarSign, Users, Eye } from "lucide-react"
import { ViewApplicantsModal } from "./view-applicants-modal"
import Link from "next/link"

interface PostedJob {
  _id: string
  title: string
  description: string
  category: string
  budget: {
    min: number
    max: number
  }
  location: string
  status: string
  applicationCount: number
  photos: string[]
  createdAt: string
}

interface PostedJobsTabProps {
  jobs: PostedJob[]
  isOwner: boolean
  userRole?: string
}

export function PostedJobsTab({ jobs, isOwner, userRole }: PostedJobsTabProps) {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-500 text-white"
      case "assigned":
      case "scheduled":
      case "in_progress":
        return "bg-blue-500 text-white"
      case "pending_review":
        return "bg-yellow-500 text-white"
      case "completed":
        return "bg-gray-500 text-white"
      default:
        return "bg-gray-300 text-gray-700"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "open":
        return "Open"
      case "assigned":
        return "Assigned"
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

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          {userRole === 'HELPER' ? 'No assigned jobs yet' : 'No jobs posted yet'}
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="w-full">
        {jobs.map((job) => (
          <Card key={job._id} className="overflow-hidden hover:shadow-lg transition-shadow">
            {/* Job Image */}
            {job.photos && job.photos.length > 0 ? (
              <div className="relative aspect-video overflow-hidden bg-muted">
                <img src={job.photos[0]} alt={job.title} className="h-full w-full object-cover" />
              </div>
            ) : (
              <div className="relative aspect-video overflow-hidden bg-muted flex items-center justify-center">
                <p className="text-muted-foreground">No image</p>
              </div>
            )}

            <div className="p-6 space-y-4">
              {/* Title and Status */}
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-lg font-bold line-clamp-2 flex-1">{job.title}</h3>
                <Badge className={getStatusColor(job.status)}>{getStatusLabel(job.status)}</Badge>
              </div>

              {/* Posted Date */}
              <div className="text-sm text-muted-foreground">
                Posted {new Date(job.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </div>

              {/* Number of Applicants */}
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="font-semibold text-primary">{job.applicationCount} {job.applicationCount === 1 ? 'Applicant' : 'Applicants'}</span>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 pt-2">
                <Link href={`/jobs/${job._id}`} className="w-full">
                  <Button variant="outline" className="w-full">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </Link>
                {isOwner && (
                  <Button onClick={() => setSelectedJobId(job._id)} className="w-full" variant="default">
                    <Users className="h-4 w-4 mr-2" />
                    View Applicants ({job.applicationCount})
                  </Button>
                )}
                <Link href={`/jobs/${job._id}/timeline`} className="w-full">
                  <Button 
                    variant={job.status !== 'open' ? "default" : "secondary"}
                    className="w-full" 
                    disabled={job.status === 'open'}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Job Timeline
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* View Applicants Modal */}
      {selectedJobId && (
        <ViewApplicantsModal jobId={selectedJobId} isOpen={!!selectedJobId} onClose={() => setSelectedJobId(null)} />
      )}
    </>
  )
}
