"use client"

import { Card } from "@/components/ui/card"
import { Users, Briefcase, CheckCircle, TrendingUp, Activity, DollarSign } from "lucide-react"
import Link from "next/link"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const statsData = [
  { title: "Total Users", value: "10,234", change: "+12.5%", icon: Users, color: "text-blue-600" },
  { title: "Active Helpers", value: "5,128", change: "+8.2%", icon: Briefcase, color: "text-green-600" },
  { title: "Jobs Completed", value: "48,392", change: "+23.1%", icon: CheckCircle, color: "text-purple-600" },
  { title: "Revenue", value: "$124,500", change: "+15.3%", icon: DollarSign, color: "text-orange-600" },
]

const monthlyData = [
  { month: "Jan", jobs: 2400, users: 1400, revenue: 8400 },
  { month: "Feb", jobs: 1398, users: 1200, revenue: 7200 },
  { month: "Mar", jobs: 9800, users: 2800, revenue: 15600 },
  { month: "Apr", jobs: 3908, users: 1900, revenue: 10400 },
  { month: "May", jobs: 4800, users: 2300, revenue: 12800 },
  { month: "Jun", jobs: 3800, users: 2100, revenue: 11200 },
]

const categoryData = [
  { name: "Plumbing", value: 450, color: "#1a3a3a" },
  { name: "Electrical", value: 380, color: "#4a6363" },
  { name: "Cleaning", value: 320, color: "#b4c9b4" },
  { name: "Carpentry", value: 280, color: "#8a9d8a" },
  { name: "Others", value: 420, color: "#6a7d7d" },
]

const quickActions = [
  { title: "Helper Management", href: "/admin/helpers", icon: Users, description: "Verify and manage helpers" },
  { title: "Categories", href: "/admin/categories", icon: Briefcase, description: "Manage service categories" },
  { title: "Moderation", href: "/admin/moderation", icon: Activity, description: "Review reported issues" },
  { title: "Announcements", href: "/admin/announcements", icon: TrendingUp, description: "Manage platform updates" },
]

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Overview of platform analytics and management</p>
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
                  <p className="text-sm font-medium text-green-600">{stat.change}</p>
                </div>
                <div className={`rounded-full bg-muted p-3 ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          {/* Jobs Over Time */}
          <Card className="p-6 shadow-xl animate-fade-in-up animation-delay-400">
            <h3 className="mb-4 text-lg font-bold">Jobs Completed</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorJobs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1a3a3a" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#1a3a3a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="jobs"
                  stroke="#1a3a3a"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorJobs)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Category Distribution */}
          <Card className="p-6 shadow-xl animate-fade-in-up animation-delay-500">
            <h3 className="mb-4 text-lg font-bold">Jobs by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* User Growth */}
          <Card className="p-6 shadow-xl animate-fade-in-up animation-delay-600">
            <h3 className="mb-4 text-lg font-bold">User Growth</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="users" fill="#4a6363" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Revenue */}
          <Card className="p-6 shadow-xl animate-fade-in-up animation-delay-700">
            <h3 className="mb-4 text-lg font-bold">Revenue</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#b4c9b4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#b4c9b4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#b4c9b4"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="mb-4 text-xl font-bold">Quick Actions</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href} className="group">
                <Card
                  className="p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 animate-fade-in-up"
                  style={{ animationDelay: `${800 + index * 100}ms` }}
                >
                  <div className="space-y-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                      <action.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold">{action.title}</h3>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
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
