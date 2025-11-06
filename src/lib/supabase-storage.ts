import { createClient } from '@/utils/supabase/client'

const supabase = createClient()

export async function uploadVenueImages(files: File[], venueId: string): Promise<string[]> {
  const uploadedUrls: string[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const fileExt = file.name.split('.').pop()
    const fileName = `${venueId}-${i}-${Date.now()}.${fileExt}`
    const filePath = `venue-images/${fileName}`

    try {
      const { error } = await supabase.storage
        .from('venues')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Error uploading file:', error)
        throw error
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('venues')
        .getPublicUrl(filePath)

      uploadedUrls.push(publicUrl)
    } catch (error) {
      console.error(`Failed to upload image ${i}:`, error)
      throw new Error(`Failed to upload image ${file.name}`)
    }
  }

  return uploadedUrls
}

/**
 * Upload images without requiring a venue ID
 * Uses a timestamp-based session ID for organizing uploads
 * Perfect for use in forms before venue creation
 */
export async function uploadImages(files: File[]): Promise<string[]> {
  const uploadedUrls: string[] = []
  const sessionId = `upload-${Date.now()}`

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const fileExt = file.name.split('.').pop()
    const fileName = `${sessionId}-${i}.${fileExt}`
    const filePath = `venue-images/${fileName}`

    try {
      const { error } = await supabase.storage
        .from('venues')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Error uploading file:', error)
        throw error
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('venues')
        .getPublicUrl(filePath)

      uploadedUrls.push(publicUrl)
    } catch (error) {
      console.error(`Failed to upload image ${i}:`, error)
      throw new Error(`Failed to upload image ${file.name}`)
    }
  }

  return uploadedUrls
}

export async function deleteVenueImages(imageUrls: string[]): Promise<void> {
  for (const url of imageUrls) {
    try {
      // Extract file path from URL
      const urlParts = url.split('/')
      const bucketIndex = urlParts.findIndex(part => part === 'venues')
      if (bucketIndex === -1) continue

      const filePath = urlParts.slice(bucketIndex + 1).join('/')

      const { error } = await supabase.storage
        .from('venues')
        .remove([filePath])

      if (error) {
        console.error('Error deleting file:', error)
      }
    } catch (error) {
      console.error('Failed to delete image:', error)
    }
  }
}