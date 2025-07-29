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
        {/* Gallery Header */}
        {images.length > 1 && (
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Galerie ({images.length} fotografií)
            </h2>
            <div className="text-sm text-gray-600">
              Klikněte na obrázek pro zvětšení
            </div>
          </div>
        )}

        {/* Main Image */}
        <div className="aspect-[4/3] relative overflow-hidden rounded-2xl bg-gray-100 group">
          <Image
            src={images[currentIndex]}
            alt={`${venueName} - obrázek ${currentIndex + 1}`}
            fill
            className="object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
            onClick={() => setIsFullscreen(true)}
          />
          
          {/* Navigation Arrows - more prominent */}
          {images.length > 1 && (
            <>
              <Button
                variant="secondary"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white shadow-lg transition-all duration-200 opacity-80 hover:opacity-100"
                onClick={prevImage}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white shadow-lg transition-all duration-200 opacity-80 hover:opacity-100"
                onClick={nextImage}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}
          
          {/* Image Counter - more prominent */}
          {images.length > 1 && (
            <div className="absolute bottom-4 right-4 bg-black/80 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
              {currentIndex + 1} / {images.length}
            </div>
          )}

          {/* Click to expand hint */}
          <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity">
            Kliknutím zvětšíte
          </div>
        </div>

        {/* Enhanced Thumbnail Strip */}
        {images.length > 1 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700">
                Všechny fotografie
              </h3>
              <div className="text-xs text-gray-500">
                Procházejte fotografie
              </div>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
              {images.map((image, index) => (
                <button
                  key={index}
                  className={`relative w-24 h-20 rounded-xl overflow-hidden flex-shrink-0 border-3 transition-all duration-200 hover:scale-105 ${
                    index === currentIndex 
                      ? 'border-blue-500 shadow-lg ring-2 ring-blue-200' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setCurrentIndex(index)}
                >
                  <Image
                    src={image}
                    alt={`${venueName} - náhled ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  {/* Active indicator */}
                  {index === currentIndex && (
                    <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    </div>
                  )}
                  {/* Thumbnail number */}
                  <div className="absolute top-1 right-1 bg-black/60 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {index + 1}
                  </div>
                </button>
              ))}
            </div>
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