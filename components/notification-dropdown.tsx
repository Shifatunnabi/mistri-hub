"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
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
import { formatDistanceToNow } from "date-fns"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"

interface Notification {
  _id: string
  type: string
  title: string
  message: string
  link?: string
  isRead: boolean
  createdAt: string
  job?: {
    _id: string
    title: string
  }
}

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications")
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications)
        setUnreadCount(data.unreadCount)
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications/mark-read", {
        method: "PATCH",
      })
      if (response.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
        setUnreadCount(0)
      }
    } catch (error) {
      console.error("Failed to mark notifications as read:", error)
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    if (notification.link) {
      router.push(notification.link)
    } else if (notification.job?._id) {
      router.push(`/jobs/${notification.job._id}`)
    }
    setIsOpen(false)
  }

  const shouldShowViewTimelineButton = (notification: Notification) => {
    return (
      notification.type === "application_accepted" ||
      notification.type === "timeline_update"
    )
  }

  useEffect(() => {
    fetchNotifications()
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleOpenChange = async (open: boolean) => {
    setIsOpen(open)
    if (open && unreadCount > 0) {
      // Mark all as read when opening
      await markAllAsRead()
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "welcome":
        return "👋"
      case "new_application":
        return "📝"
      case "application_accepted":
        return "✅"
      case "application_rejected":
        return "❌"
      case "job_status_update":
        return "🔄"
      case "timeline_update":
        return "📅"
      case "verification_update":
        return "✓"
      case "new_review":
        return "⭐"
      default:
        return "🔔"
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 h-5 min-w-5 rounded-full px-1 text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {unreadCount} new
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-96">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
              <Bell className="mb-2 h-8 w-8 opacity-50" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification, index) => (
              <div key={notification._id}>
                {index > 0 && <DropdownMenuSeparator />}
                <DropdownMenuItem
                  className="cursor-pointer flex-col items-start gap-2 p-3 rounded-md transition-all hover:!bg-transparent focus:!bg-transparent data-[highlighted]:!bg-transparent border border-transparent hover:!border-primary"
                  onSelect={(e) => {
                    // Prevent default dropdown close for clicking action button
                    if ((e.target as HTMLElement).closest('button')) {
                      e.preventDefault()
                    }
                  }}
                >
                  <div 
                    className="flex w-full items-start gap-2"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <span className="text-xl">{getNotificationIcon(notification.type)}</span>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{notification.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                      {notification.job && (
                        <p className="text-xs text-primary mt-1">Job: {notification.job.title}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1" />
                    )}
                  </div>
                  {shouldShowViewTimelineButton(notification) && notification.job?._id && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full mt-2"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (notification.job?._id) {
                          router.push(`/jobs/${notification.job._id}/timeline`)
                        }
                        setIsOpen(false)
                      }}
                    >
                      View Timeline
                    </Button>
                  )}
                </DropdownMenuItem>
              </div>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
