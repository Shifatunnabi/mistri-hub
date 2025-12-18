"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { PhotoSlider } from "@/components/photo-slider"
import { VerifiedBadge } from "@/components/verified-badge"
import { MapPin, DollarSign, Clock, Lightbulb, Users, Star, CheckCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"

// Mock data for nearby helpers (will be implemented later)
const nearbyHelpers = [
  {
    id: "1",
    name: "John Smith",
    avatar: "/placeholder.svg?key=helper1",
    rating: 4.8,
    reviews: 45,
    skills: "Plumbing, Repairs",
    distance: "0.5 miles",
    hourlyRate: 40,
    isVerified: true,
  },
  {
    id: "2",
    name: "Maria Garcia",
    avatar: "/placeholder.svg?key=helper2",
    rating: 4.9,
    reviews: 78,
    skills: "Plumbing, Installation",
    distance: "0.8 miles",
    hourlyRate: 45,
    isVerified: true,
  },
  {
    id: "3",
    name: "David Lee",
    avatar: "/placeholder.svg?key=helper3",
    rating: 4.7,
    reviews: 32,
    skills: "General Repairs, Plumbing",
    distance: "1.2 miles",
    hourlyRate: 35,
    isVerified: false,
  },
]

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
  createdAt: string
  helpSeeker: {
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

export default function JobDetailsPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [job, setJob] = useState<Job | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isApplying, setIsApplying] = useState(false)

  useEffect(() => {
    fetchJobDetails()
  }, [params.id])

  const fetchJobDetails = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/jobs/${params.id}`)
      const data = await response.json()

      if (response.ok) {
        setJob(data.job)
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

  const handleApply = () => {
    if (!session) {
      toast.error("Please login to apply")
      router.push("/login")
      return
    }

    if (session.user?.role !== "HELPER") {
      toast.error("Only verified helpers can apply for jobs")
      return
    }

    // Check if helper is verified (will implement this check later)
    setIsApplying(true)
    setTimeout(() => {
      toast.success("Application sent successfully!")
      router.push(`/jobs/${params.id}/timeline`)
      setIsApplying(false)
    }, 1500)
  }

  const handleHireHelper = (helperId: string) => {
    toast.success("Helper hired! Redirecting to job timeline...")
    setTimeout(() => {
      router.push(`/jobs/${params.id}/timeline`)
    }, 1000)
  }

  if (isLoading || !job) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading job details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto max-w-6xl px-4">
        <Link
          href="/job-board"
          className="mb-6 inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to jobs
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Job Details Card */}
            <Card className="overflow-hidden shadow-xl animate-fade-in-up">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-border bg-muted/30 p-6">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-14 w-14 ring-2 ring-border">
                    <AvatarImage src={job.helpSeeker?.profilePhoto || "/placeholder.svg"} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {job.helpSeeker?.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-bold">{job.helpSeeker?.name}</h3>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Posted {getTimeAgo(job.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <Badge className="bg-primary text-primary-foreground capitalize">{job.status}</Badge>
              </div>

              {/* Job Images */}
              {job.photos && job.photos.length > 0 && (
                <div className="p-6 pb-0">
                  <PhotoSlider photos={job.photos} alt={job.title} />
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
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{job.description}</p>
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
                      <p className="text-sm text-muted-foreground">Budget Range</p>
                      <p className="font-bold">৳{job.budget.min} - ৳{job.budget.max}</p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleApply}
                  className="w-full transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                  disabled={isApplying}
                >
                  {isApplying ? "Applying..." : "Apply for This Job"}
                </Button>
              </div>
            </Card>

            {/* AI Assistant */}
            {job.aiAnalysis && (
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
                  <div className="space-y-2">
                    <h3 className="font-bold">Problem Analysis</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{job.aiAnalysis.problemAnalysis}</p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-bold">Steps to Solve</h3>
                    {job.aiAnalysis.steps.map((step, index) => (
                      <div key={index} className="flex items-start space-x-3 rounded-lg bg-muted/50 p-4">
                        <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-sm mb-1">{step.order}</h4>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-lg border border-accent/30 bg-accent/5 p-4">
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">Estimated Cost to Hire Professional:</strong>{" "}
                      {job.aiAnalysis.budget}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {!job.aiAnalysis && (
              <Card className="p-6 text-center">
                <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">AI analysis is being generated...</p>
              </Card>
            )}
          </div>

          {/* Sidebar - Nearby Helpers */}
          <div className="space-y-6">
            <Card className="overflow-hidden shadow-xl animate-fade-in-up animation-delay-300">
              <div className="border-b border-border bg-primary/5 p-6">
                <div className="flex items-center space-x-3">
                  <div className="rounded-full bg-primary p-3">
                    <Users className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Nearby Helpers</h2>
                    <p className="text-sm text-muted-foreground">Available in your area</p>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-border">
                {nearbyHelpers.map((helper) => (
                  <div key={helper.id} className="space-y-4 p-6 transition-colors hover:bg-muted/50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12 ring-2 ring-border">
                          <AvatarImage src={helper.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {helper.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold">{helper.name}</h3>
                            <VerifiedBadge isVerified={helper.isVerified} size="sm" />
                          </div>
                          <div className="flex items-center space-x-1 text-sm">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{helper.rating}</span>
                            <span className="text-muted-foreground">({helper.reviews})</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="whitespace-nowrap">
                        ৳{helper.hourlyRate}/hr
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <CheckCircle className="h-4 w-4" />
                        <span>{helper.skills}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{helper.distance} away</span>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleHireHelper(helper.id)}
                      variant="outline"
                      className="w-full transition-all duration-300 hover:scale-[1.02] hover:bg-primary hover:text-primary-foreground"
                    >
                      Hire Helper
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
