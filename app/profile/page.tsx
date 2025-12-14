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
  createdAt: string
  helperProfile?: {
    nidNumber: string
    skills: string[]
    rating: number
    totalReviews: number
    completedJobs: number
  }
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
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
                    <h2 className="text-2xl font-bold">{userData.name}</h2>
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
              <TabsList className={`grid w-full ${userData.role === "HELPER" ? "grid-cols-2" : "grid-cols-1"}`}>
                <TabsTrigger value="personal">Personal Info</TabsTrigger>
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
                          <Label>NID Number</Label>
                          <Input
                            value={userData.helperProfile?.nidNumber || "Not provided"}
                            disabled
                            className="bg-muted"
                          />
                        </div>

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
                              <h3 className="text-xl font-bold">Verification Badge</h3>
                              <p className="text-sm text-muted-foreground">
                                Upload documents to get verified and increase trust
                              </p>
                            </div>
                            {userData.isVerified ? (
                              <Badge variant="default" className="flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                Verified
                              </Badge>
                            ) : (
                              <Badge variant="outline">Not Verified</Badge>
                            )}
                          </div>
                        </div>
                        <div className="p-6 space-y-6">
                          {!userData.isVerified ? (
                            <>
                              <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                <div className="flex gap-3">
                                  <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                  <div>
                                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                                      Why get verified?
                                    </h4>
                                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                                      <li>• Increase your profile visibility</li>
                                      <li>• Build trust with clients</li>
                                      <li>• Get more job opportunities</li>
                                      <li>• Stand out from other helpers</li>
                                    </ul>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="certificates">
                                    Certificates / Licenses (Optional)
                                  </Label>
                                  <p className="text-xs text-muted-foreground">
                                    Upload relevant certificates, licenses, or training documents
                                  </p>
                                  <div className="border-2 border-dashed border-border rounded-lg p-6 hover:border-primary transition-colors">
                                    <label
                                      htmlFor="certificates"
                                      className="flex flex-col items-center justify-center cursor-pointer"
                                    >
                                      <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                                      <span className="text-sm font-medium">Click to upload documents</span>
                                      <span className="text-xs text-muted-foreground mt-1">
                                        PDF, JPG, PNG (Max 5MB each)
                                      </span>
                                      <input
                                        id="certificates"
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        multiple
                                        className="hidden"
                                        onChange={(e) => {
                                          // Handle certificate upload
                                          toast.success("Certificate uploaded! Pending admin review.")
                                        }}
                                      />
                                    </label>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="portfolio">
                                    Portfolio / Work Samples (Optional)
                                  </Label>
                                  <p className="text-xs text-muted-foreground">
                                    Upload photos of your previous work
                                  </p>
                                  <div className="border-2 border-dashed border-border rounded-lg p-6 hover:border-primary transition-colors">
                                    <label
                                      htmlFor="portfolio"
                                      className="flex flex-col items-center justify-center cursor-pointer"
                                    >
                                      <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                                      <span className="text-sm font-medium">Click to upload photos</span>
                                      <span className="text-xs text-muted-foreground mt-1">
                                        JPG, PNG (Max 5MB each)
                                      </span>
                                      <input
                                        id="portfolio"
                                        type="file"
                                        accept=".jpg,.jpeg,.png"
                                        multiple
                                        className="hidden"
                                        onChange={(e) => {
                                          // Handle portfolio upload
                                          toast.success("Portfolio uploaded! Pending admin review.")
                                        }}
                                      />
                                    </label>
                                  </div>
                                </div>

                                <Button className="w-full" size="lg">
                                  <Shield className="mr-2 h-4 w-4" />
                                  Submit for Verification
                                </Button>
                              </div>
                            </>  
                          ) : (
                            <div className="text-center py-8">
                              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 mb-4">
                                <Shield className="h-8 w-8 text-green-600 dark:text-green-400" />
                              </div>
                              <h4 className="text-lg font-semibold mb-2">You are verified!</h4>
                              <p className="text-sm text-muted-foreground">
                                Your profile has been verified by our admin team.
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


