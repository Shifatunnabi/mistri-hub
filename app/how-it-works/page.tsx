"use client"

import { useEffect, useRef, useState } from "react"
import { CheckCircle, Search, MessageCircle, Calendar, ThumbsUp } from "lucide-react"

const steps = [
  {
    title: "Post Your Task",
    description:
      "Create a detailed post about what you need help with. Include photos, set your budget, and specify your location. The more details you provide, the better matches you'll receive.",
    icon: CheckCircle,
    image: "/person-posting-task-on-phone.jpg",
  },
  {
    title: "Browse & Get Matched",
    description:
      "Receive offers from verified local helpers with the right skills. Browse their profiles, check ratings and reviews from previous clients, and compare prices to find the perfect match.",
    icon: Search,
    image: "/person-browsing-profiles-on-laptop.jpg",
  },
  {
    title: "Connect & Communicate",
    description:
      "Chat directly with helpers through our secure messaging system. Discuss details, ask questions, and clarify requirements before making your final decision.",
    icon: MessageCircle,
    image: "/people-chatting-on-phone.jpg",
  },
  {
    title: "Schedule the Service",
    description:
      "Once you've found the right helper, schedule a time that works for both of you. Our platform tracks the entire process from start to finish, keeping you informed every step of the way.",
    icon: Calendar,
    image: "/calendar-scheduling.png",
  },
  {
    title: "Get It Done & Review",
    description:
      "Your helper completes the task professionally. After completion, rate your experience and leave a review to help others in the community make informed decisions.",
    icon: ThumbsUp,
    image: "/happy-customer-giving-thumbs-up.jpg",
  },
]

export default function HowItWorksPage() {
  const [visibleSteps, setVisibleSteps] = useState<Set<number>>(new Set())
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-index"))
            setVisibleSteps((prev) => new Set(prev).add(index))
          }
        })
      },
      { threshold: 0.2 },
    )

    const stepElements = containerRef.current?.querySelectorAll("[data-index]")
    stepElements?.forEach((element) => observer.observe(element))

    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center space-y-4 mb-20 animate-fade-in-up">
          <h1 className="text-4xl font-bold tracking-tight text-balance lg:text-5xl">How MistriHub Works</h1>
          <p className="text-lg text-muted-foreground text-pretty leading-relaxed">
            From posting a task to getting it done, we've made the process simple, secure, and transparent. Follow these
            easy steps to connect with skilled local helpers.
          </p>
        </div>

        {/* Steps Flow */}
        <div ref={containerRef} className="max-w-6xl mx-auto space-y-24">
          {steps.map((step, index) => {
            const isOdd = index % 2 === 0
            const isVisible = visibleSteps.has(index)

            return (
              <div
                key={index}
                data-index={index}
                className={`grid gap-12 lg:grid-cols-2 items-center ${
                  isVisible ? "opacity-100" : "opacity-0"
                } transition-opacity duration-1000`}
              >
                {/* Text Content */}
                <div
                  className={`space-y-6 ${isOdd ? "lg:order-1" : "lg:order-2"} transition-all duration-1000 delay-200 ${
                    isVisible ? "translate-x-0" : isOdd ? "-translate-x-10" : "translate-x-10"
                  }`}
                >
                  <div className="inline-flex items-center space-x-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                      <step.icon className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-bold text-primary">Step {index + 1}</span>
                  </div>

                  <h2 className="text-3xl font-bold tracking-tight text-balance lg:text-4xl">{step.title}</h2>

                  <p className="text-lg text-muted-foreground leading-relaxed text-pretty">{step.description}</p>

                  {/* Progress Indicator */}
                  <div className="flex items-center space-x-2">
                    {steps.map((_, i) => (
                      <div
                        key={i}
                        className={`h-2 rounded-full transition-all duration-500 ${
                          i <= index ? "w-12 bg-primary" : "w-8 bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Image */}
                <div
                  className={`${isOdd ? "lg:order-2" : "lg:order-1"} transition-all duration-1000 delay-400 ${
                    isVisible
                      ? "translate-x-0 opacity-100"
                      : isOdd
                        ? "translate-x-10 opacity-0"
                        : "-translate-x-10 opacity-0"
                  }`}
                >
                  <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl">
                    <img
                      src={step.image || "/placeholder.svg"}
                      alt={step.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-32 mx-auto max-w-3xl text-center space-y-8 animate-fade-in-up">
          <h2 className="text-3xl font-bold tracking-tight text-balance lg:text-4xl">Ready to Get Started?</h2>
          <p className="text-lg text-muted-foreground text-pretty">
            Join thousands of users who trust MistriHub for their everyday tasks.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/register?role=seeker"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-4 text-base font-medium text-primary-foreground transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              Post a Task
            </a>
            <a
              href="/register?role=helper"
              className="inline-flex items-center justify-center rounded-lg border-2 border-primary bg-transparent px-8 py-4 text-base font-medium text-primary transition-all duration-300 hover:scale-105 hover:bg-primary hover:text-primary-foreground"
            >
              Become a Helper
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
