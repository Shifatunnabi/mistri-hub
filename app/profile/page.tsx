"use client"

import type React from "react"

import { useState } from "react"
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
  Clock,
  MapPinned,
  FileText,
} from "lucide-react"
import { toast } from "react-hot-toast"

// Mock user data
const mockUser = {
  name: "Sarah Johnson",
  email: "sarah.johnson@example.com",
  phone: "+1 234 567 8900",
  address: "123 Main Street, Downtown",
  avatar: "/placeholder.svg?key=currentuser",
  role: "Help Seeker",
  memberSince: "January 2024",
  jobsPosted: 12,
  jobsCompleted: 8,
  // Helper specific fields (if registered as helper)
  isHelper: false,
  helperProfile: {
    primarySkills: "",
    experience: 0,
    serviceAreas: "",
    nidNumber: "",
    rating: 0,
    reviewsCount: 0,
    hourlyRate: 0,
  },
}

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showHelperUpgrade, setShowHelperUpgrade] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(mockUser.avatar)
  const [formData, setFormData] = useState({
    name: mockUser.name,
    email: mockUser.email,
    phone: mockUser.phone,
    address: mockUser.address,
    photo: null as File | null,
  })

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, photo: file })
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => {
      toast.success("Profile updated successfully!")
      setIsEditing(false)
      setIsSaving(false)
    }, 1500)
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
              <div className="relative h-32 bg-gradient-to-br from-primary to-accent"></div>
              <div className="relative px-6 pb-6">
                <div className="relative -mt-16 mb-4">
                  <Avatar className="h-32 w-32 border-4 border-card ring-4 ring-border">
                    <AvatarImage src={photoPreview || mockUser.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-primary text-4xl text-primary-foreground">
                      {mockUser.name.charAt(0)}
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
                    <h2 className="text-2xl font-bold">{mockUser.name}</h2>
                    <Badge className="mt-2">{mockUser.role}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Member since {mockUser.memberSince}</p>
                </div>
              </div>
            </Card>

            {/* Stats Card */}
            <Card className="p-6 shadow-xl animate-fade-in-up animation-delay-200">
              <h3 className="mb-4 font-bold">Activity Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">Jobs Posted</span>
                  </div>
                  <span className="font-bold">{mockUser.jobsPosted}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Jobs Completed</span>
                  </div>
                  <span className="font-bold">{mockUser.jobsCompleted}</span>
                </div>
                {mockUser.isHelper && (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <Star className="h-4 w-4" />
                        <span className="text-sm">Rating</span>
                      </div>
                      <span className="font-bold">{mockUser.helperProfile.rating}/5</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span className="text-sm">Reviews</span>
                      </div>
                      <span className="font-bold">{mockUser.helperProfile.reviewsCount}</span>
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* Upgrade to Helper */}
            {!mockUser.isHelper && (
              <Card className="overflow-hidden p-6 shadow-xl animate-fade-in-up animation-delay-300">
                <div className="mb-4 space-y-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
                    <Briefcase className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold">Become a Helper</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Start earning by helping others with your skills. Register as a helper today!
                  </p>
                </div>
                <Button
                  onClick={() => setShowHelperUpgrade(true)}
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90 transition-all duration-300 hover:scale-105"
                >
                  Register as Helper
                </Button>
              </Card>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="personal" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="personal">Personal Info</TabsTrigger>
                <TabsTrigger value="helper" disabled={!mockUser.isHelper && !showHelperUpgrade}>
                  Helper Profile
                </TabsTrigger>
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
                              name: mockUser.name,
                              email: mockUser.email,
                              phone: mockUser.phone,
                              address: mockUser.address,
                              photo: null,
                            })
                            setPhotoPreview(mockUser.avatar)
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
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          disabled={!isEditing}
                          className="pl-10"
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
                          className="pl-10 min-h-[80px]"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Helper Profile Tab */}
              <TabsContent value="helper">
                {showHelperUpgrade ? (
                  <HelperUpgradeForm onCancel={() => setShowHelperUpgrade(false)} />
                ) : (
                  <Card className="shadow-xl animate-fade-in-up">
                    <div className="border-b border-border p-6">
                      <h3 className="text-xl font-bold">Helper Profile</h3>
                      <p className="text-sm text-muted-foreground">Your professional information</p>
                    </div>
                    <div className="p-6">
                      <p className="text-center text-muted-foreground">Register as a helper to access this section</p>
                    </div>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}

function HelperUpgradeForm({ onCancel }: { onCancel: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [nidPhotoPreview, setNidPhotoPreview] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    photo: null as File | null,
    primarySkills: "",
    experience: "",
    serviceAreas: "",
    nidNumber: "",
    nidPhoto: null as File | null,
  })

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, photo: file })
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleNidPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, nidPhoto: file })
      const reader = new FileReader()
      reader.onloadend = () => {
        setNidPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setTimeout(() => {
      toast.success("Helper registration submitted! Awaiting verification.")
      setIsSubmitting(false)
    }, 1500)
  }

  return (
    <Card className="shadow-xl animate-fade-in-up">
      <div className="border-b border-border bg-accent/5 p-6">
        <h3 className="text-xl font-bold">Register as Helper</h3>
        <p className="text-sm text-muted-foreground">Complete your helper profile to start earning</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 p-6">
        <div className="space-y-2">
          <Label htmlFor="helper-photo">Profile Photo *</Label>
          <div className="flex items-center space-x-4">
            {photoPreview && (
              <img
                src={photoPreview || "/placeholder.svg"}
                alt="Preview"
                className="h-20 w-20 rounded-lg object-cover ring-2 ring-border"
              />
            )}
            <label
              htmlFor="helper-photo"
              className="flex cursor-pointer items-center space-x-2 rounded-lg border-2 border-dashed border-border px-4 py-3 transition-colors hover:border-primary"
            >
              <Upload className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Upload Photo</span>
            </label>
            <input
              id="helper-photo"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="primarySkills">Primary Skills *</Label>
          <div className="relative">
            <Briefcase className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Textarea
              id="primarySkills"
              placeholder="e.g., Plumbing, Electrical Work, Carpentry"
              className="pl-10 min-h-[80px]"
              required
              value={formData.primarySkills}
              onChange={(e) => setFormData({ ...formData, primarySkills: e.target.value })}
            />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="experience">Experience (Years) *</Label>
            <Input
              id="experience"
              type="number"
              placeholder="5"
              min="0"
              required
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="serviceAreas">Service Areas *</Label>
            <div className="relative">
              <MapPinned className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="serviceAreas"
                placeholder="Downtown, Suburbs"
                className="pl-10"
                required
                value={formData.serviceAreas}
                onChange={(e) => setFormData({ ...formData, serviceAreas: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="nidNumber">NID Number *</Label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="nidNumber"
                placeholder="123456789"
                className="pl-10"
                required
                value={formData.nidNumber}
                onChange={(e) => setFormData({ ...formData, nidNumber: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nidPhoto">NID Photo *</Label>
            <div className="flex items-center space-x-4">
              {nidPhotoPreview && (
                <img
                  src={nidPhotoPreview || "/placeholder.svg"}
                  alt="NID Preview"
                  className="h-12 w-20 rounded object-cover ring-2 ring-border"
                />
              )}
              <label
                htmlFor="nidPhoto"
                className="flex cursor-pointer items-center space-x-2 rounded-lg border-2 border-dashed border-border px-4 py-2 transition-colors hover:border-primary"
              >
                <Upload className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Upload</span>
              </label>
              <input
                id="nidPhoto"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleNidPhotoChange}
                required
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-accent text-accent-foreground hover:bg-accent/90 transition-all duration-300 hover:scale-105"
          >
            {isSubmitting ? "Submitting..." : "Submit for Verification"}
          </Button>
        </div>
      </form>
    </Card>
  )
}
