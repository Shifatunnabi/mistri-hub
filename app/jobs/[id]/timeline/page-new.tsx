"use client"

import { useState, useEffect, use } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { ArrowLeft, MessageCircle, Star, CheckCircle2, Clock, Loader2, Calendar } from "lucide-react"
import Link from "next/link"
import { ChatWindow } from "@/components/chat-window"
import { toast } from "sonner"
import { VerifiedBadge } from "@/components/verified-badge"
import { useRouter } from "next/navigation"

interface Job {
  _id: string
  title: string
  description: string
  photos: string[]
  budget: {
    min: number
    max: number
  }
  status: string
  helpSeeker: {
    _id: string
    name: string
    profilePhoto?: string
  }
  assignedHelper?: {
    _id: string
    name: string
    profilePhoto?: string
    averageRating: number
    isVerified: boolean
  }
  scheduledDate?: string
  startedAt?: string
  completedAt?: string
  confirmedAt?: string
  createdAt: string
}

export default function JobTimelinePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const { data: session } = useSession()
  const router = useRouter()
  const [job, setJob] = useState<Job | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [scheduledDate, setScheduledDate] = useState("")
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState("")
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [hasReviewed, setHasReviewed] = useState(false)

  useEffect(() => {
    fetchJobDetails()
  }, [resolvedParams.id])

  const fetchJobDetails = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/jobs/${resolvedParams.id}`)
      const data = await response.json()

      if (response.ok) {
        // Check if user has access (job owner or assigned helper)
        const isJobOwner = data.job.helpSeeker._id === session?.user?.id
        const isAssignedHelper = data.job.assignedHelper?._id === session?.user?.id

        if (!isJobOwner && !isAssignedHelper) {
          toast.error("You don't have access to this job timeline")
          router.push("/job-board")
          return
        }

        setJob(data.job)

        // Check if already reviewed
        if (isJobOwner && data.job.status === "completed") {
          checkIfReviewed(data.job._id)
        }
      } else {
        toast.error("Job not found")
        router.push("/job-board")
      }
    } catch (error) {
      console.error("Error fetching job:", error)
      toast.error("Failed to load job details")
    } finally {
      setIsLoading(false)
    }
  }

  const checkIfReviewed = async (jobId: string) => {
    try {
      const response = await fetch(`/api/reviews?jobId=${jobId}`)
      if (response.ok) {
        const data = await response.json()
        setHasReviewed(data.hasReviewed)
      }
    } catch (error) {
      console.error("Error checking review status:", error)
    }
  }

  const handleSchedule = async () => {
    if (!scheduledDate) {
      toast.error("Please select a date and time")
      return
    }

    setIsUpdatingStatus(true)
    try {
      const response = await fetch(`/api/jobs/${resolvedParams.id}/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduledDate }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Job scheduled successfully!")
        setJob(data.job)
      } else {
        toast.error(data.error || "Failed to schedule job")
      }
    } catch (error) {
      console.error("Error scheduling job:", error)
      toast.error("An error occurred")
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleStartWork = async () => {
    setIsUpdatingStatus(true)
    try {
      const response = await fetch(`/api/jobs/${resolvedParams.id}/start`, {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Work started!")
        setJob(data.job)
      } else {
        toast.error(data.error || "Failed to start work")
      }
    } catch (error) {
      console.error("Error starting work:", error)
      toast.error("An error occurred")
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleMarkComplete = async () => {
    setIsUpdatingStatus(true)
    try {
      const response = await fetch(`/api/jobs/${resolvedParams.id}/complete`, {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Job marked as complete. Waiting for seeker confirmation.")
        setJob(data.job)
      } else {
        toast.error(data.error || "Failed to mark as complete")
      }
    } catch (error) {
      console.error("Error marking complete:", error)
      toast.error("An error occurred")
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleConfirmCompletion = async () => {
    setIsUpdatingStatus(true)
    try {
      const response = await fetch(`/api/jobs/${resolvedParams.id}/confirm`, {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Job confirmed as completed!")
        setJob(data.job)
      } else {
        toast.error(data.error || "Failed to confirm completion")
      }
    } catch (error) {
      console.error("Error confirming completion:", error)
      toast.error("An error occurred")
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleSubmitReview = async () => {
    if (rating === 0) {
      toast.error("Please select a rating")
      return
    }

    if (!review.trim()) {
      toast.error("Please write a review")
      return
    }

    setIsSubmittingReview(true)
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: resolvedParams.id,
          rating,
          comment: review,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Review submitted successfully!")
        setHasReviewed(true)
      } else {
        toast.error(data.error || "Failed to submit review")
      }
    } catch (error) {
      console.error("Error submitting review:", error)
      toast.error("An error occurred")
    } finally {
      setIsSubmittingReview(false)
    }
  }

  const getTimeline = () => {
    if (!job) return []

    return [
      {
        status: "Assigned",
        completed: ["assigned", "scheduled", "in_progress", "pending_review", "completed"].includes(job.status),
        date: job.createdAt ? new Date(job.createdAt).toLocaleString() : "N/A",
        active: job.status === "assigned",
      },
      {
        status: "Scheduled",
        completed: ["scheduled", "in_progress", "pending_review", "completed"].includes(job.status),
        date: job.scheduledDate ? new Date(job.scheduledDate).toLocaleString() : "Not yet scheduled",
        active: job.status === "scheduled",
      },
      {
        status: "In Progress",
        completed: ["in_progress", "pending_review", "completed"].includes(job.status),
        date: job.startedAt ? new Date(job.startedAt).toLocaleString() : "Not started",
        active: job.status === "in_progress",
      },
      {
        status: "Pending Review",
        completed: ["pending_review", "completed"].includes(job.status),
        date: job.completedAt ? new Date(job.completedAt).toLocaleString() : "Not completed",
        active: job.status === "pending_review",
      },
      {
        status: "Completed",
        completed: job.status === "completed",
        date: job.confirmedAt ? new Date(job.confirmedAt).toLocaleString() : "Not confirmed",
        active: job.status === "completed",
      },
    ]
  }

  const isJobOwner = job?.helpSeeker._id === session?.user?.id
  const isAssignedHelper = job?.assignedHelper?._id === session?.user?.id

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  if (!job) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Job not found</p>
        </div>
      </div>
    )
  }

  const timeline = getTimeline()

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto max-w-4xl px-4">
        <Link
          href="/job-board"
          className="mb-6 inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to job board
        </Link>

        <div className="space-y-6">
          {/* Job Overview Card */}
          <Card className="overflow-hidden shadow-xl animate-fade-in-up">
            <div className="border-b border-border bg-muted/30 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="mb-2 text-2xl font-bold">{job.title}</h1>
                  <Badge className="bg-accent text-accent-foreground">{job.status.replace("_", " ").toUpperCase()}</Badge>
                </div>
                {job.assignedHelper && (
                  <Button onClick={() => setIsChatOpen(true)} className="transition-all duration-300 hover:scale-105">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Chat
                  </Button>
                )}
              </div>
            </div>

            {job.photos && job.photos.length > 0 && (
              <div className="relative aspect-video overflow-hidden bg-muted">
                <img src={job.photos[0]} alt={job.title} className="h-full w-full object-cover" />
              </div>
            )}

            <div className="p-6">
              <p className="mb-6 text-muted-foreground leading-relaxed">{job.description}</p>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="font-bold">Help Seeker</h3>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12 ring-2 ring-border">
                      <AvatarImage src={job.helpSeeker.profilePhoto || "/placeholder.svg"} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {job.helpSeeker.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold">{job.helpSeeker.name}</p>
                      <p className="text-sm text-muted-foreground">Posted this job</p>
                    </div>
                  </div>
                </div>

                {job.assignedHelper && (
                  <div className="space-y-4">
                    <h3 className="font-bold">Helper</h3>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12 ring-2 ring-border">
                        <AvatarImage src={job.assignedHelper.profilePhoto || "/placeholder.svg"} />
                        <AvatarFallback className="bg-accent text-accent-foreground">
                          {job.assignedHelper.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold">{job.assignedHelper.name}</p>
                          <VerifiedBadge isVerified={job.assignedHelper.isVerified} size="sm" />
                        </div>
                        <div className="flex items-center space-x-1 text-sm">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{job.assignedHelper.averageRating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Timeline Card */}
          <Card className="overflow-hidden shadow-xl animate-fade-in-up animation-delay-200">
            <div className="border-b border-border bg-primary/5 p-6">
              <h2 className="text-xl font-bold">Job Timeline</h2>
              <p className="text-sm text-muted-foreground">Track the progress of your job</p>
            </div>

            <div className="p-8">
              <div className="relative space-y-8">
                {timeline.map((step, index) => (
                  <div key={index} className="relative flex items-start space-x-4">
                    {/* Timeline Line */}
                    {index !== timeline.length - 1 && (
                      <div
                        className={`absolute left-6 top-14 h-full w-0.5 transition-all duration-500 ${
                          step.completed ? "bg-primary" : "bg-border"
                        }`}
                      />
                    )}

                    {/* Timeline Icon */}
                    <div
                      className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-all duration-500 ${
                        step.completed
                          ? "bg-primary text-primary-foreground scale-100"
                          : step.active
                            ? "bg-accent text-accent-foreground animate-pulse"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {step.completed ? (
                        <CheckCircle2 className="h-6 w-6" />
                      ) : step.active ? (
                        <Clock className="h-6 w-6" />
                      ) : (
                        <div className="h-3 w-3 rounded-full bg-current" />
                      )}
                    </div>

                    {/* Timeline Content */}
                    <div className="flex-1 pb-8">
                      <div
                        className={`rounded-lg p-4 transition-all duration-300 ${
                          step.completed
                            ? "bg-primary/5 border border-primary/20"
                            : step.active
                              ? "bg-accent/5 border border-accent/20"
                              : "bg-muted/50 border border-border"
                        }`}
                      >
                        <h3
                          className={`font-bold ${
                            step.completed
                              ? "text-primary"
                              : step.active
                                ? "text-accent"
                                : "text-muted-foreground"
                          }`}
                        >
                          {step.status}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">{step.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="mt-8 space-y-4">
                {/* Helper Actions */}
                {isAssignedHelper && job.status === "assigned" && (
                  <div className="space-y-4 p-4 border rounded-lg bg-accent/5">
                    <h4 className="font-bold">Set Schedule</h4>
                    <Input
                      type="datetime-local"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full"
                    />
                    <Button
                      onClick={handleSchedule}
                      disabled={isUpdatingStatus}
                      className="w-full transition-all duration-300 hover:scale-[1.02]"
                    >
                      {isUpdatingStatus ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Scheduling...
                        </>
                      ) : (
                        <>
                          <Calendar className="mr-2 h-4 w-4" />
                          Set Schedule
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {isAssignedHelper && job.status === "scheduled" && (
                  <Button
                    onClick={handleStartWork}
                    disabled={isUpdatingStatus}
                    className="w-full transition-all duration-300 hover:scale-[1.02]"
                  >
                    {isUpdatingStatus ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Starting...
                      </>
                    ) : (
                      "Start Work"
                    )}
                  </Button>
                )}

                {isAssignedHelper && job.status === "in_progress" && (
                  <Button
                    onClick={handleMarkComplete}
                    disabled={isUpdatingStatus}
                    className="w-full transition-all duration-300 hover:scale-[1.02]"
                  >
                    {isUpdatingStatus ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Marking...
                      </>
                    ) : (
                      "Mark as Complete"
                    )}
                  </Button>
                )}

                {/* Seeker Actions */}
                {isJobOwner && job.status === "pending_review" && (
                  <Button
                    onClick={handleConfirmCompletion}
                    disabled={isUpdatingStatus}
                    className="w-full transition-all duration-300 hover:scale-[1.02] bg-green-600 hover:bg-green-700"
                  >
                    {isUpdatingStatus ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Confirming...
                      </>
                    ) : (
                      "Confirm Completion"
                    )}
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Review Card */}
          {isJobOwner && job.status === "completed" && !hasReviewed && (
            <Card className="overflow-hidden shadow-xl animate-fade-in-up animation-delay-300">
              <div className="border-b border-border bg-accent/5 p-6">
                <h2 className="text-xl font-bold">Rate Your Experience</h2>
                <p className="text-sm text-muted-foreground">Help others by sharing your feedback</p>
              </div>

              <div className="space-y-6 p-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold">Rating</label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className="transition-all duration-200 hover:scale-110"
                      >
                        <Star
                          className={`h-10 w-10 ${
                            star <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="review" className="text-sm font-bold">
                    Review
                  </label>
                  <Textarea
                    id="review"
                    placeholder="Share your experience working with this helper..."
                    className="min-h-[120px]"
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                  />
                </div>

                <Button
                  onClick={handleSubmitReview}
                  disabled={isSubmittingReview}
                  className="w-full transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                >
                  {isSubmittingReview ? "Submitting..." : "Submit Review"}
                </Button>
              </div>
            </Card>
          )}

          {hasReviewed && (
            <Card className="p-6 text-center bg-green-50 border-green-200">
              <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-2" />
              <p className="font-semibold text-green-800">Thank you for your review!</p>
            </Card>
          )}
        </div>
      </div>

      {/* Chat Window */}
      {job.assignedHelper && session?.user?.id && (
        <ChatWindow 
          isOpen={isChatOpen} 
          onClose={() => setIsChatOpen(false)} 
          jobId={job._id}
          currentUserId={session.user.id}
          recipient={job.assignedHelper} 
        />
      )}
    </div>
  )
}
