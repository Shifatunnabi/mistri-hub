"use client"

import { useState, useEffect, use } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { PhotoSlider } from "@/components/photo-slider"
import { MapPin, DollarSign, Clock, Lightbulb, Users, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import { VerifiedBadge } from "@/components/verified-badge"

interface Job {
  _id: string
  title: string
  description: string
  category: string
  budget: {
    min: number
    max: number
  }
  location: string
  photos: string[]
  status: string
  applicationCount: number
  createdAt: string
  helpSeeker: {
    _id: string
    name: string
    profilePhoto?: string
  }
  aiAnalysis?: {
    problemAnalysis: string
    steps: Array<{
      order: string
      description: string
    }>
    budget: string
  }
}

export default function JobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const { data: session } = useSession()
  const router = useRouter()
  const [job, setJob] = useState<Job | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isApplying, setIsApplying] = useState(false)
  const [aiGenerating, setAiGenerating] = useState(false)
  const [aiRetryCount, setAiRetryCount] = useState(0)
  const [hasApplied, setHasApplied] = useState(false)
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null)

  useEffect(() => {
    fetchJobDetails()
  }, [resolvedParams.id])

  const fetchJobDetails = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/jobs/${resolvedParams.id}`)
      const data = await response.json()

      if (response.ok) {
        setJob(data.job)
        // Check if AI analysis is missing and trigger generation
        if (!data.job.aiAnalysis) {
          generateAIAnalysis(data.job._id)
        }
        // Check if user has applied
        if (session?.user?.role === "HELPER") {
          checkApplicationStatus(data.job._id)
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

  const checkApplicationStatus = async (jobId: string) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/applications/check`)
      if (response.ok) {
        const data = await response.json()
        if (data.hasApplied) {
          setHasApplied(true)
          setApplicationStatus(data.application.status)
        }
      }
    } catch (error) {
      console.error("Error checking application status:", error)
    }
  }

  const handleApply = async () => {
    console.log("Apply button clicked", { 
      session: session?.user, 
      isVerified: session?.user?.isVerified,
      role: session?.user?.role 
    })
    
    if (!session) {
      toast.error("Please login to apply")
      router.push("/login")
      return
    }

    if (session.user?.role !== "HELPER") {
      toast.error("Only helpers can apply for jobs")
      return
    }

    setIsApplying(true)
    try {
      const response = await fetch(`/api/jobs/${resolvedParams.id}/apply`, {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Application submitted successfully!")
        setHasApplied(true)
        setApplicationStatus("pending")
        // Refresh job details to update application count
        fetchJobDetails()
      } else {
        toast.error(data.error || "Failed to apply")
      }
    } catch (error) {
      console.error("Error applying for job:", error)
      toast.error("An error occurred while applying")
    } finally {
      setIsApplying(false)
    }
  }

  const generateAIAnalysis = async (jobId: string, attempt = 1) => {
    if (attempt > 3) {
      toast.error("Failed to generate AI analysis after 3 attempts")
      return
    }

    try {
      setAiGenerating(true)
      setAiRetryCount(attempt)
      
      const response = await fetch("/api/jobs/ai-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      })

      const data = await response.json()

      if (response.ok && data.aiAnalysis) {
        setJob((prev) => (prev ? { ...prev, aiAnalysis: data.aiAnalysis } : null))
        setAiGenerating(false)
        if (attempt > 1) {
          toast.success("AI analysis generated successfully!")
        }
      } else {
        // Retry if failed
        console.log(`AI generation attempt ${attempt} failed, retrying...`)
        setTimeout(() => generateAIAnalysis(jobId, attempt + 1), 2000)
      }
    } catch (error) {
      console.error("Error generating AI analysis:", error)
      // Retry on error
      setTimeout(() => generateAIAnalysis(jobId, attempt + 1), 2000)
    }
  }

  const getTimeAgo = (date: string) => {
    const now = new Date()
    const posted = new Date(date)
    const diff = Math.floor((now.getTime() - posted.getTime()) / 1000)

    if (diff < 60) return "Just now"
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`
    return posted.toLocaleDateString()
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading job details...</p>
        </div>
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

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto max-w-6xl px-4">
        <Link
          href="/home"
          className="mb-6 inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to feed
        </Link>

        <div className="max-w-4xl mx-auto">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Job Details Card */}
            <Card className="overflow-hidden shadow-xl animate-fade-in-up">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-border bg-muted/30 p-6">
                <Link href={`/profile/${job.helpSeeker._id}`} className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                  <Avatar className="h-14 w-14 ring-2 ring-border">
                    <AvatarImage src={job.helpSeeker.profilePhoto || "/placeholder.svg"} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {job.helpSeeker.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-bold">{job.helpSeeker.name}</h3>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Posted {getTimeAgo(job.createdAt)}</span>
                    </div>
                  </div>
                </Link>
                <Badge className="bg-primary text-primary-foreground">
                  {job.status === "open" ? "Open" : "Closed"}
                </Badge>
              </div>

              {/* Job Photos */}
              {job.photos && job.photos.length > 0 && (
                <div className="relative">
                  <PhotoSlider photos={job.photos} />
                </div>
              )}

              {/* Job Content */}
              <div className="space-y-6 p-6">
                <div>
                  <h1 className="mb-2 text-3xl font-bold">{job.title}</h1>
                  <Badge variant="secondary">{job.category}</Badge>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-bold">Description</h3>
                  <p className="text-muted-foreground leading-relaxed">{job.description}</p>
                </div>

                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center space-x-3">
                    <div className="rounded-full bg-primary/10 p-3">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-bold">{job.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="rounded-full bg-accent/10 p-3">
                      <DollarSign className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Budget</p>
                      <p className="font-bold">
                        ৳{job.budget.min} - ৳{job.budget.max}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="rounded-full bg-blue-500/10 p-3">
                      <Users className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Applicants</p>
                      <p className="font-bold">{job.applicationCount || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Apply Button / Status - Only for helpers */}
                {session?.user?.role === "HELPER" && (
                  <>
                    {job.status === "open" ? (
                      <>
                        {hasApplied ? (
                          <div className="w-full p-4 rounded-lg bg-muted text-center">
                            <p className="font-semibold">
                              Application Status:{" "}
                              <span
                                className={
                                  applicationStatus === "accepted"
                                    ? "text-green-600"
                                    : applicationStatus === "rejected"
                                      ? "text-red-600"
                                      : "text-yellow-600"
                                }
                              >
                                {applicationStatus === "accepted"
                                  ? "Accepted"
                                  : applicationStatus === "rejected"
                                    ? "Rejected"
                                    : "Pending"}
                              </span>
                            </p>
                          </div>
                        ) : (
                          <Button
                            type="button"
                            onClick={handleApply}
                            className="w-full transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                            disabled={isApplying}
                          >
                            {isApplying ? "Applying..." : "Apply for This Job"}
                          </Button>
                        )}
                      </>
                    ) : (
                      <Button
                        type="button"
                        className="w-full"
                        disabled
                      >
                        {job.status === "assigned" 
                          ? "Helper already assigned for this job"
                          : job.status === "completed" 
                          ? "Job Completed" 
                          : "This job is no longer available"}
                      </Button>
                    )}
                  </>
                )}

                {/* Message for non-helpers viewing the job */}
                {(!session || session?.user?.role !== "HELPER") && job.status !== "open" && (
                  <div className="w-full p-4 rounded-lg bg-muted text-center">
                    <p className="font-semibold">
                      {job.status === "assigned" 
                        ? "Helper already assigned for this job"
                        : job.status === "completed" 
                        ? "Job Completed" 
                        : "This job is no longer available"}
                    </p>
                    {job.applicationCount > 0 && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {job.applicationCount} {job.applicationCount === 1 ? "application" : "applications"} received
                      </p>
                    )}
                  </div>
                )}
              </div>
            </Card>

            {/* AI Suggestions */}
            <Card className="overflow-hidden shadow-xl animate-fade-in-up animation-delay-200">
              <div className="border-b border-border bg-accent/5 p-6">
                <div className="flex items-center space-x-3">
                  <div className="rounded-full bg-accent p-3">
                    <Lightbulb className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">AI Assistant</h2>
                    <p className="text-sm text-muted-foreground">Quick DIY solutions you can try</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-6">
                {aiGenerating ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                    <h3 className="font-bold text-lg mb-2">AI Analysis Generating...</h3>
                    <p className="text-sm text-muted-foreground">
                      {aiRetryCount > 1 ? `Attempt ${aiRetryCount} of 3` : "Please wait while we analyze the problem"}
                    </p>
                  </div>
                ) : job.aiAnalysis ? (
                  <>
                    <div className="space-y-2">
                      <h3 className="font-bold">Problem Analysis</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {job.aiAnalysis.problemAnalysis}
                      </p>
                    </div>

                    <div className="space-y-3">
                      {job.aiAnalysis.steps.map((step, index) => (
                        <div key={index} className="flex items-start space-x-3 rounded-lg bg-muted/50 p-4">
                          <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-muted-foreground">{step.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-lg border border-accent/30 bg-accent/5 p-4">
                      <p className="text-sm text-muted-foreground">
                        <strong className="text-foreground">Estimated Cost:</strong> {job.aiAnalysis.budget}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">AI analysis not available</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
