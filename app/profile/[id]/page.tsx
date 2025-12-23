"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  User,
  MapPin,
  Star,
  Briefcase,
  CheckCircle,
  Shield,
  Calendar,
  Award,
  ArrowLeft,
} from "lucide-react"
import { VerifiedBadge } from "@/components/verified-badge"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

interface UserProfile {
  _id: string
  name: string
  role: string
  profilePhoto?: string
  address: string
  isVerified: boolean
  createdAt: string
  helperProfile?: {
    skills: string[]
    experience?: string
    hourlyRate?: number
    rating: number
    totalReviews: number
    completedJobs: number
  }
}

interface Job {
  _id: string
  title: string
  description: string
  category: string
  status: string
  budget: {
    min: number
    max: number
  }
  location: string
  photos: string[]
  createdAt: string
}

interface Review {
  _id: string
  jobTitle: string
  rating: number
  comment: string
  reviewer: {
    name: string
    profilePhoto?: string
  }
  createdAt: string
}

export default function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingJobs, setIsLoadingJobs] = useState(false)
  const [isLoadingReviews, setIsLoadingReviews] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [resolvedParams.id])

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/user/public-profile/${resolvedParams.id}`)
      if (response.ok) {
        const data = await response.json()
        setProfile(data.user)
      } else {
        router.push("/")
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error)
      router.push("/")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchJobs = async () => {
    if (!profile) return
    setIsLoadingJobs(true)
    try {
      const response = await fetch(`/api/user/public-profile/${resolvedParams.id}/jobs`)
      if (response.ok) {
        const data = await response.json()
        setJobs(data.jobs)
      }
    } catch (error) {
      console.error("Failed to fetch jobs:", error)
    } finally {
      setIsLoadingJobs(false)
    }
  }

  const fetchReviews = async () => {
    if (!profile?.helperProfile) return
    setIsLoadingReviews(true)
    try {
      const response = await fetch(`/api/reviews?helperId=${resolvedParams.id}`)
      if (response.ok) {
        const data = await response.json()
        setReviews(data.reviews)
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error)
    } finally {
      setIsLoadingReviews(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <Skeleton className="h-10 w-32 mb-8" />
          <Card>
            <CardHeader>
              <div className="flex items-start gap-6">
                <Skeleton className="h-32 w-32 rounded-full" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-8 w-64" />
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-6 w-48" />
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>
      </div>
    )
  }

  if (!profile) return null

  const isHelper = profile.role === "HELPER"
  const memberSince = new Date(profile.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        {/* Profile Header */}
        <Card className="mb-8 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Avatar */}
              <Avatar className="h-32 w-32 ring-4 ring-background">
                <AvatarImage
                  src={profile.profilePhoto || "/placeholder.svg"}
                  alt={profile.name}
                />
                <AvatarFallback className="text-4xl">
                  {profile.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Info */}
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-bold">{profile.name}</h1>
                  {profile.isVerified && <VerifiedBadge isVerified={true} size="lg" />}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant={isHelper ? "default" : "secondary"} className="gap-1">
                    {isHelper ? <Briefcase className="h-3 w-3" /> : <User className="h-3 w-3" />}
                    {isHelper ? "Helper" : "Help Seeker"}
                  </Badge>
                  
                  {isHelper && profile.helperProfile && (
                    <>
                      <Badge variant="outline" className="gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {profile.helperProfile.rating.toFixed(1)} ({profile.helperProfile.totalReviews} reviews)
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <CheckCircle className="h-3 w-3" />
                        {profile.helperProfile.completedJobs} jobs completed
                      </Badge>
                    </>
                  )}
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {profile.address}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Member since {memberSince}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>

          {/* Helper Details */}
          {isHelper && profile.helperProfile && (
            <CardContent className="pt-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Skills */}
                {profile.helperProfile.skills.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary" />
                      Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.helperProfile.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Experience */}
                {profile.helperProfile.experience && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-primary" />
                      Experience
                    </h3>
                    <p className="text-muted-foreground">{profile.helperProfile.experience} years</p>
                  </div>
                )}

                {/* Hourly Rate */}
                {/* {profile.helperProfile.hourlyRate && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Hourly Rate</h3>
                    <p className="text-2xl font-bold text-primary">
                      ৳{profile.helperProfile.hourlyRate}/hr
                    </p>
                  </div>
                )} */}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Tabs */}
        <Tabs defaultValue={isHelper ? "reviews" : "jobs"} className="space-y-6">
          <TabsList className="grid w-full" style={{ gridTemplateColumns: isHelper ? "1fr 1fr" : "1fr" }}>
            {isHelper && (
              <TabsTrigger value="reviews" onClick={() => reviews.length === 0 && fetchReviews()}>
                Reviews ({profile.helperProfile?.totalReviews || 0})
              </TabsTrigger>
            )}
            <TabsTrigger value="jobs" onClick={() => jobs.length === 0 && fetchJobs()}>
              {isHelper ? "Completed Jobs" : "Posted Jobs"}
            </TabsTrigger>
          </TabsList>

          {/* Reviews Tab */}
          {isHelper && (
            <TabsContent value="reviews">
              {isLoadingReviews ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-6">
                        <Skeleton className="h-20 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : reviews.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <Star className="h-16 w-16 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Reviews Yet</h3>
                    <p className="text-sm text-muted-foreground text-center max-w-sm">
                      This helper hasn't received any reviews yet.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <Card key={review._id}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage
                              src={review.reviewer.profilePhoto || "/placeholder.svg"}
                              alt={review.reviewer.name}
                            />
                            <AvatarFallback>
                              {review.reviewer.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold">{review.reviewer.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {review.jobTitle}
                                </p>
                              </div>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-muted-foreground"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-muted-foreground">{review.comment}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          )}

          {/* Jobs Tab */}
          <TabsContent value="jobs">
            {isLoadingJobs ? (
              <div className="grid gap-6 md:grid-cols-2">
                {[...Array(4)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <Skeleton className="h-32 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Briefcase className="h-16 w-16 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Jobs</h3>
                  <p className="text-sm text-muted-foreground text-center max-w-sm">
                    {isHelper
                      ? "This helper hasn't completed any jobs yet."
                      : "This user hasn't posted any jobs yet."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {jobs.map((job) => (
                  <Link key={job._id} href={`/jobs/${job._id}`}>
                    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                      <CardContent className="p-6">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold line-clamp-2">{job.title}</h3>
                            <Badge variant={job.status === "completed" ? "default" : "secondary"}>
                              {job.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {job.description}
                          </p>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{job.category}</span>
                            <span className="font-semibold text-primary">
                              ৳{job.budget.min} - ৳{job.budget.max}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {job.location}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
