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
import { ArrowLeft, Search, Shield, XCircle, Eye, Mail, Phone, FileText, CheckCircle } from "lucide-react"
import Link from "next/link"
import { toast } from "react-hot-toast"
import { VerifiedBadge } from "@/components/verified-badge"

interface Helper {
  _id: string
  name: string
  email: string
  phone: string
  profilePhoto?: string
  verificationStatus: string
  isVerified: boolean
  createdAt: string
  helperProfile: {
    nidNumber?: string
    nidPhoto?: string
    verificationDocuments: string[]
    skills: string[]
  }
}

export default function HelperVerificationPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [helpers, setHelpers] = useState<Helper[]>([])
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

  // Fetch pending verifications
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "ADMIN") {
      fetchHelpers()
    }
  }, [status, session])

  const fetchHelpers = async () => {
    try {
      const response = await fetch("/api/admin/helpers/verify")
      const data = await response.json()

      if (response.ok) {
        setHelpers(data.helpers)
      } else {
        toast.error("Failed to load verification requests")
      }
    } catch (error) {
      console.error("Error fetching verifications:", error)
      toast.error("An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerify = async (helperId: string) => {
    try {
      const response = await fetch("/api/admin/helpers/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: helperId, action: "verify" }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Helper verified successfully!")
        setHelpers(helpers.filter(h => h._id !== helperId))
      } else {
        toast.error(data.error || "Failed to verify helper")
      }
    } catch (error) {
      console.error("Error verifying helper:", error)
      toast.error("An error occurred")
    }
  }

  const handleReject = async (helperId: string) => {
    if (!confirm("Are you sure you want to reject this verification request? The helper can resubmit documents.")) {
      return
    }

    try {
      const response = await fetch("/api/admin/helpers/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: helperId, action: "reject" }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Verification rejected")
        setHelpers(helpers.filter(h => h._id !== helperId))
      } else {
        toast.error(data.error || "Failed to reject verification")
      }
    } catch (error) {
      console.error("Error rejecting verification:", error)
      toast.error("An error occurred")
    }
  }

  const handleViewDetails = (helper: Helper) => {
    setSelectedHelper(helper)
    setIsDetailDialogOpen(true)
  }

  const filteredHelpers = helpers.filter(
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
          <p className="mt-4 text-muted-foreground">Loading verification requests...</p>
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
          <h1 className="text-3xl font-bold">Helper Verification</h1>
          <p className="text-muted-foreground">Review and verify helper verification requests</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Helper Cards */}
        {filteredHelpers.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="rounded-full bg-muted p-6">
                <Shield className="h-12 w-12 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">No Pending Verifications</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? "No helpers match your search." : "All verification requests have been reviewed."}
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredHelpers.map((helper, index) => (
              <Card 
                key={helper._id} 
                className="p-6 shadow-xl transition-all duration-300 hover:shadow-2xl animate-fade-in-up"
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
                  </div>

                  <div className="flex gap-2 w-full">
                    <Button
                      onClick={() => handleVerify(helper._id)}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Verify
                    </Button>
                    
                    <Button
                      onClick={() => handleReject(helper._id)}
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>

                  <Button
                    onClick={() => handleViewDetails(helper)}
                    variant="outline"
                    className="w-full"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Documents
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Details Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Verification Documents</DialogTitle>
              <DialogDescription>
                Review the submitted verification documents
              </DialogDescription>
            </DialogHeader>

            {selectedHelper && (
              <div className="space-y-6">
                {/* Profile Section */}
                <div className="flex items-center gap-4 pb-4 border-b">
                  <Avatar className="h-20 w-20 border-2 border-border">
                    <AvatarImage src={selectedHelper.profilePhoto} alt={selectedHelper.name} />
                    <AvatarFallback className="text-2xl">
                      {selectedHelper.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold">{selectedHelper.name}</h3>
                      <VerifiedBadge isVerified={selectedHelper.isVerified} size="md" />
                    </div>
                    <p className="text-sm text-muted-foreground">{selectedHelper.email}</p>
                  </div>
                </div>

                {/* NID Information */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    National ID Information
                  </h4>
                  <div className="grid gap-3 ml-6">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">NID Number</Label>
                      <p className="text-sm font-mono">{selectedHelper.helperProfile?.nidNumber}</p>
                    </div>
                    {selectedHelper.helperProfile?.nidPhoto && (
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">NID Photo</Label>
                        <div className="mt-2 border rounded-lg overflow-hidden w-full">
                          <img 
                            src={selectedHelper.helperProfile.nidPhoto} 
                            alt="NID Photo" 
                            className="w-full h-auto object-contain"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Certificates */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Certificates & Licenses
                  </h4>
                  <div className="grid grid-cols-2 gap-4 ml-6">
                    {selectedHelper.helperProfile?.verificationDocuments?.map((doc, index) => (
                      <div key={index} className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Certificate {index + 1}</Label>
                        <div className="border rounded-lg overflow-hidden">
                          <img 
                            src={doc} 
                            alt={`Certificate ${index + 1}`} 
                            className="w-full h-auto object-contain"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    onClick={() => {
                      handleVerify(selectedHelper._id)
                      setIsDetailDialogOpen(false)
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Verify Helper
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
                    Reject Verification
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
