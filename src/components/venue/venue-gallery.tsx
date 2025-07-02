"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface VenueGalleryProps {
  images: string[]
  venueName: string
}

export function VenueGallery({ images, venueName }: VenueGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  if (images.length === 0) {
    return (
      <div className="aspect-[4/3] bg-gray-100 rounded-2xl flex items-center justify-center">
        <p className="text-gray-500">Žádné obrázky</p>
      </div>
    )
  }

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <>
      <div className="relative">
        {/* Main Image */}
        <div className="aspect-[4/3] relative overflow-hidden rounded-2xl bg-gray-100">
          <Image
            src={images[currentIndex]}
            alt={`${venueName} - obrázek ${currentIndex + 1}`}
            fill
            className="object-cover cursor-pointer"
            onClick={() => setIsFullscreen(true)}
          />
          
          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <Button
                variant="secondary"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white"
                onClick={prevImage}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white"
                onClick={nextImage}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </>
          )}
          
          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-caption">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <div className="flex gap-2 mt-4 overflow-x-auto">
            {images.map((image, index) => (
              <button
                key={index}
                className={`relative w-20 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                  index === currentIndex ? 'border-black' : 'border-transparent'
                }`}
                onClick={() => setCurrentIndex(index)}
              >
                <Image
                  src={image}
                  alt={`${venueName} - náhled ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:text-gray-300"
            onClick={() => setIsFullscreen(false)}
          >
            <X className="h-6 w-6" />
          </Button>
          
          <div className="relative max-w-7xl max-h-full mx-4">
            <Image
              src={images[currentIndex]}
              alt={`${venueName} - obrázek ${currentIndex + 1}`}
              width={1200}
              height={800}
              className="object-contain max-h-[90vh]"
            />
            
            {images.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}