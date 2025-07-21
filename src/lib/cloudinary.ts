import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  bytes: number;
}

/**
 * Upload an image to Cloudinary
 * @param file - File or base64 string to upload
 * @param folder - Optional folder to organize uploads
 * @param transformation - Optional transformation parameters
 * @returns Promise with upload result
 */
export async function uploadImage(
  file: string | Buffer,
  folder?: string,
  transformation?: any
): Promise<CloudinaryUploadResult> {
  try {
    const uploadOptions: any = {
      resource_type: 'image',
      folder: folder || 'prostormat',
      quality: 'auto:good',
      fetch_format: 'auto',
    };

    if (transformation) {
      uploadOptions.transformation = transformation;
    }

    const result = await cloudinary.uploader.upload(file, uploadOptions);
    
    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      resource_type: result.resource_type,
      created_at: result.created_at,
      bytes: result.bytes,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
}

/**
 * Delete an image from Cloudinary
 * @param publicId - The public ID of the image to delete
 * @returns Promise with deletion result
 */
export async function deleteImage(publicId: string): Promise<any> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete image from Cloudinary');
  }
}

/**
 * Generate optimized image URL with transformations
 * @param publicId - The public ID of the image
 * @param transformations - Transformation parameters
 * @returns Optimized image URL
 */
export function getOptimizedImageUrl(
  publicId: string,
  transformations?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
    format?: string;
  }
): string {
  return cloudinary.url(publicId, {
    quality: transformations?.quality || 'auto:good',
    fetch_format: transformations?.format || 'auto',
    width: transformations?.width,
    height: transformations?.height,
    crop: transformations?.crop || 'fill',
  });
}

/**
 * Generate multiple sizes for responsive images
 * @param publicId - The public ID of the image
 * @returns Object with different image sizes
 */
export function getResponsiveImageUrls(publicId: string) {
  return {
    thumbnail: getOptimizedImageUrl(publicId, { width: 150, height: 150, crop: 'thumb' }),
    small: getOptimizedImageUrl(publicId, { width: 400, height: 300 }),
    medium: getOptimizedImageUrl(publicId, { width: 800, height: 600 }),
    large: getOptimizedImageUrl(publicId, { width: 1200, height: 900 }),
    original: getOptimizedImageUrl(publicId),
  };
}

export default cloudinary;
