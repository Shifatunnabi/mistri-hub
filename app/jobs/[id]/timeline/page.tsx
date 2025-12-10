"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, MessageCircle, Star, CheckCircle2, Clock } from "lucide-react"
import Link from "next/link"
import { ChatWindow } from "@/components/chat-window"
import { toast } from "react-hot-toast"

const mockJob = {
  id: "1",
  title: "Need plumber for leaking pipe",
  description: "My kitchen sink has been leaking for 2 days. The water is dripping from under the sink.",
  image: "/placeholder.svg?key=plumb1",
  budget: 50,
  status: "In Progress",
  seeker: {
    name: "Sarah Johnson",
    avatar: "/placeholder.svg?key=user1",
  },
  helper: {
    name: "John Smith",
    avatar: "/placeholder.svg?key=helper1",
    rating: 4.8,
  },
  timeline: [
    { status: "Request Sent", completed: true, date: "2024-01-15 10:00 AM" },
    { status: "Accepted", completed: true, date: "2024-01-15 10:30 AM" },
    { status: "Scheduled", completed: true, date: "2024-01-15 11:00 AM" },
    { status: "In Progress", completed: false, date: "Expected: Today 2:00 PM" },
    { status: "Completed", completed: false, date: "Pending" },
  ],
}

export default function JobTimelinePage({ params }: { params: { id: string } }) {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState("")
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)

  const handleSubmitReview = () => {
    if (rating === 0) {
      toast.error("Please select a rating")
      return
    }
    setIsSubmittingReview(true)
    setTimeout(() => {
      toast.success("Review submitted successfully!")
      setIsSubmittingReview(false)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto max-w-4xl px-4">
        <Link
          href="/home"
          className="mb-6 inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to feed
        </Link>

        <div className="space-y-6">
          {/* Job Overview Card */}
          <Card className="overflow-hidden shadow-xl animate-fade-in-up">
            <div className="border-b border-border bg-muted/30 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="mb-2 text-2xl font-bold">{mockJob.title}</h1>
                  <Badge className="bg-accent text-accent-foreground">{mockJob.status}</Badge>
                </div>
                <Button onClick={() => setIsChatOpen(true)} className="transition-all duration-300 hover:scale-105">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Chat
                </Button>
              </div>
            </div>

            {mockJob.image && (
              <div className="relative aspect-video overflow-hidden bg-muted">
                <img
                  src={mockJob.image || "/placeholder.svg"}
                  alt={mockJob.title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <div className="p-6">
              <p className="mb-6 text-muted-foreground leading-relaxed">{mockJob.description}</p>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="font-bold">Help Seeker</h3>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12 ring-2 ring-border">
                      <AvatarImage src={mockJob.seeker.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {mockJob.seeker.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold">{mockJob.seeker.name}</p>
                      <p className="text-sm text-muted-foreground">Posted this job</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold">Helper</h3>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12 ring-2 ring-border">
                      <AvatarImage src={mockJob.helper.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="bg-accent text-accent-foreground">
                        {mockJob.helper.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold">{mockJob.helper.name}</p>
                      <div className="flex items-center space-x-1 text-sm">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{mockJob.helper.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
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
                {mockJob.timeline.map((step, index) => (
                  <div key={index} className="relative flex items-start space-x-4">
                    {/* Timeline Line */}
                    {index !== mockJob.timeline.length - 1 && (
                      <div
                        className={`absolute left-6 top-14 h-full w-0.5 ${step.completed ? "bg-primary" : "bg-border"}`}
                      />
                    )}

                    {/* Timeline Icon */}
                    <div
                      className={`relative z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full transition-all duration-500 ${
                        step.completed
                          ? "bg-primary text-primary-foreground scale-100"
                          : index === mockJob.timeline.findIndex((s) => !s.completed)
                            ? "bg-accent text-accent-foreground animate-pulse"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {step.completed ? (
                        <CheckCircle2 className="h-6 w-6" />
                      ) : index === mockJob.timeline.findIndex((s) => !s.completed) ? (
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
                            : index === mockJob.timeline.findIndex((s) => !s.completed)
                              ? "bg-accent/5 border border-accent/20"
                              : "bg-muted/50 border border-border"
                        }`}
                      >
                        <h3
                          className={`font-bold ${
                            step.completed
                              ? "text-primary"
                              : index === mockJob.timeline.findIndex((s) => !s.completed)
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
            </div>
          </Card>

          {/* Review Card (Only visible when job is completed) */}
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

              <p className="text-center text-xs text-muted-foreground">
                Note: You can only submit a review after the job is completed
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Chat Window */}
      <ChatWindow isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} recipient={mockJob.helper} />
    </div>
  )
}
