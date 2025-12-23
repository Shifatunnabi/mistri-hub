"use client"

import { Card } from "@/components/ui/card"
import { useEffect, useRef, useState } from "react"
import {
  Wrench,
  Zap,
  Droplet,
  Sparkles,
  Package,
  BookOpen,
  Truck,
  PaintBucket,
  Scissors,
  Laptop,
  Home,
  Leaf,
  Loader2,
} from "lucide-react"

// Icon mapping for common categories
const iconMap: Record<string, any> = {
  electrical: Zap,
  plumbing: Droplet,
  cleaning: Sparkles,
  delivery: Truck,
  tutoring: BookOpen,
  repair: Wrench,
  painting: PaintBucket,
  moving: Package,
  carpentry: Scissors,
  "tech support": Laptop,
  "home maintenance": Home,
  gardening: Leaf,
}

const colorMap: string[] = [
  "text-yellow-600",
  "text-blue-600",
  "text-purple-600",
  "text-red-600",
  "text-green-600",
  "text-orange-600",
  "text-pink-600",
  "text-indigo-600",
  "text-amber-600",
  "text-cyan-600",
  "text-slate-600",
  "text-teal-600",
]

interface Category {
  _id: string
  name: string
  slug: string
  active: boolean
  jobCount: number
}

export default function ServicesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set())
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/categories?activeOnly=true")
      const data = await response.json()

      if (response.ok) {
        setCategories(data.categories)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getIconForCategory = (categoryName: string) => {
    const normalizedName = categoryName.toLowerCase()
    return iconMap[normalizedName] || Wrench
  }

  const getColorForCategory = (index: number) => {
    return colorMap[index % colorMap.length]
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-index"))
            setVisibleCards((prev) => new Set(prev).add(index))
          }
        })
      },
      { threshold: 0.1 },
    )

    const cards = cardRefs.current.filter((ref) => ref !== null)
    cards.forEach((card) => observer.observe(card))

    return () => observer.disconnect()
  }, [categories])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading services...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center space-y-4 mb-16 animate-fade-in-up">
          <h1 className="text-4xl font-bold tracking-tight text-balance lg:text-5xl">Our Services</h1>
          <p className="text-lg text-muted-foreground text-pretty leading-relaxed">
            Browse through our comprehensive range of services. Find skilled professionals for any task you need help
            with.
          </p>
        </div>

        {/* Categories Grid */}
        {categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No services available at the moment.</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto">
            {categories.map((category, index) => {
              const Icon = getIconForCategory(category.name)
              const color = getColorForCategory(index)
              
              return (
                <Card
                  key={category._id}
                  ref={(el) => {
                    cardRefs.current[index] = el
                  }}
                  data-index={index}
                  className={`group relative overflow-hidden p-8 transition-all duration-500 hover:shadow-xl hover:-translate-y-2 ${
                    visibleCards.has(index) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                  }`}
                  style={{ transitionDelay: `${(index % 2) * 150}ms` }}
                >
                  <div className="space-y-4">
                    <div
                      className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}
                    >
                      <Icon className={`h-8 w-8 ${color} group-hover:text-primary-foreground`} />
                    </div>
                    <h3 className="text-xl font-bold">{category.name}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {category.jobCount} {category.jobCount === 1 ? "job" : "jobs"} available
                    </p>
                  </div>
                  <div className="absolute -bottom-2 -right-2 h-24 w-24 rounded-full bg-primary/5 transition-transform duration-500 group-hover:scale-150"></div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
