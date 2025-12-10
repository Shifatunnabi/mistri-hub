"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, MapPin, DollarSign, Clock } from "lucide-react"
import Link from "next/link"
import { CreateJobDialog } from "@/components/create-job-dialog"

// Mock data for job posts
const mockJobs = [
  {
    id: "1",
    user: {
      name: "Sarah Johnson",
      avatar: "/placeholder.svg?key=user1",
    },
    title: "Need plumber for leaking pipe",
    description: "My kitchen sink has been leaking for 2 days. Need urgent help to fix it.",
    image: "/placeholder.svg?key=plumb1",
    location: "Downtown, Main Street",
    budgetMin: 40,
    budgetMax: 60,
    category: "Plumbing",
    postedAt: "2 hours ago",
    status: "Open",
  },
  {
    id: "2",
    user: {
      name: "Michael Chen",
      avatar: "/placeholder.svg?key=user2",
    },
    title: "Furniture assembly needed",
    description: "Bought a new wardrobe from IKEA. Need someone experienced to assemble it.",
    image: "/placeholder.svg?key=furn1",
    location: "Suburbs, Oak Avenue",
    budgetMin: 60,
    budgetMax: 90,
    category: "Handyman",
    postedAt: "5 hours ago",
    status: "Open",
  },
  {
    id: "3",
    user: {
      name: "Emily Rodriguez",
      avatar: "/placeholder.svg?key=user3",
    },
    title: "Deep cleaning service required",
    description: "Moving to a new apartment next week. Need deep cleaning of the current one.",
    image: "/placeholder.svg?key=clean1",
    location: "City Center, Park Road",
    budgetMin: 100,
    budgetMax: 150,
    category: "Cleaning",
    postedAt: "1 day ago",
    status: "Open",
  },
  {
    id: "4",
    user: {
      name: "David Kim",
      avatar: "/placeholder.svg?key=user4",
    },
    title: "Electrical outlet installation",
    description: "Need to install 3 new electrical outlets in my home office.",
    image: "/placeholder.svg?key=elec1",
    location: "West End, Maple Street",
    budgetMin: 80,
    budgetMax: 120,
    category: "Electrical",
    postedAt: "2 days ago",
    status: "Open",
  },
]

export default function JobBoardPage() {
  const [isCreateJobOpen, setIsCreateJobOpen] = useState(false)
  const [jobs, setJobs] = useState(mockJobs)

  return (
    <div className="min-h-screen bg-muted/30 py-4">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Create Job Section */}
        <Card className="mb-6 p-6 shadow-lg animate-fade-in-up">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src="/placeholder.svg?key=currentuser" />
              <AvatarFallback className="bg-primary text-primary-foreground">U</AvatarFallback>
            </Avatar>
            <Button
              onClick={() => setIsCreateJobOpen(true)}
              variant="outline"
              className="flex-1 justify-start text-muted-foreground transition-all duration-300 hover:scale-[1.02] hover:bg-background"
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              Need help? Post a job...
            </Button>
          </div>
        </Card>

        {/* Job Feed */}
        <div className="space-y-4">
          {jobs.map((job, index) => (
            <Card
              key={job.id}
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
                <Badge className="bg-primary text-primary-foreground">{job.category}</Badge>
              </div>

              {/* Job Content */}
              <div className="px-4 pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="text-lg font-bold mb-2">{job.title}</h2>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                      <span>{job.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 text-sm font-bold text-primary whitespace-nowrap">
                    <DollarSign className="h-4 w-4" />
                    <span>
                      ${job.budgetMin} - ${job.budgetMax}
                    </span>
                  </div>
                </div>
              </div>

              {/* Job Image */}
              {job.image && (
                <div className="relative aspect-video overflow-hidden bg-muted">
                  <img
                    src={job.image || "/placeholder.svg"}
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
          ))}
        </div>

        {/* Load More */}
        <div className="mt-6 text-center">
          <Button
            variant="outline"
            className="transition-all duration-300 hover:scale-105 bg-transparent"
            onClick={() => {
              // TODO: Load more jobs
            }}
          >
            Load More Jobs
          </Button>
        </div>
      </div>

      {/* Create Job Dialog */}
      <CreateJobDialog open={isCreateJobOpen} onOpenChange={setIsCreateJobOpen} />
    </div>
  )
}
