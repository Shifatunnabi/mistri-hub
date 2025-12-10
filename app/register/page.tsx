"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserCircle, Wrench, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function RegisterPage() {
  const [hoveredCard, setHoveredCard] = useState<"seeker" | "helper" | null>(null)

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl space-y-8 animate-fade-in-up">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">Join MistriHub</h1>
          <p className="text-muted-foreground text-lg">Choose how you want to get started</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Help Seeker Card */}
          <Link href="/register/help-seeker">
            <Card
              className={`group relative overflow-hidden p-8 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 cursor-pointer ${
                hoveredCard === "seeker" ? "ring-2 ring-primary" : ""
              }`}
              onMouseEnter={() => setHoveredCard("seeker")}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="relative z-10 space-y-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-primary-foreground transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                  <UserCircle className="h-10 w-10" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">Register as Help Seeker</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Looking for help with tasks? Find trusted local helpers for all your needs.
                  </p>
                </div>

                <ul className="space-y-2 text-sm">
                  <li className="flex items-start space-x-2">
                    <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0"></div>
                    <span>Post tasks and get matched with helpers</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0"></div>
                    <span>View ratings and reviews before hiring</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0"></div>
                    <span>Track job progress in real-time</span>
                  </li>
                </ul>

                <Button className="w-full group/btn transition-all duration-300 hover:scale-105">
                  Get Started as Help Seeker
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover/btn:translate-x-1" />
                </Button>
              </div>

              <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-primary/5 transition-all duration-500 group-hover:scale-150"></div>
            </Card>
          </Link>

          {/* Helper Card */}
          <Link href="/register/helper">
            <Card
              className={`group relative overflow-hidden p-8 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 cursor-pointer ${
                hoveredCard === "helper" ? "ring-2 ring-accent" : ""
              }`}
              onMouseEnter={() => setHoveredCard("helper")}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="relative z-10 space-y-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-accent text-accent-foreground transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                  <Wrench className="h-10 w-10" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">Register as Helper</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Have skills? Earn money by helping others in your community with their tasks.
                  </p>
                </div>

                <ul className="space-y-2 text-sm">
                  <li className="flex items-start space-x-2">
                    <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-accent flex-shrink-0"></div>
                    <span>Get matched with nearby tasks</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-accent flex-shrink-0"></div>
                    <span>Set your own rates and schedule</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-accent flex-shrink-0"></div>
                    <span>Build your reputation and earn more</span>
                  </li>
                </ul>

                <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90 group/btn transition-all duration-300 hover:scale-105">
                  Get Started as Helper
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover/btn:translate-x-1" />
                </Button>
              </div>

              <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-accent/5 transition-all duration-500 group-hover:scale-150"></div>
            </Card>
          </Link>
        </div>

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
