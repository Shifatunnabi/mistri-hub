"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Briefcase, CheckCircle, TrendingUp, Activity, AlertCircle, Shield } from "lucide-react"
import Link from "next/link"

const statsData = [
  { title: "Total Users", value: "10,234", change: "+12.5%", icon: Users, color: "text-blue-600" },
  { title: "Active Helpers", value: "5,128", change: "+8.2%", icon: Briefcase, color: "text-green-600" },
  { title: "Jobs Completed", value: "48,392", change: "+23.1%", icon: CheckCircle, color: "text-purple-600" },
  { title: "Pending Approvals", value: "12", change: "Needs Review", icon: AlertCircle, color: "text-orange-600" },
]

const managementPages = [
  { 
    title: "Helper Management", 
    href: "/admin/helpers", 
    icon: Users, 
    description: "Approve and manage helper applications",
    color: "bg-blue-500 hover:bg-blue-600"
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

  // Redirect if not admin
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/")
    }
  }, [status, session, router])

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
          {statsData.map((stat, index) => (
            <Card
              key={index}
              className="p-6 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <p className={`text-sm font-medium ${stat.title === "Pending Approvals" ? "text-orange-600" : "text-green-600"}`}>
                    {stat.change}
                  </p>
                </div>
                <div className={`rounded-full bg-muted p-3 ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Management Pages Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Management Pages</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
