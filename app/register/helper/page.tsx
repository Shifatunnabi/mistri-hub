"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Upload,
  Briefcase,
  MapPinned,
  FileText,
} from "lucide-react"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"

export default function HelperRegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    photo: null as File | null,
    primarySkills: "",
    experience: "",
    serviceAreas: "",
    password: "",
    confirmPassword: "",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!")
      return
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    setIsLoading(true)

    try {
      // Upload profile photo to Cloudinary if provided
      let profilePhotoUrl = ""
      if (formData.photo) {
        try {
          toast.loading("Uploading profile photo...")
          profilePhotoUrl = await uploadToCloudinary(formData.photo)
          toast.dismiss()
        } catch (error) {
          toast.dismiss()
          toast.error("Failed to upload photo. Please try again.")
          setIsLoading(false)
          return
        }
      }

      const response = await fetch("/api/auth/register/helper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          profilePhoto: profilePhotoUrl,
          skills: formData.primarySkills.split(",").map(s => s.trim()).filter(s => s),
          experience: formData.experience,
          serviceAreas: formData.serviceAreas,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(
          data.message ||
            "Registration submitted! Your account is pending admin approval. You will receive an email once approved."
        )
        router.push("/login")
      } else {
        if (data.details) {
          // Show validation errors
          data.details.forEach((err: any) => {
            toast.error(err.message)
          })
        } else {
          toast.error(data.error || "Registration failed")
        }
      }
    } catch (error) {
      console.error("Helper registration error:", error)
      toast.error("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-3xl space-y-8 animate-fade-in-up">
        <div className="space-y-2">
          <Link
            href="/register"
            className="inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to role selection
          </Link>
          <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">Register as Helper</h1>
          <p className="text-muted-foreground">Create your profile to start earning with your skills</p>
        </div>

        <Card className="p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Basic Information</h3>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="name"
                      placeholder="John Doe"
                      className="pl-10"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className="pl-10"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 234 567 8900"
                      className="pl-10"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="address"
                      placeholder="123 Main St, City"
                      className="pl-10"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="photo">Profile Photo *</Label>
                <div className="flex items-center space-x-4">
                  {photoPreview && (
                    <img
                      src={photoPreview || "/placeholder.svg"}
                      alt="Preview"
                      className="h-20 w-20 rounded-lg object-cover ring-2 ring-border"
                    />
                  )}
                  <label
                    htmlFor="photo"
                    className="flex cursor-pointer items-center space-x-2 rounded-lg border-2 border-dashed border-border px-4 py-3 transition-colors hover:border-primary"
                  >
                    <Upload className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Upload Photo</span>
                  </label>
                  <input
                    id="photo"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="space-y-4 border-t border-border pt-6">
              <h3 className="text-lg font-bold">Professional Information</h3>

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

              <div className="grid gap-6 md:grid-cols-2">
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
            </div>

            {/* Password */}
            <div className="space-y-4 border-t border-border pt-6">
              <h3 className="text-lg font-bold">Security</h3>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                id="terms"
                className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                required
              />
              <Label htmlFor="terms" className="text-sm font-normal cursor-pointer leading-relaxed">
                I agree to the{" "}
                <Link href="/terms" className="font-medium text-primary hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="font-medium text-primary hover:underline">
                  Privacy Policy
                </Link>
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90 transition-all duration-300 hover:scale-105 hover:shadow-lg"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Create Helper Account"}
            </Button>
          </form>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary transition-colors hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
