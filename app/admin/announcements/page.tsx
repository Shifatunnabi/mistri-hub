"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Edit, Trash2, Megaphone } from "lucide-react"
import Link from "next/link"
import { toast } from "react-hot-toast"

const mockAnnouncements = [
  {
    id: "1",
    title: "Platform Maintenance Scheduled",
    content:
      "MistriHub will undergo scheduled maintenance on Feb 1st from 2-4 AM. Some features may be temporarily unavailable.",
    type: "Maintenance",
    publishedDate: "2024-01-20",
    active: true,
  },
  {
    id: "2",
    title: "New Category Added: Gardening",
    content: "We have added a new category - Gardening! Find helpers for all your gardening needs.",
    type: "Feature",
    publishedDate: "2024-01-18",
    active: true,
  },
  {
    id: "3",
    title: "Holiday Hours Update",
    content:
      "Our support team will have limited hours during the upcoming holiday season. Emergency support will remain available 24/7.",
    type: "Update",
    publishedDate: "2024-01-15",
    active: false,
  },
]

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState(mockAnnouncements)
  const [isAdding, setIsAdding] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "Update",
  })

  const handleAdd = () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error("Please fill in all fields")
      return
    }
    const newAnnouncement = {
      id: String(announcements.length + 1),
      ...formData,
      publishedDate: new Date().toISOString().split("T")[0],
      active: true,
    }
    setAnnouncements([newAnnouncement, ...announcements])
    setFormData({ title: "", content: "", type: "Update" })
    setIsAdding(false)
    toast.success("Announcement published successfully!")
  }

  const handleToggle = (id: string) => {
    setAnnouncements(announcements.map((ann) => (ann.id === id ? { ...ann, active: !ann.active } : ann)))
    toast.success("Announcement status updated!")
  }

  const handleDelete = (id: string) => {
    setAnnouncements(announcements.filter((ann) => ann.id !== id))
    toast.success("Announcement deleted successfully!")
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto max-w-5xl px-4">
        <Link
          href="/admin"
          className="mb-6 inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to dashboard
        </Link>

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Announcements</h1>
            <p className="text-muted-foreground">Manage platform announcements and updates</p>
          </div>
          <Button onClick={() => setIsAdding(true)} className="transition-all duration-300 hover:scale-105">
            <Plus className="mr-2 h-5 w-5" />
            New Announcement
          </Button>
        </div>

        {isAdding && (
          <Card className="mb-6 p-6 shadow-xl animate-fade-in-up">
            <h3 className="mb-4 font-bold">Create New Announcement</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Announcement title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  placeholder="Announcement details..."
                  className="min-h-[120px]"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <select
                  id="type"
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="Update">Update</option>
                  <option value="Feature">Feature</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>
              <div className="flex space-x-3">
                <Button onClick={handleAdd} className="transition-all duration-300 hover:scale-105">
                  Publish
                </Button>
                <Button
                  onClick={() => {
                    setIsAdding(false)
                    setFormData({ title: "", content: "", type: "Update" })
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        <div className="space-y-6">
          {announcements.map((announcement, index) => (
            <Card
              key={announcement.id}
              className="overflow-hidden shadow-xl transition-all duration-300 hover:shadow-2xl animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="border-b border-border bg-primary/5 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="rounded-full bg-primary p-3">
                      <Megaphone className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{announcement.title}</h3>
                      <div className="mt-2 flex items-center space-x-2">
                        <Badge variant="secondary">{announcement.type}</Badge>
                        <Badge variant={announcement.active ? "default" : "secondary"}>
                          {announcement.active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handleToggle(announcement.id)}
                      className="transition-all duration-300 hover:scale-110"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handleDelete(announcement.id)}
                      className="border-red-600 text-red-600 transition-all duration-300 hover:scale-110 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-muted-foreground leading-relaxed">{announcement.content}</p>
                <p className="text-sm text-muted-foreground">Published on {announcement.publishedDate}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
