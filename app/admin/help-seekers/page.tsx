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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Search, Eye, Briefcase, Phone, Mail, MapPin, Calendar, Ban, ShieldCheck, AlertTriangle, Star } from "lucide-react"
import Link from "next/link"
import { toast } from "react-hot-toast"

interface Report {
  _id: string
  reporter: {
    _id: string
    name: string
    profilePhoto?: string
  }
  job: {
    _id: string
    title: string
  }
  category: string
  description: string
  status: string
  createdAt: string
}

interface HelpSeeker {
  _id: string
  name: string
  email: string
  phone: string
  address: string
  profilePhoto?: string
  isBanned: boolean
  createdAt: string
  postedJobsCount?: number
  reviewsGivenCount?: number
  reportsCount?: number
}

export default function HelpSeekerManagementPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [helpSeekers, setHelpSeekers] = useState<HelpSeeker[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedHelpSeeker, setSelectedHelpSeeker] = useState<HelpSeeker | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [reports, setReports] = useState<Report[]>([])
  const [isLoadingReports, setIsLoadingReports] = useState(false)
  const [banDialogOpen, setBanDialogOpen] = useState(false)
  const [userToBan, setUserToBan] = useState<{ id: string; name: string; isBanned: boolean } | null>(null)

  // Redirect if not admin
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/")
    }
  }, [status, session, router])

  // Fetch help seekers
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "ADMIN") {
      fetchHelpSeekers()
    }
  }, [status, session])

  const fetchHelpSeekers = async () => {
    try {
      const response = await fetch("/api/admin/help-seekers")
      const data = await response.json()

      if (response.ok) {
        setHelpSeekers(data.helpSeekers)
      } else {
        toast.error("Failed to load help seekers")
      }
    } catch (error) {
      console.error("Error fetching help seekers:", error)
      toast.error("An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchReportsForUser = async (userId: string) => {
    setIsLoadingReports(true)
    try {
      const response = await fetch(`/api/admin/reports?reportedUserId=${userId}`)
      const data = await response.json()

      if (response.ok) {
        setReports(data.reports || [])
      } else {
        toast.error("Failed to load reports")
      }
    } catch (error) {
      console.error("Error fetching reports:", error)
      toast.error("An error occurred")
    } finally {
      setIsLoadingReports(false)
    }
  }

  const handleBanToggle = async (userId: string, currentBanStatus: boolean) => {
    const action = currentBanStatus ? "unban" : "ban"

    try {
      const response = await fetch("/api/admin/help-seekers/ban", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(`Help seeker ${action}ned successfully!`)
        // Update the help seeker's ban status
        setHelpSeekers(helpSeekers.map(hs => 
          hs._id === userId ? { ...hs, isBanned: !currentBanStatus } : hs
        ))
        // Update if in detail dialog
        if (selectedHelpSeeker?._id === userId) {
          setSelectedHelpSeeker({ ...selectedHelpSeeker, isBanned: !currentBanStatus })
        }
      } else {
        toast.error(data.error || `Failed to ${action} help seeker`)
      }
    } catch (error) {
      console.error(`Error ${action}ning help seeker:`, error)
      toast.error("An error occurred")
    } finally {
      setBanDialogOpen(false)
      setUserToBan(null)
    }
  }

  const openBanDialog = (userId: string, name: string, isBanned: boolean) => {
    setUserToBan({ id: userId, name, isBanned })
    setBanDialogOpen(true)
  }

  const handleViewDetails = (helpSeeker: HelpSeeker) => {
    setSelectedHelpSeeker(helpSeeker)
    setIsDetailDialogOpen(true)
    fetchReportsForUser(helpSeeker._id)
  }

  const filteredHelpSeekers = helpSeekers.filter(
    (hs) =>
      hs.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hs.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "misbehave":
        return "Misbehavior"
      case "inexperienced":
        return "Inexperienced"
      case "unprofessional":
        return "Unprofessional"
      case "poor_quality":
        return "Poor Quality"
      case "safety_concerns":
        return "Safety Concerns"
      default:
        return category
    }
  }

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
          <p className="mt-4 text-muted-foreground">Loading help seekers...</p>
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
          <h1 className="text-3xl font-bold">Help Seeker Management</h1>
          <p className="text-muted-foreground">Manage help seekers and review reports</p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full mb-6">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Help Seekers List */}
        {filteredHelpSeekers.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="rounded-full bg-muted p-6">
                <Search className="h-12 w-12 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">No Help Seekers Found</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? "No help seekers match your search." : "No help seekers registered yet."}
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredHelpSeekers.map((helpSeeker, index) => (
              <Card 
                key={helpSeeker._id} 
                className="p-6 shadow-xl transition-all duration-300 hover:shadow-2xl animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                  <div className="flex gap-4 flex-1">
                    <Avatar className="h-20 w-20 border-2 border-border">
                      <AvatarImage src={helpSeeker.profilePhoto} alt={helpSeeker.name} />
                      <AvatarFallback className="text-2xl">
                        {helpSeeker.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 space-y-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-xl font-bold">{helpSeeker.name}</h3>
                          {helpSeeker.isBanned && (
                            <Badge variant="destructive" className="flex items-center gap-1">
                              <Ban className="h-3 w-3" />
                              Banned
                            </Badge>
                          )}
                          {helpSeeker.reportsCount && helpSeeker.reportsCount > 0 && (
                            <Badge variant="outline" className="flex items-center gap-1 border-orange-500 text-orange-500">
                              <AlertTriangle className="h-3 w-3" />
                              {helpSeeker.reportsCount} {helpSeeker.reportsCount === 1 ? "Report" : "Reports"}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{helpSeeker.email}</p>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {helpSeeker.phone}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {helpSeeker.address}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4 text-primary" />
                          <span className="font-semibold">{helpSeeker.postedJobsCount || 0}</span>
                          <span className="text-muted-foreground">Jobs Posted</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-primary" />
                          <span className="font-semibold">{helpSeeker.reviewsGivenCount || 0}</span>
                          <span className="text-muted-foreground">Reviews Given</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Joined {new Date(helpSeeker.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 w-full md:w-auto">
                    <Button 
                      variant="outline" 
                      onClick={() => handleViewDetails(helpSeeker)}
                      className="w-full md:w-auto"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                    {helpSeeker.isBanned ? (
                      <Button
                        variant="default"
                        onClick={() => openBanDialog(helpSeeker._id, helpSeeker.name, true)}
                        className="w-full md:w-auto bg-green-600 hover:bg-green-700"
                      >
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        Unban User
                      </Button>
                    ) : (
                      <Button
                        variant="destructive"
                        onClick={() => openBanDialog(helpSeeker._id, helpSeeker.name, false)}
                        className="w-full md:w-auto"
                      >
                        <Ban className="mr-2 h-4 w-4" />
                        Ban User
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Help Seeker Details</DialogTitle>
            <DialogDescription>View detailed information and reports</DialogDescription>
          </DialogHeader>

          {selectedHelpSeeker && (
            <div className="space-y-6">
              {/* Profile Section */}
              <div className="flex items-start gap-4">
                <Avatar className="h-24 w-24 border-2 border-border">
                  <AvatarImage src={selectedHelpSeeker.profilePhoto} alt={selectedHelpSeeker.name} />
                  <AvatarFallback className="text-2xl">
                    {selectedHelpSeeker.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-2xl font-bold">{selectedHelpSeeker.name}</h3>
                    {selectedHelpSeeker.isBanned && (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <Ban className="h-3 w-3" />
                        Banned
                      </Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Email</Label>
                      <p className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {selectedHelpSeeker.email}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Phone</Label>
                      <p className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {selectedHelpSeeker.phone}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Address</Label>
                      <p className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {selectedHelpSeeker.address}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Member Since</Label>
                      <p className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(selectedHelpSeeker.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity Stats */}
              <Card className="p-4">
                <h4 className="font-semibold mb-3">Activity Statistics</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">{selectedHelpSeeker.postedJobsCount || 0}</p>
                      <p className="text-xs text-muted-foreground">Jobs Posted</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">{selectedHelpSeeker.reviewsGivenCount || 0}</p>
                      <p className="text-xs text-muted-foreground">Reviews Given</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Reports Section */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Reports Against This User ({reports.length})
                </h4>
                {isLoadingReports ? (
                  <div className="text-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Loading reports...</p>
                  </div>
                ) : reports.length === 0 ? (
                  <Card className="p-6 text-center">
                    <p className="text-muted-foreground">No reports found for this user</p>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {reports.map((report) => (
                      <Card key={report._id} className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={report.reporter.profilePhoto} alt={report.reporter.name} />
                                <AvatarFallback>{report.reporter.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-semibold">{report.reporter.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(report.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <Badge variant={report.status === "pending" ? "destructive" : "secondary"}>
                              {report.status}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-sm">
                              <span className="font-semibold">Category:</span> {getCategoryLabel(report.category)}
                            </p>
                            <p className="text-sm">
                              <span className="font-semibold">Job:</span> {report.job.title}
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground">{report.description}</p>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Link href={`/profile/${selectedHelpSeeker._id}`} className="flex-1">
                  <Button variant="outline" className="w-full">
                    View Public Profile
                  </Button>
                </Link>
                {selectedHelpSeeker.isBanned ? (
                  <Button
                    onClick={() => openBanDialog(selectedHelpSeeker._id, selectedHelpSeeker.name, true)}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Unban User
                  </Button>
                ) : (
                  <Button
                    variant="destructive"
                    onClick={() => openBanDialog(selectedHelpSeeker._id, selectedHelpSeeker.name, false)}
                    className="flex-1"
                  >
                    <Ban className="mr-2 h-4 w-4" />
                    Ban User
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Ban/Unban Confirmation Dialog */}
      <AlertDialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {userToBan?.isBanned ? "Unban Help Seeker" : "Ban Help Seeker"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {userToBan?.isBanned ? (
                <>
                  Are you sure you want to unban <strong>{userToBan?.name}</strong>? They will be able to login and use the platform again.
                </>
              ) : (
                <>
                  Are you sure you want to ban <strong>{userToBan?.name}</strong>? They will not be able to login or access their account.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => userToBan && handleBanToggle(userToBan.id, userToBan.isBanned)}
              className={userToBan?.isBanned ? "bg-green-600 hover:bg-green-700" : "bg-destructive hover:bg-destructive/90"}
            >
              {userToBan?.isBanned ? "Unban User" : "Ban User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
