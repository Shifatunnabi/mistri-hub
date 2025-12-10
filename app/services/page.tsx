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
} from "lucide-react"

// Mock categories - In production, these would come from admin
const categories = [
  {
    id: "1",
    name: "Electrical",
    icon: Zap,
    description: "Wiring, repairs, installations, and electrical troubleshooting services.",
    color: "text-yellow-600",
  },
  {
    id: "2",
    name: "Plumbing",
    icon: Droplet,
    description: "Pipe repairs, installations, leak fixing, and drainage solutions.",
    color: "text-blue-600",
  },
  {
    id: "3",
    name: "Cleaning",
    icon: Sparkles,
    description: "Deep cleaning, regular maintenance, and specialized cleaning services.",
    color: "text-purple-600",
  },
  {
    id: "4",
    name: "Delivery",
    icon: Truck,
    description: "Package delivery, moving assistance, and transportation services.",
    color: "text-red-600",
  },
  {
    id: "5",
    name: "Tutoring",
    icon: BookOpen,
    description: "Academic support, skill development, and personalized learning.",
    color: "text-green-600",
  },
  {
    id: "6",
    name: "Repair",
    icon: Wrench,
    description: "General repairs, maintenance, and fixing household items.",
    color: "text-orange-600",
  },
  {
    id: "7",
    name: "Painting",
    icon: PaintBucket,
    description: "Interior and exterior painting, wall finishing, and decorating.",
    color: "text-pink-600",
  },
  {
    id: "8",
    name: "Moving",
    icon: Package,
    description: "Furniture moving, packing services, and relocation assistance.",
    color: "text-indigo-600",
  },
  {
    id: "9",
    name: "Carpentry",
    icon: Scissors,
    description: "Custom woodwork, furniture assembly, and carpentry projects.",
    color: "text-amber-600",
  },
  {
    id: "10",
    name: "Tech Support",
    icon: Laptop,
    description: "Computer repairs, software installation, and IT assistance.",
    color: "text-cyan-600",
  },
  {
    id: "11",
    name: "Home Maintenance",
    icon: Home,
    description: "General home upkeep, preventive maintenance, and repairs.",
    color: "text-slate-600",
  },
  {
    id: "12",
    name: "Gardening",
    icon: Leaf,
    description: "Lawn care, landscaping, plant maintenance, and garden design.",
    color: "text-emerald-600",
  },
]

export default function ServicesPage() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set())

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

    const cards = sectionRef.current?.querySelectorAll("[data-index]")
    cards?.forEach((card) => observer.observe(card))

    return () => observer.disconnect()
  }, [])

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
        <div ref={sectionRef} className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto">
          {categories.map((category, index) => (
            <Card
              key={category.id}
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
                  <category.icon className={`h-8 w-8 ${category.color} group-hover:text-primary-foreground`} />
                </div>
                <h3 className="text-xl font-bold">{category.name}</h3>
                <p className="text-muted-foreground leading-relaxed">{category.description}</p>
              </div>
              <div className="absolute -bottom-2 -right-2 h-24 w-24 rounded-full bg-primary/5 transition-transform duration-500 group-hover:scale-150"></div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
