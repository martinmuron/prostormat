'use client';

import Image from 'next/image';
import { useState } from 'react';
import { getOptimizedImageUrl, type ImageSize } from '@/lib/supabase-images';

interface OptimizedImageProps {
  imagePath: string;
  alt: string;
  size?: ImageSize;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  width?: number;
  height?: number;
  onClick?: () => void;
}

/**
 * OptimizedImage Component
 *
 * Displays images from Supabase Storage with automatic optimization
 * using Supabase's built-in image transformation API.
 *
 * Features:
 * - Automatic thumbnail generation for listing pages
 * - Medium quality for venue galleries
 * - Full size for lightbox/modal views
 * - Lazy loading by default
 * - Error handling with fallback
 *
 * @example
 * // Thumbnail for listing page
 * <OptimizedImage
 *   imagePath="kafkoff/image_1.jpg"
 *   alt="Kafkoff venue"
 *   size="thumbnail"
 *   width={300}
 *   height={200}
 * />
 *
 * // Medium for venue gallery
 * <OptimizedImage
 *   imagePath="kafkoff/image_1.jpg"
 *   alt="Kafkoff interior"
 *   size="medium"
 *   width={800}
 *   height={600}
 * />
 *
 * // Full size for modal
 * <OptimizedImage
 *   imagePath="kafkoff/image_1.jpg"
 *   alt="Kafkoff full view"
 *   size="full"
 *   fill
 * />
 */
export function OptimizedImage({
  imagePath,
  alt,
  size = 'medium',
  className = '',
  priority = false,
  fill = false,
  width,
  height,
  onClick,
}: OptimizedImageProps) {
  const [error, setError] = useState(false);

  // Fallback image
  const fallbackUrl = '/images/placeholder-venue.jpg';

  // Get optimized image URL based on size
  const imageUrl = getOptimizedImageUrl(imagePath, size) || fallbackUrl;

  if (error) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-400">Image unavailable</span>
      </div>
    );
  }

  const imageSrc = error ? fallbackUrl : imageUrl;

  const baseProps = {
    src: imageSrc,
    alt,
    className,
    priority,
    onError: () => setError(true),
    onClick,
    unoptimized: false,
  } as const;

  if (fill) {
    return (
      <Image
        {...baseProps}
        alt={alt}
        fill
        style={{ objectFit: 'cover' }}
      />
    );
  }

  const resolvedWidth = width ?? 800;
  const resolvedHeight = height ?? 600;

  return (
    <Image
      {...baseProps}
      alt={alt}
      width={resolvedWidth}
      height={resolvedHeight}
    />
  );
}

/**
 * VenueGallery Component
 *
 * Displays a gallery of venue images with thumbnail previews.
 * Clicking an image opens it in full size.
 */
interface VenueGalleryProps {
  images: string[];
  venueName: string;
  onImageClick?: (index: number) => void;
}

export function VenueGallery({ images, venueName, onImageClick }: VenueGalleryProps) {
  if (!images || images.length === 0) {
    return (
      <div className="bg-gray-100 rounded-lg p-8 text-center">
        <p className="text-gray-500">No images available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {images.map((imagePath, index) => (
        <div
          key={index}
          className="relative aspect-[4/3] rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => onImageClick?.(index)}
        >
          <OptimizedImage
            imagePath={imagePath}
            alt={`${venueName} - Image ${index + 1}`}
            size="thumbnail"
            fill
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}

/**
 * VenueCard Component
 *
 * Displays a venue card with optimized thumbnail
 */
interface VenueCardImageProps {
  imagePath: string;
  venueName: string;
  className?: string;
}

export function VenueCardImage({ imagePath, venueName, className = '' }: VenueCardImageProps) {
  return (
    <div className={`relative aspect-[16/9] overflow-hidden ${className}`}>
      <OptimizedImage
        imagePath={imagePath}
        alt={venueName}
        size="thumbnail"
        fill
        className="object-cover hover:scale-105 transition-transform duration-300"
      />
    </div>
  );
}
