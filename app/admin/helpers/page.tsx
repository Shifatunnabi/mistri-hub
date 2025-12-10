"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Search, CheckCircle, XCircle, Star, MapPin, Briefcase } from "lucide-react"
import Link from "next/link"
import { toast } from "react-hot-toast"

const mockHelpers = [
  {
    id: "1",
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "+1 234 567 8900",
    avatar: "/placeholder.svg?key=helper1",
    skills: "Plumbing, Repairs",
    experience: 5,
    serviceAreas: "Downtown, Suburbs",
    nidNumber: "123456789",
    rating: 4.8,
    reviewsCount: 45,
    status: "Pending",
    appliedDate: "2024-01-20",
  },
  {
    id: "2",
    name: "Maria Garcia",
    email: "maria.garcia@example.com",
    phone: "+1 234 567 8901",
    avatar: "/placeholder.svg?key=helper2",
    skills: "Plumbing, Installation",
    experience: 7,
    serviceAreas: "City Center, East Side",
    nidNumber: "987654321",
    rating: 4.9,
    reviewsCount: 78,
    status: "Verified",
    appliedDate: "2024-01-15",
  },
  {
    id: "3",
    name: "David Lee",
    email: "david.lee@example.com",
    phone: "+1 234 567 8902",
    avatar: "/placeholder.svg?key=helper3",
    skills: "General Repairs, Plumbing",
    experience: 3,
    serviceAreas: "West End, North District",
    nidNumber: "456789123",
    rating: 4.7,
    reviewsCount: 32,
    status: "Pending",
    appliedDate: "2024-01-18",
  },
]

export default function HelperManagementPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [helpers, setHelpers] = useState(mockHelpers)

  const handleVerify = (id: string) => {
    setHelpers(helpers.map((h) => (h.id === id ? { ...h, status: "Verified" } : h)))
    toast.success("Helper verified successfully!")
  }

  const handleReject = (id: string) => {
    setHelpers(helpers.map((h) => (h.id === id ? { ...h, status: "Rejected" } : h)))
    toast.error("Helper application rejected")
  }

  const filteredHelpers = helpers.filter(
    (helper) =>
      helper.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      helper.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

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

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Helper Management</h1>
            <p className="text-muted-foreground">Verify and manage helper applications</p>
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search helpers..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-6">
          {filteredHelpers.map((helper, index) => (
            <Card
              key={helper.id}
              className="overflow-hidden shadow-xl transition-all duration-300 hover:shadow-2xl animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="p-6">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  {/* Helper Info */}
                  <div className="flex flex-1 items-start space-x-4">
                    <Avatar className="h-16 w-16 ring-2 ring-border">
                      <AvatarImage src={helper.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                        {helper.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-3">
                      <div>
                        <div className="flex items-center space-x-3">
                          <h3 className="text-xl font-bold">{helper.name}</h3>
                          <Badge
                            className={
                              helper.status === "Verified"
                                ? "bg-green-500 text-white"
                                : helper.status === "Rejected"
                                  ? "bg-red-500 text-white"
                                  : "bg-yellow-500 text-white"
                            }
                          >
                            {helper.status}
                          </Badge>
                        </div>
                        {helper.status === "Verified" && (
                          <div className="mt-2 flex items-center space-x-1 text-sm">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{helper.rating}</span>
                            <span className="text-muted-foreground">({helper.reviewsCount} reviews)</span>
                          </div>
                        )}
                      </div>

                      <div className="grid gap-2 sm:grid-cols-2">
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <span className="font-medium">Email:</span>
                          <span>{helper.email}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <span className="font-medium">Phone:</span>
                          <span>{helper.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Briefcase className="h-4 w-4" />
                          <span>{helper.skills}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <span className="font-medium">Experience:</span>
                          <span>{helper.experience} years</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{helper.serviceAreas}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <span className="font-medium">NID:</span>
                          <span>{helper.nidNumber}</span>
                        </div>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">Applied:</span> {helper.appliedDate}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {helper.status === "Pending" && (
                    <div className="flex gap-3 lg:flex-col">
                      <Button
                        onClick={() => handleVerify(helper.id)}
                        className="flex-1 bg-green-600 text-white hover:bg-green-700 transition-all duration-300 hover:scale-105"
                      >
                        <CheckCircle className="mr-2 h-5 w-5" />
                        Verify
                      </Button>
                      <Button
                        onClick={() => handleReject(helper.id)}
                        variant="outline"
                        className="flex-1 border-red-600 text-red-600 hover:bg-red-50 transition-all duration-300 hover:scale-105"
                      >
                        <XCircle className="mr-2 h-5 w-5" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
