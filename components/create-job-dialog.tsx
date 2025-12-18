"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Upload, X, MapPin, DollarSign, Image as ImageIcon } from "lucide-react"
import { toast } from "react-hot-toast"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

interface CreateJobDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onJobCreated?: () => void
}

const categories = [
  "Plumbing",
  "Electrical",
  "Cleaning",
  "Carpentry",
  "Painting",
  "Moving",
  "Delivery",
  "Tutoring",
  "Gardening",
  "Handyman",
  "Other",
]

export function CreateJobDialog({ open, onOpenChange, onJobCreated }: CreateJobDialogProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    budgetMin: "",
    budgetMax: "",
    images: [] as File[],
  })

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const currentImages = formData.images.length
    const remainingSlots = 5 - currentImages

    if (files.length > remainingSlots) {
      toast.error(`You can only upload ${remainingSlots} more image(s). Maximum 5 images allowed.`)
      return
    }

    const newImages = [...formData.images, ...files]
    setFormData({ ...formData, images: newImages })

    // Create previews
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index)
    const newPreviews = imagePreviews.filter((_, i) => i !== index)
    setFormData({ ...formData, images: newImages })
    setImagePreviews(newPreviews)
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

    if (!formData.title || !formData.description || !formData.category || !formData.location) {
      toast.error("Please fill in all required fields")
      return
    }

    if (!formData.budgetMin || !formData.budgetMax) {
      toast.error("Please provide budget range")
      return
    }

    const budgetMin = parseFloat(formData.budgetMin)
    const budgetMax = parseFloat(formData.budgetMax)

    if (budgetMin <= 0 || budgetMax <= 0 || budgetMax < budgetMin) {
      toast.error("Invalid budget range")
      return
    }

    setIsLoading(true)
    const uploadToast = toast.loading("Creating job post...")

    try {
      // Upload images to Cloudinary in parallel
      let photoUrls: string[] = []
      if (formData.images.length > 0) {
        toast.loading("Uploading images...", { id: uploadToast })
        photoUrls = await Promise.all(formData.images.map((img) => uploadToCloudinary(img)))
      }

      toast.loading("Posting job...", { id: uploadToast })

      // Create job post
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          location: formData.location,
          budgetMin,
          budgetMax,
          photos: photoUrls,
        }),
      })

      const data = await response.json()
      toast.dismiss(uploadToast)

      if (response.ok) {
        toast.success("Job posted successfully!")
        onOpenChange(false)
        // Reset form
        setFormData({
          title: "",
          description: "",
          category: "",
          location: "",
          budgetMin: "",
          budgetMax: "",
          images: [],
        })
        setImagePreviews([])
        
        // Notify parent to refresh data
        if (onJobCreated) {
          onJobCreated()
        }
      } else {
        toast.error(data.error || "Failed to post job")
      }
    } catch (error) {
      console.error("Error creating job:", error)
      toast.dismiss(uploadToast)
      toast.error("An error occurred while posting job")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">Post a New Job</DialogTitle>
            <Avatar 
              className="h-10 w-10 cursor-pointer ring-2 ring-transparent transition-all duration-300 hover:ring-primary"
              onClick={() => {
                onOpenChange(false)
                router.push("/profile")
              }}
            >
              <AvatarImage
                src={session?.user?.profilePhoto || "/placeholder.svg?height=40&width=40"}
                alt={session?.user?.name || "User"}
              />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {session?.user?.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Job Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Need plumber for leaking pipe"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe the job in detail..."
              className="min-h-[120px]"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="location"
                  placeholder="e.g., Downtown, Main Street"
                  className="pl-10"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Budget Range (BDT) *</Label>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="budgetMin"
                  type="number"
                  placeholder="Minimum (e.g., 500)"
                  className="pl-10"
                  min="1"
                  required
                  value={formData.budgetMin}
                  onChange={(e) => setFormData({ ...formData, budgetMin: e.target.value })}
                />
              </div>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="budgetMax"
                  type="number"
                  placeholder="Maximum (e.g., 1500)"
                  className="pl-10"
                  min="1"
                  required
                  value={formData.budgetMax}
                  onChange={(e) => setFormData({ ...formData, budgetMax: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="images">Attach Photos (Optional, Max 5)</Label>
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-3">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="h-24 w-full rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute right-1 top-1 rounded-full bg-destructive p-1 text-destructive-foreground opacity-0 transition-all group-hover:opacity-100 hover:scale-110"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {formData.images.length < 5 && (
              <label
                htmlFor="images"
                className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-6 transition-colors hover:border-primary hover:bg-muted/50"
              >
                <ImageIcon className="mb-2 h-8 w-8 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {formData.images.length > 0 ? "Add more photos" : "Click to upload photos"}
                </span>
                <span className="text-xs text-muted-foreground">
                  PNG, JPG up to 10MB ({formData.images.length}/5)
                </span>
              </label>
            )}
            <input
              id="images"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImagesChange}
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              {isLoading ? "Posting..." : "Post Job"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
