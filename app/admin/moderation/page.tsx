"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { toast } from "react-hot-toast"

const mockIssues = [
  {
    id: "1",
    reporter: {
      name: "Sarah Johnson",
      avatar: "/placeholder.svg?key=user1",
    },
    reportedUser: {
      name: "John Smith",
      avatar: "/placeholder.svg?key=helper1",
    },
    type: "Inappropriate Behavior",
    description: "Helper was unprofessional and rude during the job.",
    jobTitle: "Plumbing repair",
    reportedDate: "2024-01-20",
    status: "Pending",
  },
  {
    id: "2",
    reporter: {
      name: "Michael Chen",
      avatar: "/placeholder.svg?key=user2",
    },
    reportedUser: {
      name: "Maria Garcia",
      avatar: "/placeholder.svg?key=helper2",
    },
    type: "Quality Issue",
    description: "Work was not completed as agreed. Several issues remain.",
    jobTitle: "Electrical installation",
    reportedDate: "2024-01-19",
    status: "Pending",
  },
]

export default function ModerationPage() {
  const [issues, setIssues] = useState(mockIssues)

  const handleResolve = (id: string) => {
    setIssues(issues.map((issue) => (issue.id === id ? { ...issue, status: "Resolved" } : issue)))
    toast.success("Issue marked as resolved")
  }

  const handleReject = (id: string) => {
    setIssues(issues.map((issue) => (issue.id === id ? { ...issue, status: "Rejected" } : issue)))
    toast.error("Issue rejected")
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

        <div className="mb-8">
          <h1 className="text-3xl font-bold">Issue Moderation</h1>
          <p className="text-muted-foreground">Review and resolve reported issues</p>
        </div>

        <div className="space-y-6">
          {issues.map((issue, index) => (
            <Card
              key={issue.id}
              className="overflow-hidden shadow-xl transition-all duration-300 hover:shadow-2xl animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="border-b border-border bg-destructive/5 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="rounded-full bg-destructive/10 p-3">
                      <AlertTriangle className="h-6 w-6 text-destructive" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{issue.type}</h3>
                      <p className="text-sm text-muted-foreground">Reported on {issue.reportedDate}</p>
                    </div>
                  </div>
                  <Badge
                    className={
                      issue.status === "Resolved"
                        ? "bg-green-500 text-white"
                        : issue.status === "Rejected"
                          ? "bg-red-500 text-white"
                          : "bg-yellow-500 text-white"
                    }
                  >
                    {issue.status}
                  </Badge>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <h4 className="mb-2 font-bold">Job:</h4>
                  <p className="text-muted-foreground">{issue.jobTitle}</p>
                </div>

                <div>
                  <h4 className="mb-2 font-bold">Description:</h4>
                  <p className="text-muted-foreground leading-relaxed">{issue.description}</p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <h4 className="mb-3 font-bold">Reporter</h4>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12 ring-2 ring-border">
                        <AvatarImage src={issue.reporter.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {issue.reporter.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{issue.reporter.name}</p>
                        <p className="text-sm text-muted-foreground">Help Seeker</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-3 font-bold">Reported User</h4>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12 ring-2 ring-border">
                        <AvatarImage src={issue.reportedUser.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="bg-accent text-accent-foreground">
                          {issue.reportedUser.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{issue.reportedUser.name}</p>
                        <p className="text-sm text-muted-foreground">Helper</p>
                      </div>
                    </div>
                  </div>
                </div>

                {issue.status === "Pending" && (
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={() => handleResolve(issue.id)}
                      className="flex-1 bg-green-600 text-white hover:bg-green-700 transition-all duration-300 hover:scale-105"
                    >
                      <CheckCircle className="mr-2 h-5 w-5" />
                      Resolve
                    </Button>
                    <Button
                      onClick={() => handleReject(issue.id)}
                      variant="outline"
                      className="flex-1 border-red-600 text-red-600 hover:bg-red-50 transition-all duration-300 hover:scale-105"
                    >
                      <XCircle className="mr-2 h-5 w-5" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
