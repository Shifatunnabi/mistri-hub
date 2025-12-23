"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Phone, Mail, User as UserIcon, Loader2, CheckCircle } from "lucide-react"
import toast from "react-hot-toast"
import Link from "next/link"

interface Applicant {
  _id: string
  status: string
  createdAt: string
  helper: {
    _id: string
    name: string
    email: string
    phone: string
    profilePhoto?: string
    averageRating: number
    totalReviews: number
  }
}

interface ViewApplicantsModalProps {
  jobId: string
  isOpen: boolean
  onClose: () => void
}

export function ViewApplicantsModal({ jobId, isOpen, onClose }: ViewApplicantsModalProps) {
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSelecting, setIsSelecting] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      fetchApplicants()
    }
  }, [isOpen, jobId])

  const fetchApplicants = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/jobs/${jobId}/applications`)
      const data = await response.json()

      if (response.ok) {
        setApplicants(data.applications)
      } else {
        toast.error("Failed to load applicants")
      }
    } catch (error) {
      console.error("Error fetching applicants:", error)
      toast.error("An error occurred while loading applicants")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectHelper = async (applicationId: string) => {
    setIsSelecting(applicationId)
    try {
      const response = await fetch(`/api/jobs/${jobId}/applications/${applicationId}/accept`, {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Helper selected successfully!")
        // Refresh applicants list to show updated status
        fetchApplicants()
      } else {
        toast.error(data.error || "Failed to select helper")
      }
    } catch (error) {
      console.error("Error selecting helper:", error)
      toast.error("An error occurred while selecting helper")
    } finally {
      setIsSelecting(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return <Badge className="bg-green-500 text-white">Selected</Badge>
      case "rejected":
        return <Badge className="bg-red-500 text-white">Not Selected</Badge>
      case "pending":
        return <Badge className="bg-yellow-500 text-white">Pending</Badge>
      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Job Applicants ({applicants.length})</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : applicants.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No applications yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applicants.map((applicant) => (
              <div
                key={applicant._id}
                className="border rounded-lg p-6 space-y-4 hover:border-primary transition-colors animate-fade-in-up"
              >
                {/* Helper Info */}
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16 ring-2 ring-border">
                    <AvatarImage src={applicant.helper.profilePhoto || "/placeholder.svg"} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                      {applicant.helper.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold">{applicant.helper.name}</h3>
                      {getStatusBadge(applicant.status)}
                    </div>
                    <div className="flex items-center gap-2">
                      {applicant.helper.averageRating > 0 ? (
                        <div className="flex items-center text-sm">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                          <span className="font-medium">{applicant.helper.averageRating.toFixed(1)}</span>
                          <span className="text-muted-foreground ml-1">
                            ({applicant.helper.totalReviews} reviews)
                          </span>
                        </div>
                      ) : (
                        <Badge variant="secondary">New Helper</Badge>
                      )}
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span>{applicant.helper.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{applicant.helper.phone}</span>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Applied {new Date(applicant.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link href={`/profile/${applicant.helper._id}`} target="_blank" className="flex-1">
                    <Button variant="outline" className="w-full">
                      <UserIcon className="h-4 w-4 mr-2" />
                      View Profile
                    </Button>
                  </Link>
                  {applicant.status === "pending" ? (
                    <Button
                      onClick={() => handleSelectHelper(applicant._id)}
                      disabled={isSelecting !== null}
                      className="flex-1 transition-all duration-300 hover:scale-105"
                    >
                      {isSelecting === applicant._id ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Selecting...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Select Helper
                        </>
                      )}
                    </Button>
                  ) : applicant.status === "accepted" ? (
                    <Button className="flex-1 bg-green-500 hover:bg-green-600" disabled>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Selected
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
