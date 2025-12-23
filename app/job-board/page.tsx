"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CreateJobDialog } from "@/components/create-job-dialog"
import { CreatePostSection } from "@/components/job-board/create-post-section"
import { JobPostCard, type JobPost } from "@/components/job-board/job-post-card"
import { toast } from "sonner"

export default function JobBoardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isCreateJobOpen, setIsCreateJobOpen] = useState(false)
  const [jobs, setJobs] = useState<JobPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  // Redirect if not logged in
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async (pageNum = 1) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/jobs?page=${pageNum}&limit=10`)
      const data = await response.json()

      if (response.ok) {
        const formattedJobs: JobPost[] = data.jobs.map((job: any) => ({
          id: job._id,
          user: {
            name: job.helpSeeker?.name || "Unknown User",
            avatar: job.helpSeeker?.profilePhoto,
          },
          title: job.title,
          description: job.description,
          image: job.photos[0], // First photo as main image
          location: job.location,
          budgetMin: job.budget?.min,
          budgetMax: job.budget?.max,
          category: job.category,
          postedAt: getTimeAgo(job.createdAt),
          status: job.status === "open" ? "Open" : "Closed",
        }))

        if (pageNum === 1) {
          setJobs(formattedJobs)
        } else {
          setJobs((prev) => [...prev, ...formattedJobs])
        }

        setHasMore(data.pagination.page < data.pagination.pages)
        setPage(pageNum)
      } else {
        toast.error("Failed to load jobs")
      }
    } catch (error) {
      console.error("Error fetching jobs:", error)
      toast.error("An error occurred while loading jobs")
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

  const handleJobCreated = () => {
    fetchJobs(1) // Refresh jobs list
  }

  const handleLoadMore = () => {
    fetchJobs(page + 1)
  }

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (isLoading && jobs.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading jobs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30 py-4">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Create Job Section */}
        <CreatePostSection
          userAvatar={session?.user?.profilePhoto}
          userName={session?.user?.name || undefined}
          onCreateClick={() => setIsCreateJobOpen(true)}
        />

        {/* Job Feed */}
        <div className="space-y-4">
          {jobs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No jobs posted yet. Be the first to post!</p>
            </div>
          ) : (
            jobs.map((job, index) => <JobPostCard key={job.id} job={job} index={index} />)
          )}
        </div>

        {/* Load More */}
        {hasMore && jobs.length > 0 && (
          <div className="mt-6 text-center">
            <Button
              variant="outline"
              className="transition-all duration-300 hover:scale-105 bg-transparent"
              onClick={handleLoadMore}
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Load More Jobs"}
            </Button>
          </div>
        )}
      </div>

      {/* Create Job Dialog */}
      <CreateJobDialog open={isCreateJobOpen} onOpenChange={setIsCreateJobOpen} onJobCreated={handleJobCreated} />
    </div>
  )
}
