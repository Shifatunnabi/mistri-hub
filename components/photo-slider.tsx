"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PhotoSliderProps {
  photos: string[]
  alt?: string
}

export function PhotoSlider({ photos, alt = "Job photo" }: PhotoSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!photos || photos.length === 0) {
    return null
  }

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? photos.length - 1 : prevIndex - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === photos.length - 1 ? 0 : prevIndex + 1))
  }

  if (photos.length === 1) {
    return (
      <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
        <img src={photos[0]} alt={alt} className="h-full w-full object-cover" />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Main Image */}
      <div className="relative aspect-video overflow-hidden rounded-lg bg-muted group">
        <img src={photos[currentIndex]} alt={`${alt} ${currentIndex + 1}`} className="h-full w-full object-cover" />

        {/* Navigation Buttons */}
        <Button
          variant="secondary"
          size="icon"
          className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={goToPrevious}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={goToNext}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>

        {/* Photo Counter */}
        <div className="absolute bottom-2 right-2 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
          {currentIndex + 1} / {photos.length}
        </div>
      </div>

      {/* Thumbnail Strip */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {photos.map((photo, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 transition-all ${
              index === currentIndex ? "border-primary scale-105" : "border-transparent opacity-60 hover:opacity-100"
            }`}
          >
            <img src={photo} alt={`${alt} thumbnail ${index + 1}`} className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  )
}
