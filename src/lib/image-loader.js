export default function supabaseLoader({ src, width, quality }) {
  // If the src is already a full URL (starts with http:// or https://), return it as-is
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src
  }

  // If it's a local path (starts with /), use default Next.js image optimization
  if (src.startsWith('/')) {
    const params = [`w=${width}`]
    if (quality) {
      params.push(`q=${quality || 75}`)
    }
    return `/_next/image?url=${encodeURIComponent(src)}&${params.join('&')}`
  }

  // Otherwise, it's a Supabase storage path - construct the full URL
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) {
    console.warn('NEXT_PUBLIC_SUPABASE_URL is not defined, falling back to src:', src)
    return src
  }

  // Construct Supabase storage URL
  // Format: https://[project].supabase.co/storage/v1/object/public/venue-images/[path]
  const bucketName = 'venue-images'
  const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${src}`

  return publicUrl
}
