"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MapPin, DollarSign, Clock, Lightbulb, Users, Star, CheckCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"

// Mock data for job details
const mockJob = {
  id: "1",
  user: {
    name: "Sarah Johnson",
    avatar: "/placeholder.svg?key=user1",
  },
  title: "Need plumber for leaking pipe",
  description:
    "My kitchen sink has been leaking for 2 days. The water is dripping from under the sink. I think it might be a loose connection or a damaged pipe. Need urgent help to fix it before it causes more damage. The sink is in the kitchen and easily accessible.",
  image: "/placeholder.svg?key=plumb1",
  location: "Downtown, Main Street",
  budget: 50,
  category: "Plumbing",
  postedAt: "2 hours ago",
  status: "Open",
}

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
  },
]

export default function JobDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isApplying, setIsApplying] = useState(false)

  const handleApply = () => {
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

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Job Details Card */}
            <Card className="overflow-hidden shadow-xl animate-fade-in-up">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-border bg-muted/30 p-6">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-14 w-14 ring-2 ring-border">
                    <AvatarImage src={mockJob.user.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {mockJob.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-bold">{mockJob.user.name}</h3>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Posted {mockJob.postedAt}</span>
                    </div>
                  </div>
                </div>
                <Badge className="bg-primary text-primary-foreground">{mockJob.status}</Badge>
              </div>

              {/* Job Image */}
              {mockJob.image && (
                <div className="relative aspect-video overflow-hidden bg-muted">
                  <img
                    src={mockJob.image || "/placeholder.svg"}
                    alt={mockJob.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              {/* Job Content */}
              <div className="space-y-6 p-6">
                <div>
                  <h1 className="mb-2 text-3xl font-bold">{mockJob.title}</h1>
                  <Badge variant="secondary">{mockJob.category}</Badge>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-bold">Description</h3>
                  <p className="text-muted-foreground leading-relaxed">{mockJob.description}</p>
                </div>

                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center space-x-3">
                    <div className="rounded-full bg-primary/10 p-3">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-bold">{mockJob.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="rounded-full bg-accent/10 p-3">
                      <DollarSign className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Budget</p>
                      <p className="font-bold">${mockJob.budget}</p>
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
                <div className="space-y-2">
                  <h3 className="font-bold">Problem Analysis</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Based on your description, the leak under your kitchen sink is likely caused by a loose connection
                    or worn-out washer. Here are some steps you can try before hiring a helper:
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start space-x-3 rounded-lg bg-muted/50 p-4">
                    <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      1
                    </div>
                    <div>
                      <h4 className="font-bold">Turn off the water supply</h4>
                      <p className="text-sm text-muted-foreground">
                        Locate the shut-off valves under the sink and turn them clockwise.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 rounded-lg bg-muted/50 p-4">
                    <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      2
                    </div>
                    <div>
                      <h4 className="font-bold">Check the connections</h4>
                      <p className="text-sm text-muted-foreground">
                        Use a wrench to tighten any loose connections at the pipe joints.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 rounded-lg bg-muted/50 p-4">
                    <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      3
                    </div>
                    <div>
                      <h4 className="font-bold">Inspect the washer</h4>
                      <p className="text-sm text-muted-foreground">
                        If tightening doesn't work, the rubber washer may need replacement.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-accent/30 bg-accent/5 p-4">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Estimated Cost Savings:</strong> $30-40 if you fix it yourself
                    vs hiring a professional.
                  </p>
                </div>
              </div>
            </Card>
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
                          <h3 className="font-bold">{helper.name}</h3>
                          <div className="flex items-center space-x-1 text-sm">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{helper.rating}</span>
                            <span className="text-muted-foreground">({helper.reviews})</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="whitespace-nowrap">
                        ${helper.hourlyRate}/hr
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
