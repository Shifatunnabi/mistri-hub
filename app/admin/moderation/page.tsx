"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, AlertTriangle, Eye, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "react-hot-toast"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

interface Report {
  _id: string
  reporter: {
    _id: string
    name: string
    email: string
    role: string
    profilePhoto?: string
  }
  reportedUser: {
    _id: string
    name: string
    email: string
    role: string
    profilePhoto?: string
  }
  job: {
    _id: string
    title: string
    status: string
  }
  category: string
  description: string
  status: "pending" | "reviewed" | "resolved" | "dismissed"
  adminNotes?: string
  createdAt: string
  updatedAt: string
}

export default function ModerationPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [updatingReportId, setUpdatingReportId] = useState<string | null>(null)

  useEffect(() => {
    if (status === "loading") return
    
    if (!session || session.user?.role !== "ADMIN") {
      toast.error("Unauthorized access")
      router.push("/")
      return
    }

    fetchReports()
  }, [session, status])

  const fetchReports = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/reports")
      const data = await response.json()

      if (response.ok) {
        setReports(data.reports)
      } else {
        toast.error(data.error || "Failed to fetch reports")
      }
    } catch (error) {
      console.error("Error fetching reports:", error)
      toast.error("Failed to load reports")
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkAsReviewed = async (reportId: string) => {
    try {
      setUpdatingReportId(reportId)
      const response = await fetch(`/api/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "reviewed" }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Report marked as reviewed and notification sent")
        // Update local state
        setReports(reports.map((report) => 
          report._id === reportId ? { ...report, status: "reviewed" } : report
        ))
      } else {
        toast.error(data.error || "Failed to update report")
      }
    } catch (error) {
      console.error("Error updating report:", error)
      toast.error("Failed to update report")
    } finally {
      setUpdatingReportId(null)
    }
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      misbehave: "Misbehavior",
      inexperienced: "Inexperienced",
      unprofessional: "Unprofessional",
      poor_quality: "Poor Quality Work",
      safety_concerns: "Safety Concerns",
      other: "Other"
    }
    return labels[category] || category
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "reviewed":
        return "bg-blue-500 text-white"
      case "resolved":
        return "bg-green-500 text-white"
      case "dismissed":
        return "bg-gray-500 text-white"
      default:
        return "bg-yellow-500 text-white"
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading reports...</p>
        </div>
      </div>
    )
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
          <div className="mt-4 flex gap-2">
            <Badge variant="secondary">{reports.length} Total Reports</Badge>
            <Badge className="bg-yellow-500 text-white">
              {reports.filter(r => r.status === "pending").length} Pending
            </Badge>
            <Badge className="bg-blue-500 text-white">
              {reports.filter(r => r.status === "reviewed").length} Under Review
            </Badge>
          </div>
        </div>

        {reports.length === 0 ? (
          <Card className="p-12 text-center">
            <AlertTriangle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No Reports</h3>
            <p className="text-muted-foreground">There are no reports to review at this time.</p>
          </Card>
        ) : (
          <div className="space-y-6">
            {reports.map((report, index) => (
              <Card
                key={report._id}
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
                        <h3 className="text-lg font-bold">{getCategoryLabel(report.category)}</h3>
                        <p className="text-sm text-muted-foreground">
                          Reported on {new Date(report.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Report ID: {report._id}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusBadgeColor(report.status)}>
                      {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                    </Badge>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <div>
                    <h4 className="mb-2 font-bold">Job:</h4>
                    <div className="flex items-center justify-between">
                      <p className="text-muted-foreground">{report.job.title}</p>
                      <Badge variant="outline">{report.job.status}</Badge>
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-2 font-bold">Description:</h4>
                    <p className="text-muted-foreground leading-relaxed bg-muted/50 p-4 rounded-lg">
                      {report.description}
                    </p>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <h4 className="mb-3 font-bold">Reporter</h4>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12 ring-2 ring-border">
                          <AvatarImage src={report.reporter.profilePhoto || "/placeholder.svg"} />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {report.reporter.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{report.reporter.name}</p>
                          <p className="text-sm text-muted-foreground">{report.reporter.role}</p>
                          <p className="text-xs text-muted-foreground">{report.reporter.email}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="mb-3 font-bold">Reported User</h4>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12 ring-2 ring-destructive/50">
                          <AvatarImage src={report.reportedUser.profilePhoto || "/placeholder.svg"} />
                          <AvatarFallback className="bg-destructive/10 text-destructive">
                            {report.reportedUser.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{report.reportedUser.name}</p>
                          <p className="text-sm text-muted-foreground">{report.reportedUser.role}</p>
                          <p className="text-xs text-muted-foreground">{report.reportedUser.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {report.status === "pending" && (
                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={() => handleMarkAsReviewed(report._id)}
                        disabled={updatingReportId === report._id}
                        className="flex-1 bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300"
                      >
                        {updatingReportId === report._id ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Eye className="mr-2 h-5 w-5" />
                            Mark as Under Review
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {report.status === "reviewed" && (
                    <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                      <p className="text-sm text-blue-800">
                        <strong>Status:</strong> This report is currently under review. 
                        The reporter has been notified that their report is being investigated.
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
