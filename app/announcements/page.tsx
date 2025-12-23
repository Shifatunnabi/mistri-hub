"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Megaphone, Calendar, Clock } from "lucide-react"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface Announcement {
  _id: string
  title: string
  details: string
  priority: "high" | "medium" | "low"
  isViewed: boolean
  createdAt: string
}

const priorityConfig = {
  high: {
    label: "High Priority",
    bg: "bg-red-50 dark:bg-red-950",
    border: "border-red-200 dark:border-red-800",
    badgeBg: "bg-red-500 text-white",
    icon: "text-red-600 dark:text-red-400",
  },
  medium: {
    label: "Medium Priority",
    bg: "bg-orange-50 dark:bg-orange-950",
    border: "border-orange-200 dark:border-orange-800",
    badgeBg: "bg-orange-500 text-white",
    icon: "text-orange-600 dark:text-orange-400",
  },
  low: {
    label: "Low Priority",
    bg: "bg-blue-50 dark:bg-blue-950",
    border: "border-blue-200 dark:border-blue-800",
    badgeBg: "bg-blue-500 text-white",
    icon: "text-blue-600 dark:text-blue-400",
  },
}

export default function AnnouncementsPage() {
  const { data: session } = useSession()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch("/api/announcements")
      if (response.ok) {
        const data = await response.json()
        setAnnouncements(data.announcements)
        
        // Mark all as viewed
        const unviewed = data.announcements.filter((a: Announcement) => !a.isViewed)
        for (const announcement of unviewed) {
          await fetch(`/api/announcements/${announcement._id}/view`, {
            method: "PATCH",
          })
        }
      }
    } catch (error) {
      console.error("Failed to fetch announcements:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", { 
      hour: "2-digit", 
      minute: "2-digit" 
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-8">
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-6 w-96" />
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Megaphone className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
          </div>
          <p className="text-muted-foreground">
            Stay updated with the latest news and important updates from MistriHub
          </p>
        </div>

        {/* Announcements List */}
        {announcements.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Megaphone className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Announcements</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                There are no announcements at the moment. Check back later for updates!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {announcements.map((announcement) => {
              const config = priorityConfig[announcement.priority]
              return (
                <Card
                  key={announcement._id}
                  className={cn(
                    "border-l-4 transition-all duration-300 hover:shadow-lg",
                    config.border,
                    config.bg
                  )}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Megaphone className={cn("h-5 w-5", config.icon)} />
                          <Badge className={config.badgeBg}>
                            {config.label}
                          </Badge>
                          {!announcement.isViewed && (
                            <Badge variant="secondary" className="text-xs">
                              New
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-2xl">{announcement.title}</CardTitle>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(announcement.createdAt)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatTime(announcement.createdAt)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed whitespace-pre-wrap">
                      {announcement.details}
                    </CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
