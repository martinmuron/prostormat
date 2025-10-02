/**
 * Supabase Image Optimization Utilities
 *
 * This module provides helper functions for optimizing images stored in Supabase Storage
 * using Supabase's built-in image transformation API.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_STORAGE_BUCKET = 'venue-images';

export type ImageSize = 'thumbnail' | 'medium' | 'full';

export interface ImageTransformOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'origin' | 'webp';
}

/**
 * Predefined image sizes for different use cases
 */
const IMAGE_SIZES: Record<ImageSize, ImageTransformOptions> = {
  thumbnail: {
    width: 300,
    height: 200,
    quality: 75,
    format: 'webp'
  },
  medium: {
    width: 800,
    height: 600,
    quality: 85,
    format: 'webp'
  },
  full: {
    // No transformations - original image
  }
};

/**
 * Get the base storage URL for an image
 */
export function getImageStorageUrl(imagePath: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_STORAGE_BUCKET}/${imagePath}`;
}

/**
 * Get the transformation render URL for an image
 */
export function getImageRenderUrl(imagePath: string, options: ImageTransformOptions): string {
  const params = new URLSearchParams();

  if (options.width) params.append('width', options.width.toString());
  if (options.height) params.append('height', options.height.toString());
  if (options.quality) params.append('quality', options.quality.toString());
  if (options.format) params.append('format', options.format);

  const queryString = params.toString();
  const baseUrl = `${SUPABASE_URL}/storage/v1/render/image/public/${SUPABASE_STORAGE_BUCKET}/${imagePath}`;

  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * Get optimized image URL for a specific size
 *
 * @param imagePath - Path to image in Supabase storage (e.g., "kafkoff/image_1.jpg")
 * @param size - Predefined size: 'thumbnail', 'medium', or 'full'
 * @returns Optimized image URL
 *
 * @example
 * // For listing pages (thumbnails)
 * const thumbUrl = getOptimizedImageUrl('kafkoff/image_1.jpg', 'thumbnail');
 *
 * // For venue page galleries (medium)
 * const mediumUrl = getOptimizedImageUrl('kafkoff/image_1.jpg', 'medium');
 *
 * // For lightbox/zoom (full size)
 * const fullUrl = getOptimizedImageUrl('kafkoff/image_1.jpg', 'full');
 */
export function getOptimizedImageUrl(imagePath: string, size: ImageSize = 'medium'): string {
  const options = IMAGE_SIZES[size];

  // For full size, return direct storage URL (no transformations)
  if (size === 'full' || Object.keys(options).length === 0) {
    return getImageStorageUrl(imagePath);
  }

  // For thumbnail and medium, use render API with transformations
  return getImageRenderUrl(imagePath, options);
}

/**
 * Get multiple image URLs for responsive images (srcset)
 *
 * @param imagePath - Path to image in Supabase storage
 * @returns Object with URLs for different sizes
 */
export function getResponsiveImageUrls(imagePath: string) {
  return {
    thumbnail: getOptimizedImageUrl(imagePath, 'thumbnail'),
    medium: getOptimizedImageUrl(imagePath, 'medium'),
    full: getOptimizedImageUrl(imagePath, 'full'),
  };
}

/**
 * Convert old Cloudinary URLs to Supabase paths
 * This is a helper for migration if you have existing Cloudinary URLs
 */
export function convertCloudinaryToSupabasePath(cloudinaryUrl: string): string | null {
  // Example: https://res.cloudinary.com/.../venue-slug/image.jpg
  // Convert to: venue-slug/image.jpg

  const match = cloudinaryUrl.match(/\/prostormat\/([^/]+\/[^/]+\.(jpg|jpeg|png|webp))/i);
  return match ? match[1] : null;
}

/**
 * Build image path for Supabase storage
 *
 * @param venueSlug - Venue slug (e.g., "kafkoff")
 * @param imageName - Image filename (e.g., "image_1.jpg")
 */
export function buildImagePath(venueSlug: string, imageName: string): string {
  return `${venueSlug}/${imageName}`;
}

/**
 * Extract venue slug from image path
 */
export function extractVenueSlug(imagePath: string): string {
  return imagePath.split('/')[0];
}

/**
 * Get image URLs for a venue's images array
 * Returns optimized thumbnail URLs by default
 */
export function getVenueImageUrls(images: string[], size: ImageSize = 'thumbnail'): string[] {
  return images.map(imagePath => getOptimizedImageUrl(imagePath, size));
}
