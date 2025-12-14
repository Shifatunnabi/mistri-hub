"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, ArrowLeft } from "lucide-react"
import { toast } from "react-hot-toast"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setEmailSent(true)
        toast.success("Password reset link sent to your email!")
      } else {
        toast.error(data.error || "Failed to send reset link")
      }
    } catch (error) {
      console.error("Forgot password error:", error)
      toast.error("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8 animate-fade-in-up">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">Forgot Password</h1>
          <p className="text-muted-foreground">
            {emailSent
              ? "Check your email for reset instructions"
              : "Enter your email to receive a password reset link"}
          </p>
        </div>

        <Card className="p-8 shadow-xl">
          {emailSent ? (
            <div className="space-y-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  We've sent a password reset link to <strong>{email}</strong>
                </p>
                <p className="text-sm text-muted-foreground">
                  Please check your inbox and follow the instructions. The link will expire in 15 minutes.
                </p>
              </div>
              <div className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setEmailSent(false)
                    setEmail("")
                  }}
                >
                  Send Another Link
                </Button>
                <Link href="/login" className="block">
                  <Button variant="ghost" className="w-full">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Login
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>

              <div className="text-center">
                <Link href="/login" className="text-sm text-primary transition-colors hover:underline">
                  <ArrowLeft className="mr-1 inline h-4 w-4" />
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  )
}
