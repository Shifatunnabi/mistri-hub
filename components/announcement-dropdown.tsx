"use client"

import { useState, useEffect } from "react"
import { Megaphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

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
    bg: "bg-red-50 dark:bg-red-950",
    border: "border-red-200 dark:border-red-800",
    text: "text-red-700 dark:text-red-400",
    dot: "bg-red-500",
  },
  medium: {
    bg: "bg-orange-50 dark:bg-orange-950",
    border: "border-orange-200 dark:border-orange-800",
    text: "text-orange-700 dark:text-orange-400",
    dot: "bg-orange-500",
  },
  low: {
    bg: "bg-blue-50 dark:bg-blue-950",
    border: "border-blue-200 dark:border-blue-800",
    text: "text-blue-700 dark:text-blue-400",
    dot: "bg-blue-500",
  },
}

export function AnnouncementDropdown() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const router = useRouter()

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch("/api/announcements")
      if (response.ok) {
        const data = await response.json()
        setAnnouncements(data.announcements)
        setUnreadCount(data.unreadCount)
      }
    } catch (error) {
      console.error("Failed to fetch announcements:", error)
    }
  }

  useEffect(() => {
    fetchAnnouncements()
    // Poll for new announcements every 30 seconds
    const interval = setInterval(fetchAnnouncements, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleViewAll = () => {
    router.push("/announcements")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative transition-all duration-300 hover:scale-110"
        >
          <Megaphone className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Announcements</span>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {unreadCount} new
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[400px]">
          {announcements.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              <Megaphone className="mx-auto h-12 w-12 opacity-50 mb-2" />
              <p>No announcements yet</p>
            </div>
          ) : (
            announcements.slice(0, 5).map((announcement) => {
              const config = priorityConfig[announcement.priority]
              return (
                <DropdownMenuItem
                  key={announcement._id}
                  className="cursor-pointer p-0"
                  onSelect={() => handleViewAll()}
                >
                  <div
                    className={cn(
                      "w-full p-3 border-l-4 transition-colors",
                      config.border,
                      config.bg,
                      !announcement.isViewed && "font-semibold"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={cn("h-2 w-2 rounded-full", config.dot)} />
                          <p className={cn("text-sm font-semibold truncate", config.text)}>
                            {announcement.title}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {announcement.details}
                        </p>
                      </div>
                    </div>
                  </div>
                </DropdownMenuItem>
              )
            })
          )}
        </ScrollArea>
        {announcements.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer justify-center font-medium text-primary"
              onSelect={handleViewAll}
            >
              View All Announcements
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
