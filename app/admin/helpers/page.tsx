"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Search, CheckCircle, XCircle, Eye, Briefcase, Phone, Mail, MapPin, FileText, Star, Ban, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { toast } from "react-hot-toast"
import { VerifiedBadge } from "@/components/verified-badge"

interface Helper {
  _id: string
  name: string
  email: string
  phone: string
  address: string
  profilePhoto?: string
  isApproved: boolean
  isBanned: boolean
  isVerified: boolean
  createdAt: string
  helperProfile: {
    skills: string[]
    rating: number
    completedJobs: number
    experience?: string
    serviceAreas: string[]
  }
}

export default function HelperManagementPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("pending")
  const [searchQuery, setSearchQuery] = useState("")
  const [pendingHelpers, setPendingHelpers] = useState<Helper[]>([])
  const [approvedHelpers, setApprovedHelpers] = useState<Helper[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedHelper, setSelectedHelper] = useState<Helper | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)

  // Redirect if not admin
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/")
    }
  }, [status, session, router])

  // Fetch helpers (both pending and approved)
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "ADMIN") {
      fetchHelpers()
    }
  }, [status, session])

  const fetchHelpers = async () => {
    try {
      const response = await fetch("/api/admin/helpers/approve")
      const data = await response.json()

      if (response.ok) {
        // Separate pending and approved helpers
        const pending = data.helpers.filter((h: Helper) => !h.isApproved)
        const approved = data.helpers.filter((h: Helper) => h.isApproved)
        setPendingHelpers(pending)
        setApprovedHelpers(approved)
      } else {
        toast.error("Failed to load helpers")
      }
    } catch (error) {
      console.error("Error fetching helpers:", error)
      toast.error("An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (helperId: string) => {
    try {
      const response = await fetch("/api/admin/helpers/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: helperId, action: "approve" }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Helper approved successfully!")
        // Move from pending to approved
        const approvedHelper = pendingHelpers.find(h => h._id === helperId)
        if (approvedHelper) {
          approvedHelper.isApproved = true
          setPendingHelpers(pendingHelpers.filter(h => h._id !== helperId))
          setApprovedHelpers([...approvedHelpers, approvedHelper])
        }
      } else {
        toast.error(data.error || "Failed to approve helper")
      }
    } catch (error) {
      console.error("Error approving helper:", error)
      toast.error("An error occurred")
    }
  }

  const handleReject = async (helperId: string) => {
    if (!confirm("Are you sure you want to reject this helper application? This will delete their account.")) {
      return
    }

    try {
      const response = await fetch("/api/admin/helpers/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: helperId, action: "reject" }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Helper application rejected")
        // Remove from pending list
        setPendingHelpers(pendingHelpers.filter(h => h._id !== helperId))
      } else {
        toast.error(data.error || "Failed to reject helper")
      }
    } catch (error) {
      console.error("Error rejecting helper:", error)
      toast.error("An error occurred")
    }
  }

  const handleBanToggle = async (helperId: string, currentBanStatus: boolean) => {
    const action = currentBanStatus ? "unban" : "ban"
    const confirmMessage = currentBanStatus 
      ? "Are you sure you want to unban this helper?" 
      : "Are you sure you want to ban this helper? They will not be able to login."
    
    if (!confirm(confirmMessage)) {
      return
    }

    try {
      const response = await fetch("/api/admin/helpers/ban", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: helperId, action }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(`Helper ${action}ned successfully!`)
        // Update the helper's ban status
        setApprovedHelpers(approvedHelpers.map(h => 
          h._id === helperId ? { ...h, isBanned: !currentBanStatus } : h
        ))
        // Update if in detail dialog
        if (selectedHelper?._id === helperId) {
          setSelectedHelper({ ...selectedHelper, isBanned: !currentBanStatus })
        }
      } else {
        toast.error(data.error || `Failed to ${action} helper`)
      }
    } catch (error) {
      console.error(`Error ${action}ning helper:`, error)
      toast.error("An error occurred")
    }
  }

  const handleViewDetails = (helper: Helper) => {
    setSelectedHelper(helper)
    setIsDetailDialogOpen(true)
  }

  const filteredPendingHelpers = pendingHelpers.filter(
    (helper) =>
      helper.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      helper.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredApprovedHelpers = approvedHelpers.filter(
    (helper) =>
      helper.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      helper.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (status === "loading" || !session || session.user.role !== "ADMIN") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading helpers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto max-w-7xl px-4">
        <Link
          href="/admin"
          className="mb-6 inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold">Helper Management</h1>
          <p className="text-muted-foreground">Review applications and manage helpers</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="pending" className="relative">
              Approval Requests
              {pendingHelpers.length > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                  {pendingHelpers.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved Helpers
              <Badge variant="secondary" className="ml-2">
                {approvedHelpers.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* Search Bar */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Pending Helpers Tab */}
          <TabsContent value="pending" className="space-y-6">
            {filteredPendingHelpers.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="rounded-full bg-muted p-6">
                    <CheckCircle className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">No Pending Applications</h3>
                    <p className="text-muted-foreground">
                      {searchQuery ? "No helpers match your search." : "All helper applications have been reviewed."}
                    </p>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="grid gap-6">
                {filteredPendingHelpers.map((helper, index) => (
                  <Card 
                    key={helper._id} 
                    className="p-6 shadow-xl transition-all duration-300 hover:shadow-2xl animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                      <div className="flex gap-4 flex-1">
                        <Avatar className="h-20 w-20 border-2 border-border">
                          <AvatarImage src={helper.profilePhoto} alt={helper.name} />
                          <AvatarFallback className="text-2xl">
                            {helper.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 space-y-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-xl font-bold">{helper.name}</h3>
                              <VerifiedBadge isVerified={helper.isVerified} size="md" />
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {helper.helperProfile?.skills?.map((skill, idx) => (
                                <Badge key={idx} variant="secondary">
                                  <Briefcase className="h-3 w-3 mr-1" />
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Mail className="h-4 w-4" />
                              {helper.email}
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone className="h-4 w-4" />
                              {helper.phone}
                            </div>
                          </div>
                          
                          <p className="text-xs text-muted-foreground">
                            Applied: {new Date(helper.createdAt).toLocaleDateString("en-US", { 
                              year: "numeric", 
                              month: "long", 
                              day: "numeric" 
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex md:flex-col gap-2 w-full md:w-auto">
                        <Button
                          onClick={() => handleApprove(helper._id)}
                          className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        
                        <Button
                          onClick={() => handleReject(helper._id)}
                          variant="destructive"
                          className="flex-1 md:flex-none"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                        
                        <Button
                          onClick={() => handleViewDetails(helper)}
                          variant="outline"
                          className="flex-1 md:flex-none"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Approved Helpers Tab */}
          <TabsContent value="approved" className="space-y-6">
            {filteredApprovedHelpers.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="rounded-full bg-muted p-6">
                    <ShieldCheck className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">No Approved Helpers</h3>
                    <p className="text-muted-foreground">
                      {searchQuery ? "No helpers match your search." : "No helpers have been approved yet."}
                    </p>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredApprovedHelpers.map((helper, index) => (
                  <Card 
                    key={helper._id} 
                    className="p-6 shadow-lg transition-all duration-300 hover:shadow-xl animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex flex-col items-center text-center space-y-4">
                      <Avatar className="h-24 w-24 border-4 border-border">
                        <AvatarImage src={helper.profilePhoto} alt={helper.name} />
                        <AvatarFallback className="text-3xl">
                          {helper.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="space-y-1 w-full">
                        <div className="flex items-center justify-center gap-2">
                          <h3 className="text-lg font-bold">{helper.name}</h3>
                          <VerifiedBadge isVerified={helper.isVerified} size="sm" />
                        </div>
                        <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{helper.email}</span>
                        </div>
                        <div className="flex items-center justify-center gap-2 mt-2">
                          <Badge variant={helper.isBanned ? "destructive" : "default"}>
                            {helper.isBanned ? "Banned" : "Active"}
                          </Badge>
                          <Badge variant="outline">
                            <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                            {helper.helperProfile?.rating?.toFixed(1) || "0.0"}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex gap-2 w-full">
                        <Button
                          onClick={() => handleViewDetails(helper)}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                        
                        <Button
                          onClick={() => handleBanToggle(helper._id, helper.isBanned)}
                          variant={helper.isBanned ? "default" : "destructive"}
                          size="sm"
                          className="flex-1"
                        >
                          <Ban className="h-4 w-4 mr-1" />
                          {helper.isBanned ? "Unban" : "Ban"}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Details Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Helper Application Details</DialogTitle>
              <DialogDescription>
                Review complete information about this helper application
              </DialogDescription>
            </DialogHeader>

            {selectedHelper && (
              <div className="space-y-6">
                {/* Profile Section */}
                <div className="flex items-center gap-4 pb-4 border-b">
                  <Avatar className="h-24 w-24 border-2 border-border">
                    <AvatarImage src={selectedHelper.profilePhoto} alt={selectedHelper.name} />
                    <AvatarFallback className="text-3xl">
                      {selectedHelper.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-bold">{selectedHelper.name}</h3>
                      <VerifiedBadge isVerified={selectedHelper.isVerified} size="lg" />
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Badge variant={selectedHelper.isApproved ? "default" : "outline"}>
                        {selectedHelper.isApproved ? "Approved" : "Pending Approval"}
                      </Badge>
                      {selectedHelper.isBanned && (
                        <Badge variant="destructive">Banned</Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Contact Information
                  </h4>
                  <div className="grid gap-3 ml-6">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Email</Label>
                      <p className="text-sm">{selectedHelper.email}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Phone</Label>
                      <p className="text-sm">{selectedHelper.phone}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Address</Label>
                      <p className="text-sm">{selectedHelper.address}</p>
                    </div>
                  </div>
                </div>

                {/* Skills & Services */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Skills & Services
                  </h4>
                  <div className="space-y-3 ml-6">
                    {selectedHelper.helperProfile?.skills && selectedHelper.helperProfile.skills.length > 0 ? (
                      <>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Primary Skills</Label>
                          <div className="flex flex-wrap gap-2">
                            {selectedHelper.helperProfile.skills.map((skill, idx) => (
                              <Badge key={idx} variant="secondary">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">No skills listed</p>
                    )}
                    
                    {selectedHelper.helperProfile?.experience && (
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Experience</Label>
                        <p className="text-sm">{selectedHelper.helperProfile.experience} years</p>
                      </div>
                    )}
                    
                    {selectedHelper.helperProfile?.serviceAreas && selectedHelper.helperProfile.serviceAreas.length > 0 && (
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Service Areas</Label>
                        <div className="flex flex-wrap gap-2">
                          {selectedHelper.helperProfile.serviceAreas.map((area, idx) => (
                            <Badge key={idx} variant="outline">
                              {area}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Application Date */}
                <div className="space-y-3">
                  <h4 className="font-semibold">Application Date</h4>
                  <p className="text-sm text-muted-foreground ml-6">
                    {new Date(selectedHelper.createdAt).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  {!selectedHelper.isApproved ? (
                    <>
                      <Button
                        onClick={() => {
                          handleApprove(selectedHelper._id)
                          setIsDetailDialogOpen(false)
                        }}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve Helper
                      </Button>
                      <Button
                        onClick={() => {
                          handleReject(selectedHelper._id)
                          setIsDetailDialogOpen(false)
                        }}
                        variant="destructive"
                        className="flex-1"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject Application
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => {
                        handleBanToggle(selectedHelper._id, selectedHelper.isBanned)
                        setIsDetailDialogOpen(false)
                      }}
                      variant={selectedHelper.isBanned ? "default" : "destructive"}
                      className="flex-1"
                    >
                      <Ban className="h-4 w-4 mr-2" />
                      {selectedHelper.isBanned ? "Unban Helper" : "Ban Helper"}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
