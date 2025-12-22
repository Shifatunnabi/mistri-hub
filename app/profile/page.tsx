"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Star,
  Briefcase,
  Upload,
  Edit,
  CheckCircle,
  Lock,
  Shield,
} from "lucide-react"
import { toast } from "react-hot-toast"
import { VerifiedBadge } from "@/components/verified-badge"
import { PostedJobsTab } from "@/components/profile/posted-jobs-tab"

interface UserData {
  _id: string
  name: string
  email: string
  phone: string
  address: string
  role: string
  profilePhoto?: string
  isApproved: boolean
  isVerified: boolean
  verificationStatus?: string
  createdAt: string
  helperProfile?: {
    skills: string[]
    rating: number
    totalReviews: number
    completedJobs: number
    nidNumber?: string
    nidPhoto?: string
    verificationDocuments: string[]
  }
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [isSubmittingVerification, setIsSubmittingVerification] = useState(false)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [postedJobs, setPostedJobs] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [isLoadingJobs, setIsLoadingJobs] = useState(false)
  const [isLoadingReviews, setIsLoadingReviews] = useState(false)
  
  // Verification form state
  const [verificationForm, setVerificationForm] = useState({
    nidNumber: "",
    nidPhoto: null as File | null,
    certificates: [] as File[],
  })
  const [nidPhotoPreview, setNidPhotoPreview] = useState<string | null>(null)
  const [certificatePreviews, setCertificatePreviews] = useState<string[]>([])
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  })

  // Redirect if not logged in
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (status === "authenticated") {
        try {
          const response = await fetch("/api/user/profile")
          const data = await response.json()

          if (response.ok) {
            setUserData(data.user)
            setFormData({
              name: data.user.name,
              phone: data.user.phone,
              address: data.user.address,
              currentPassword: "",
              newPassword: "",
              confirmNewPassword: "",
            })
            setPhotoPreview(data.user.profilePhoto || null)
          } else {
            toast.error("Failed to load profile")
          }
        } catch (error) {
          console.error("Error fetching profile:", error)
          toast.error("An error occurred")
        } finally {
          setIsLoading(false)
        }
      }
    }

    fetchUserData()
  }, [status])

  // Fetch posted jobs
  const fetchPostedJobs = async () => {
    if (!userData?._id) return
    
    setIsLoadingJobs(true)
    try {
      const response = await fetch(`/api/jobs?helpSeeker=${userData._id}`)
      const data = await response.json()
      
      if (response.ok) {
        setPostedJobs(data.jobs || [])
      }
    } catch (error) {
      console.error("Error fetching posted jobs:", error)
    } finally {
      setIsLoadingJobs(false)
    }
  }

  // Fetch reviews for helper
  const fetchReviews = async () => {
    if (!userData?._id || userData.role !== "HELPER") return
    
    setIsLoadingReviews(true)
    try {
      const response = await fetch(`/api/reviews?helperId=${userData._id}`)
      const data = await response.json()
      
      if (response.ok) {
        setReviews(data.reviews || [])
      }
    } catch (error) {
      console.error("Error fetching reviews:", error)
    } finally {
      setIsLoadingReviews(false)
    }
  }

  // Fetch jobs and reviews when userData is available
  useEffect(() => {
    if (userData) {
      fetchPostedJobs()
      if (userData.role === "HELPER") {
        fetchReviews()
      }
    }
  }, [userData])

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Show preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload to server
    setIsUploadingPhoto(true)
    const formData = new FormData()
    formData.append("photo", file)

    try {
      const response = await fetch("/api/user/upload-photo", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Profile photo updated!")
        setUserData(data.user)
        // Update session with new photo
        await fetch("/api/auth/session?update=true")
        window.location.reload() // Reload to update session across all components
      } else {
        toast.error(data.error || "Failed to upload photo")
        setPhotoPreview(userData?.profilePhoto || null)
      }
    } catch (error) {
      console.error("Error uploading photo:", error)
      toast.error("Failed to upload photo")
      setPhotoPreview(userData?.profilePhoto || null)
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  const handleSave = async () => {
    // Validate password fields
    if (formData.newPassword) {
      if (!formData.currentPassword) {
        toast.error("Please enter your current password")
        return
      }
      if (formData.newPassword !== formData.confirmNewPassword) {
        toast.error("New passwords do not match")
        return
      }
      if (formData.newPassword.length < 6) {
        toast.error("Password must be at least 6 characters")
        return
      }
    }

    setIsSaving(true)

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          currentPassword: formData.currentPassword || undefined,
          newPassword: formData.newPassword || undefined,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Profile updated successfully!")
        setUserData(data.user)
        setIsEditing(false)
        // Clear password fields
        setFormData({
          ...formData,
          currentPassword: "",
          newPassword: "",
          confirmNewPassword: "",
        })
      } else {
        toast.error(data.error || "Failed to update profile")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("An error occurred")
    } finally {
      setIsSaving(false)
    }
  }

  const handleNidPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setVerificationForm({ ...verificationForm, nidPhoto: file })
      const reader = new FileReader()
      reader.onloadend = () => {
        setNidPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCertificateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      const newCertificates = [...verificationForm.certificates, ...files]
      setVerificationForm({ ...verificationForm, certificates: newCertificates })
      
      // Create previews
      const newPreviews: string[] = []
      files.forEach(file => {
        const reader = new FileReader()
        reader.onloadend = () => {
          newPreviews.push(reader.result as string)
          if (newPreviews.length === files.length) {
            setCertificatePreviews([...certificatePreviews, ...newPreviews])
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removeCertificate = (index: number) => {
    const newCertificates = verificationForm.certificates.filter((_, i) => i !== index)
    const newPreviews = certificatePreviews.filter((_, i) => i !== index)
    setVerificationForm({ ...verificationForm, certificates: newCertificates })
    setCertificatePreviews(newPreviews)
  }

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formDataUpload = new FormData()
    formDataUpload.append("photo", file)

    const response = await fetch("/api/upload/photo", {
      method: "POST",
      body: formDataUpload,
    })

    if (!response.ok) {
      throw new Error("Failed to upload image")
    }

    const data = await response.json()
    return data.photoUrl
  }

  const handleSubmitVerification = async () => {
    if (!verificationForm.nidNumber || !verificationForm.nidPhoto || verificationForm.certificates.length === 0) {
      toast.error("Please fill all required fields (NID number, NID photo, and at least one certificate)")
      return
    }

    setIsSubmittingVerification(true)
    const uploadToast = toast.loading("Uploading documents...")

    try {
      // Upload all files in parallel for better performance
      const [nidPhotoUrl, ...certificateUrls] = await Promise.all([
        uploadToCloudinary(verificationForm.nidPhoto),
        ...verificationForm.certificates.map(cert => uploadToCloudinary(cert))
      ])

      toast.dismiss(uploadToast)
      toast.loading("Submitting verification request...")

      // Submit verification request
      const response = await fetch("/api/helper/verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nidNumber: verificationForm.nidNumber,
          nidPhoto: nidPhotoUrl,
          certificates: certificateUrls,
        }),
      })

      const data = await response.json()
      toast.dismiss()

      if (response.ok) {
        toast.success("Verification documents submitted successfully! Awaiting admin review.")
        // Refresh user data
        const userResponse = await fetch("/api/user/profile")
        const userData = await userResponse.json()
        if (userResponse.ok) {
          setUserData(userData.user)
        }
        // Clear form
        setVerificationForm({
          nidNumber: "",
          nidPhoto: null,
          certificates: [],
        })
        setNidPhotoPreview(null)
        setCertificatePreviews([])
      } else {
        toast.error(data.error || "Failed to submit verification")
      }
    } catch (error) {
      console.error("Error submitting verification:", error)
      toast.dismiss(uploadToast)
      toast.error("An error occurred while submitting verification")
    } finally {
      setIsSubmittingVerification(false)
    }
  }

  if (isLoading || !userData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">Manage your account information and settings</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card className="overflow-hidden shadow-xl animate-fade-in-up">
              <div className="relative h-32 bg-linear-to-br from-primary to-accent"></div>
              <div className="relative px-6 pb-6">
                <div className="relative -mt-16 mb-4">
                  <Avatar className="h-32 w-32 border-4 border-card ring-4 ring-border">
                    <AvatarImage src={photoPreview || "/placeholder.svg"} />
                    <AvatarFallback className="bg-primary text-4xl text-primary-foreground">
                      {userData.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <label
                      htmlFor="photo-upload"
                      className="absolute bottom-2 right-2 cursor-pointer rounded-full bg-primary p-2 text-primary-foreground transition-transform hover:scale-110"
                    >
                      <Upload className="h-4 w-4" />
                      <input
                        id="photo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoChange}
                      />
                    </label>
                  )}
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-bold">{userData.name}</h2>
                      {userData.role === "HELPER" && <VerifiedBadge isVerified={userData.isVerified} size="lg" />}
                    </div>
                    <Badge className="mt-2">
                      {userData.role === "HELP_SEEKER" ? "Help Seeker" : userData.role === "HELPER" ? "Helper" : "Admin"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Member since {new Date(userData.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </p>
                </div>
              </div>
            </Card>

            {/* Stats Card */}
            <Card className="p-6 shadow-xl animate-fade-in-up animation-delay-200">
              <h3 className="mb-4 font-bold">Activity Stats</h3>
              <div className="space-y-4">
                {userData.role === "HELPER" && userData.isApproved && (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <Star className="h-4 w-4" />
                        <span className="text-sm">Rating</span>
                      </div>
                      <span className="font-bold">{userData.helperProfile?.rating || 0}/5</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <Briefcase className="h-4 w-4" />
                        <span className="text-sm">Completed Jobs</span>
                      </div>
                      <span className="font-bold">{userData.helperProfile?.completedJobs || 0}</span>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="personal" className="space-y-6">
              <TabsList className={`grid w-full ${userData.role === "HELPER" ? "grid-cols-3" : "grid-cols-2"}`}>
                <TabsTrigger value="personal">Personal Info</TabsTrigger>
                <TabsTrigger value="posted-jobs">Posted Jobs</TabsTrigger>
                {userData.role === "HELPER" && (
                  <TabsTrigger value="helper">
                    Helper Profile
                  </TabsTrigger>
                )}
              </TabsList>

              {/* Personal Information Tab */}
              <TabsContent value="personal">
                <Card className="shadow-xl animate-fade-in-up">
                  <div className="flex items-center justify-between border-b border-border p-6">
                    <div>
                      <h3 className="text-xl font-bold">Personal Information</h3>
                      <p className="text-sm text-muted-foreground">Update your personal details</p>
                    </div>
                    {!isEditing ? (
                      <Button
                        onClick={() => setIsEditing(true)}
                        variant="outline"
                        className="transition-all duration-300 hover:scale-105"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    ) : (
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => {
                            setIsEditing(false)
                            setFormData({
                              name: userData.name,
                              phone: userData.phone,
                              address: userData.address,
                              currentPassword: "",
                              newPassword: "",
                              confirmNewPassword: "",
                            })
                            setPhotoPreview(userData.profilePhoto || null)
                          }}
                          variant="outline"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSave}
                          disabled={isSaving}
                          className="transition-all duration-300 hover:scale-105"
                        >
                          {isSaving ? "Saving..." : "Save"}
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-6 p-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          disabled={!isEditing}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          value={userData.email}
                          disabled={true}
                          className="pl-10 bg-muted cursor-not-allowed"
                          title="Email cannot be changed"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          disabled={!isEditing}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                        <Textarea
                          id="address"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          disabled={!isEditing}
                          className="pl-10 min-h-20"
                        />
                      </div>
                    </div>

                    {isEditing && (
                      <>
                        <div className="border-t pt-6 space-y-2">
                          <h4 className="font-semibold flex items-center gap-2">
                            <Lock className="h-4 w-4" />
                            Change Password (Optional)
                          </h4>
                          <p className="text-sm text-muted-foreground">Leave blank to keep current password</p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="currentPassword">Current Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="currentPassword"
                              type="password"
                              value={formData.currentPassword}
                              onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                              className="pl-10"
                              placeholder="Enter current password"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="newPassword">New Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="newPassword"
                              type="password"
                              value={formData.newPassword}
                              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                              className="pl-10"
                              placeholder="Enter new password (min 6 characters)"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="confirmNewPassword"
                              type="password"
                              value={formData.confirmNewPassword}
                              onChange={(e) => setFormData({ ...formData, confirmNewPassword: e.target.value })}
                              className="pl-10"
                              placeholder="Confirm new password"
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </Card>
              </TabsContent>

              {/* Posted Jobs Tab */}
              <TabsContent value="posted-jobs">
                <Card className="shadow-xl animate-fade-in-up">
                  <div className="border-b border-border p-6">
                    <h3 className="text-xl font-bold">My Posted Jobs</h3>
                    <p className="text-sm text-muted-foreground">Jobs you have posted</p>
                  </div>
                  <div className="p-6">
                    <PostedJobsTab 
                      jobs={postedJobs} 
                      isLoading={isLoadingJobs}
                      onJobUpdated={fetchPostedJobs}
                    />
                  </div>
                </Card>
              </TabsContent>

              {/* Helper Profile Tab - Only visible for HELPER role */}
              {userData.role === "HELPER" && (
                <TabsContent value="helper">
                  <div className="space-y-6">
                    {/* Helper Info Card */}
                    <Card className="shadow-xl animate-fade-in-up">
                      <div className="border-b border-border p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-xl font-bold">Helper Profile</h3>
                            <p className="text-sm text-muted-foreground">Your professional information</p>
                          </div>
                          <div className="flex gap-2">
                            {!userData.isApproved && (
                              <Badge variant="outline" className="flex items-center gap-1">
                                Pending Approval
                              </Badge>
                            )}
                            {userData.isVerified && (
                              <Badge variant="default" className="flex items-center gap-1">
                                <Shield className="h-3 w-3" />
                                Verified
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="p-6 space-y-6">
                        <div className="space-y-2">
                          <Label>Skills</Label>
                          <div className="flex flex-wrap gap-2">
                            {userData.helperProfile?.skills && userData.helperProfile.skills.length > 0 ? (
                              userData.helperProfile.skills.map((skill, index) => (
                                <Badge key={index} variant="secondary">
                                  {skill}
                                </Badge>
                              ))
                            ) : (
                              <p className="text-sm text-muted-foreground">No skills added yet</p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Rating</Label>
                            <div className="flex items-center gap-2">
                              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                              <span className="text-2xl font-bold">
                                {userData.helperProfile?.rating || 0}/5
                              </span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Completed Jobs</Label>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-5 w-5 text-green-500" />
                              <span className="text-2xl font-bold">
                                {userData.helperProfile?.completedJobs || 0}
                              </span>
                            </div>
                          </div>
                        </div>

                        {!userData.isApproved && (
                          <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                              Your helper account is pending admin approval. You will receive an email once your account is approved.
                            </p>
                          </div>
                        )}
                      </div>
                    </Card>

                    {/* Verification Documents Card - Only for approved helpers */}
                    {userData.isApproved && (
                      <Card className="shadow-xl animate-fade-in-up">
                        <div className="border-b border-border p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-xl font-bold">Verification Documents</h3>
                              <p className="text-sm text-muted-foreground">
                                Submit documents to get verified and apply for jobs
                              </p>
                            </div>
                            {userData.isVerified ? (
                              <Badge variant="default" className="flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                Verified
                              </Badge>
                            ) : userData.verificationStatus === "pending" ? (
                              <Badge variant="outline" className="flex items-center gap-2">
                                <Upload className="h-4 w-4" />
                                Pending Review
                              </Badge>
                            ) : (
                              <Badge variant="outline">Not Verified</Badge>
                            )}
                          </div>
                        </div>
                        <div className="p-6 space-y-6">
                          {userData.isVerified ? (
                            <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-4">
                              <div className="flex gap-3">
                                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                                <div>
                                  <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                                    Your account is verified!
                                  </h4>
                                  <p className="text-sm text-green-800 dark:text-green-200">
                                    You can now apply for jobs on the platform. Your verified badge will be displayed on your profile.
                                  </p>
                                </div>
                              </div>
                            </div>
                          ) : userData.verificationStatus === "pending" ? (
                            <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                              <div className="flex gap-3">
                                <Upload className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                                <div>
                                  <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                                    Verification Pending
                                  </h4>
                                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                    Your verification documents have been submitted and are under review. You will be notified once the review is complete.
                                  </p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                <div className="flex gap-3">
                                  <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                  <div>
                                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                                      Get Verified to Apply for Jobs
                                    </h4>
                                    <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                                      You must complete verification to apply for jobs. Submit the required documents below:
                                    </p>
                                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                                      <li>• National ID (NID) number (Required)</li>
                                      <li>• NID photo (Required)</li>
                                      <li>• At least one certificate or license (Required)</li>
                                    </ul>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="nidNumber">NID Number *</Label>
                                  <Input
                                    id="nidNumber"
                                    placeholder="Enter your NID number"
                                    value={verificationForm.nidNumber}
                                    onChange={(e) => setVerificationForm({ ...verificationForm, nidNumber: e.target.value })}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label>NID Photo *</Label>
                                  {nidPhotoPreview ? (
                                    <div className="relative border rounded-lg overflow-hidden">
                                      <img src={nidPhotoPreview} alt="NID Preview" className="w-full h-48 object-contain" />
                                      <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        className="absolute top-2 right-2"
                                        onClick={() => {
                                          setVerificationForm({ ...verificationForm, nidPhoto: null })
                                          setNidPhotoPreview(null)
                                        }}
                                      >
                                        Remove
                                      </Button>
                                    </div>
                                  ) : (
                                    <label htmlFor="nidPhoto" className="border-2 border-dashed border-border rounded-lg p-6 hover:border-primary transition-colors cursor-pointer flex flex-col items-center">
                                      <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                                      <span className="text-sm font-medium">Click to upload NID photo</span>
                                      <span className="text-xs text-muted-foreground mt-1">JPG, PNG (Max 5MB)</span>
                                      <input
                                        id="nidPhoto"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleNidPhotoChange}
                                      />
                                    </label>
                                  )}
                                </div>

                                <div className="space-y-2">
                                  <Label>Certificates / Licenses * (At least one required)</Label>
                                  <p className="text-xs text-muted-foreground">
                                    Upload certificates related to your skills (e.g., plumbing license, electrical certificate)
                                  </p>
                                  
                                  {certificatePreviews.length > 0 && (
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                      {certificatePreviews.map((preview, index) => (
                                        <div key={index} className="relative border rounded-lg overflow-hidden">
                                          <img src={preview} alt={`Certificate ${index + 1}`} className="w-full h-32 object-cover" />
                                          <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            className="absolute top-2 right-2"
                                            onClick={() => removeCertificate(index)}
                                          >
                                            Remove
                                          </Button>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  <label htmlFor="certificates" className="border-2 border-dashed border-border rounded-lg p-6 hover:border-primary transition-colors cursor-pointer flex flex-col items-center">
                                    <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                                    <span className="text-sm font-medium">
                                      {certificatePreviews.length > 0 ? "Add another certificate" : "Click to upload certificates"}
                                    </span>
                                    <span className="text-xs text-muted-foreground mt-1">JPG, PNG, PDF (Max 5MB each)</span>
                                    <input
                                      id="certificates"
                                      type="file"
                                      accept="image/*,.pdf"
                                      multiple
                                      className="hidden"
                                      onChange={handleCertificateChange}
                                    />
                                  </label>
                                </div>

                                <Button
                                  onClick={handleSubmitVerification}
                                  disabled={isSubmittingVerification}
                                  className="w-full"
                                >
                                  {isSubmittingVerification ? "Submitting..." : "Submit for Verification"}
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      </Card>
                    )}

                    {/* Reviews Section */}
                    {userData.isVerified && (
                      <Card className="shadow-xl animate-fade-in-up">
                        <div className="border-b border-border p-6">
                          <h3 className="text-xl font-bold">Reviews</h3>
                          <p className="text-sm text-muted-foreground">
                            {reviews.length} review{reviews.length !== 1 ? 's' : ''} from help seekers
                          </p>
                        </div>
                        <div className="p-6">
                          {isLoadingReviews ? (
                            <div className="flex items-center justify-center py-12">
                              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                            </div>
                          ) : reviews.length > 0 ? (
                            <div className="space-y-4">
                              {reviews.map((review: any, index: number) => (
                                <Card key={review._id || index} className="p-4">
                                  <div className="flex items-start gap-4">
                                    <Avatar className="h-10 w-10">
                                      <AvatarImage src={review.reviewer?.profilePhoto || "/placeholder.svg"} />
                                      <AvatarFallback>
                                        {review.reviewer?.name?.charAt(0) || 'U'}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 space-y-2">
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <p className="font-semibold">{review.reviewer?.name || 'Anonymous'}</p>
                                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            {review.job?.title && (
                                              <span>for "{review.job.title}"</span>
                                            )}
                                            <span>•</span>
                                            <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          {Array.from({ length: 5 }).map((_, i) => (
                                            <Star
                                              key={i}
                                              className={`h-4 w-4 ${
                                                i < review.rating
                                                  ? 'fill-yellow-400 text-yellow-400'
                                                  : 'text-muted-foreground'
                                              }`}
                                            />
                                          ))}
                                        </div>
                                      </div>
                                      <p className="text-sm text-muted-foreground leading-relaxed">
                                        {review.comment}
                                      </p>
                                    </div>
                                  </div>
                                </Card>
                              ))}
                            </div>
                          ) : (
                            <div className="py-12 text-center">
                              <Star className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                              <p className="mt-4 text-muted-foreground">No reviews yet</p>
                              <p className="text-sm text-muted-foreground">
                                Complete jobs to start receiving reviews
                              </p>
                            </div>
                          )}
                        </div>
                      </Card>
                    )}
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}


