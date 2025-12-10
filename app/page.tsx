"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import {
  Wrench,
  Zap,
  Droplet,
  Sparkles,
  Package,
  BookOpen,
  Truck,
  PaintBucket,
  ArrowRight,
  CheckCircle,
  Star,
  Users,
  Clock,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <HowItWorksSection />
      <CategoriesSection />
      <TestimonialsSection />
    </div>
  )
}

function HeroSection() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-secondary/20 py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Right Content - Animated Visual (shows first on mobile) */}
          <div
            className={`relative order-1 lg:order-2 transition-all duration-1000 delay-300 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"}`}
          >
            <div className="relative aspect-square animate-float">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-sm"></div>
              <img
                src="/professional-helper-with-tools-and-equipment-illus.jpg"
                alt="MistriHub Helper"
                className="relative z-10 h-full w-full rounded-3xl object-cover shadow-2xl"
              />
              {/* Floating Cards */}
              <div className="absolute -left-4 top-1/4 z-20 animate-fade-in-up">
                <Card className="flex items-center space-x-3 p-4 shadow-lg">
                  <div className="rounded-full bg-primary p-2">
                    <CheckCircle className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Verified</p>
                    <p className="text-xs text-muted-foreground">Trusted Helpers</p>
                  </div>
                </Card>
              </div>
              <div className="absolute -right-4 bottom-1/4 z-20 animate-fade-in-up animation-delay-200">
                <Card className="flex items-center space-x-3 p-4 shadow-lg">
                  <div className="rounded-full bg-accent p-2">
                    <Clock className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Quick Response</p>
                    <p className="text-xs text-muted-foreground">Under 15 mins</p>
                  </div>
                </Card>
              </div>
            </div>
          </div>

          {/* Left Content (shows second on mobile) */}
          <div
            className={`space-y-8 order-2 lg:order-1 transition-all duration-1000 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"}`}
          >
            <div className="inline-flex items-center space-x-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              <span>Your Local Helper Marketplace</span>
            </div>

            <h1 className="text-4xl font-bold leading-tight tracking-tight text-balance lg:text-6xl">
              Get Help When You Need It, Where You Need It
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed text-pretty lg:text-xl">
              Connect with trusted local helpers for all your everyday tasks. From plumbing to furniture assembly, find
              skilled professionals in your area instantly.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Button
                size="lg"
                className="group text-base transition-all duration-300 hover:scale-105 hover:shadow-xl"
                asChild
              >
                <Link href="/register?role=seeker">
                  Get Help
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="group text-base transition-all duration-300 hover:scale-105 hover:bg-primary hover:text-primary-foreground bg-transparent"
                asChild
              >
                <Link href="/register?role=helper">
                  Become a Helper
                  <Users className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border">
              <div className="space-y-1">
                <p className="text-2xl font-bold lg:text-3xl">10K+</p>
                <p className="text-sm text-muted-foreground">Active Users</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold lg:text-3xl">5K+</p>
                <p className="text-sm text-muted-foreground">Helpers</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold lg:text-3xl">50K+</p>
                <p className="text-sm text-muted-foreground">Tasks Done</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function HowItWorksSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current)
      }
    }
  }, [])

  const steps = [
    {
      icon: Package,
      title: "Post a Task",
      description: "Describe what you need help with, add photos, set your budget, and location.",
      color: "bg-primary",
    },
    {
      icon: Users,
      title: "Get Matched",
      description: "Receive offers from verified local helpers with the right skills and ratings.",
      color: "bg-accent",
    },
    {
      icon: CheckCircle,
      title: "Get Service",
      description: "Choose your helper, schedule the task, and get it done. Rate your experience.",
      color: "bg-secondary",
    },
  ]

  return (
    <section ref={sectionRef} className="py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center space-y-4 mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-balance lg:text-5xl">How It Works</h2>
          <p className="text-lg text-muted-foreground text-pretty">
            Get started in three simple steps and find the help you need in minutes.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <Card
              key={index}
              className={`group relative overflow-hidden p-8 transition-all duration-500 hover:shadow-xl hover:-translate-y-2 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <div className="space-y-4">
                <div
                  className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl ${step.color} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}
                >
                  <step.icon className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
              <div className="absolute -bottom-2 -right-2 h-24 w-24 rounded-full bg-primary/5 transition-transform duration-500 group-hover:scale-150"></div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function CategoriesSection() {
  const categories = [
    { icon: Zap, name: "Electrical", color: "text-yellow-600" },
    { icon: Droplet, name: "Plumbing", color: "text-blue-600" },
    { icon: Sparkles, name: "Cleaning", color: "text-purple-600" },
    { icon: Truck, name: "Delivery", color: "text-red-600" },
    { icon: BookOpen, name: "Tutoring", color: "text-green-600" },
    { icon: Wrench, name: "Repair", color: "text-orange-600" },
    { icon: PaintBucket, name: "Painting", color: "text-pink-600" },
    { icon: Package, name: "Moving", color: "text-indigo-600" },
    { icon: Zap, name: "Electrical", color: "text-yellow-600" },
    { icon: Droplet, name: "Plumbing", color: "text-blue-600" },
    { icon: Sparkles, name: "Cleaning", color: "text-purple-600" },
    { icon: Truck, name: "Delivery", color: "text-red-600" },
  ]

  return (
    <section className="overflow-hidden bg-muted/30 py-20 lg:py-32">
      <div className="container mx-auto px-4 mb-16">
        <div className="mx-auto max-w-3xl text-center space-y-4">
          <h2 className="text-3xl font-bold tracking-tight text-balance lg:text-5xl">Popular Categories</h2>
          <p className="text-lg text-muted-foreground text-pretty">
            Browse through our wide range of services and find the perfect helper for your needs.
          </p>
        </div>
      </div>

      <div className="relative">
        <div className="flex animate-slide-left space-x-6">
          {[...categories, ...categories].map((category, index) => (
            <Card
              key={index}
              className="group flex min-w-[280px] flex-col items-center justify-center space-y-4 p-8 transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              <div className="rounded-2xl bg-background p-4 transition-all duration-300 group-hover:bg-primary">
                <category.icon
                  className={`h-10 w-10 ${category.color} transition-colors duration-300 group-hover:text-primary-foreground`}
                />
              </div>
              <h3 className="text-lg font-bold">{category.name}</h3>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(1)

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Homeowner",
      image: "/professional-woman-smiling.png",
      rating: 5,
      text: "MistriHub made finding a reliable plumber so easy! The helper arrived on time and fixed my issue in no time. Highly recommend!",
    },
    {
      name: "Michael Chen",
      role: "Small Business Owner",
      image: "/professional-man-smiling.png",
      rating: 5,
      text: "As a helper on MistriHub, I have found consistent work and great clients. The platform is user-friendly and the support is excellent.",
    },
    {
      name: "Emily Rodriguez",
      role: "Apartment Resident",
      image: "/happy-woman-portrait.png",
      rating: 5,
      text: "I needed furniture assembled urgently and MistriHub connected me with someone nearby within minutes. Amazing service!",
    },
  ]

  const handleTestimonialClick = (index: number) => {
    setActiveIndex(index)
  }

  return (
    <section className="py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center space-y-4 mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-balance lg:text-5xl">What Our Users Say</h2>
          <p className="text-lg text-muted-foreground text-pretty">
            Join thousands of satisfied users who have found reliable help through MistriHub.
          </p>
        </div>

        <div className="relative mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row items-center md:items-end justify-center gap-6">
            {testimonials.map((testimonial, index) => {
              const isActive = index === activeIndex

              return (
                <Card
                  key={index}
                  onClick={() => handleTestimonialClick(index)}
                  className={`cursor-pointer transition-all duration-500 w-full ${
                    isActive ? "z-10 scale-100 opacity-100 md:w-96" : "z-0 scale-95 opacity-70 md:scale-90 md:w-80"
                  }`}
                  style={{
                    transform: isActive ? "translateY(0)" : "translateY(1rem)",
                  }}
                >
                  <div className="p-8 space-y-6">
                    <div className="flex items-center space-x-4">
                      <img
                        src={testimonial.image || "/placeholder.svg"}
                        alt={testimonial.name}
                        className="h-16 w-16 rounded-full object-cover ring-2 ring-primary/20"
                      />
                      <div>
                        <h4 className="font-bold">{testimonial.name}</h4>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{testimonial.text}</p>
                  </div>
                </Card>
              )
            })}
          </div>

          {/* Navigation Dots */}
          <div className="mt-8 flex justify-center space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => handleTestimonialClick(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === activeIndex ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30"
                }`}
                aria-label={`View testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
