"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Briefcase, CheckCircle, TrendingUp, Activity, AlertCircle, Shield, UserCheck } from "lucide-react"
import Link from "next/link"
import { toast } from "react-hot-toast"

interface Stats {
  totalUsers: number
  activeHelpers: number
  completedJobs: number
  pendingHelpers: number
}

interface Stats {
  totalUsers: number
  activeHelpers: number
  completedJobs: number
  pendingHelpers: number
}

const managementPages = [
  { 
    title: "Helper Management", 
    href: "/admin/helpers", 
    icon: Users, 
    description: "Approve and manage helper applications",
    color: "bg-blue-500 hover:bg-blue-600"
  },
  { 
    title: "Help Seeker Management", 
    href: "/admin/help-seekers", 
    icon: UserCheck, 
    description: "Manage help seekers and review reports",
    color: "bg-indigo-500 hover:bg-indigo-600"
  },
  { 
    title: "Helper Verification", 
    href: "/admin/verification", 
    icon: Shield, 
    description: "Verify helper documents and certificates",
    color: "bg-cyan-500 hover:bg-cyan-600"
  },
  { 
    title: "Category Management", 
    href: "/admin/categories", 
    icon: Briefcase, 
    description: "Manage service categories",
    color: "bg-green-500 hover:bg-green-600"
  },
  { 
    title: "Moderation", 
    href: "/admin/moderation", 
    icon: Activity, 
    description: "Review reported issues and disputes",
    color: "bg-purple-500 hover:bg-purple-600"
  },
  { 
    title: "Announcements", 
    href: "/admin/announcements", 
    icon: TrendingUp, 
    description: "Create and manage platform announcements",
    color: "bg-orange-500 hover:bg-orange-600"
  },
]

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoadingStats, setIsLoadingStats] = useState(true)

  // Redirect if not admin
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/")
    }
  }, [status, session, router])

  // Fetch stats
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "ADMIN") {
      fetchStats()
    }
  }, [status, session])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats")
      const data = await response.json()

      if (response.ok) {
        setStats(data)
      } else {
        toast.error("Failed to load statistics")
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
      toast.error("An error occurred")
    } finally {
      setIsLoadingStats(false)
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

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage and monitor the MistriHub platform</p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {isLoadingStats ? (
            // Loading skeletons
            [...Array(4)].map((_, index) => (
              <Card
                key={index}
                className="p-6 shadow-xl animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
                    <div className="h-8 bg-muted rounded w-32 animate-pulse"></div>
                    <div className="h-4 bg-muted rounded w-16 animate-pulse"></div>
                  </div>
                  <div className="rounded-full bg-muted p-3 h-12 w-12 animate-pulse"></div>
                </div>
              </Card>
            ))
          ) : stats ? (
            <>
              <Card
                className="p-6 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 animate-fade-in-up"
                style={{ animationDelay: '0ms' }}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    <p className="text-3xl font-bold">{stats.totalUsers.toLocaleString()}</p>
                    <p className="text-sm font-medium text-green-600">All registered users</p>
                  </div>
                  <div className="rounded-full bg-muted p-3 text-blue-600">
                    <Users className="h-6 w-6" />
                  </div>
                </div>
              </Card>

              <Card
                className="p-6 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 animate-fade-in-up"
                style={{ animationDelay: '100ms' }}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Active Helpers</p>
                    <p className="text-3xl font-bold">{stats.activeHelpers.toLocaleString()}</p>
                    <p className="text-sm font-medium text-green-600">Approved & Active</p>
                  </div>
                  <div className="rounded-full bg-muted p-3 text-green-600">
                    <Briefcase className="h-6 w-6" />
                  </div>
                </div>
              </Card>

              <Card
                className="p-6 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 animate-fade-in-up"
                style={{ animationDelay: '200ms' }}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Jobs Completed</p>
                    <p className="text-3xl font-bold">{stats.completedJobs.toLocaleString()}</p>
                    <p className="text-sm font-medium text-green-600">Successfully finished</p>
                  </div>
                  <div className="rounded-full bg-muted p-3 text-purple-600">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                </div>
              </Card>

              <Card
                className="p-6 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 animate-fade-in-up"
                style={{ animationDelay: '300ms' }}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Pending Approvals</p>
                    <p className="text-3xl font-bold">{stats.pendingHelpers}</p>
                    <p className="text-sm font-medium text-orange-600">
                      {stats.pendingHelpers > 0 ? "Needs Review" : "All reviewed"}
                    </p>
                  </div>
                  <div className="rounded-full bg-muted p-3 text-orange-600">
                    <AlertCircle className="h-6 w-6" />
                  </div>
                </div>
              </Card>
            </>
          ) : null}
        </div>

        {/* Management Pages Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Management Pages</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {managementPages.map((page, index) => (
              <Link key={index} href={page.href}>
                <Card 
                  className="p-6 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 cursor-pointer animate-fade-in-up h-full"
                  style={{ animationDelay: `${(index + 4) * 100}ms` }}
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className={`rounded-full p-4 ${page.color} text-white transition-transform duration-300 hover:scale-110`}>
                      <page.icon className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-2">{page.title}</h3>
                      <p className="text-sm text-muted-foreground">{page.description}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full mt-auto"
                    >
                      Open
                    </Button>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
