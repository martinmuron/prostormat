/** @type {import('next').NextConfig} */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL

// Build remote patterns for Next.js Image optimization
const remotePatterns = [
  {
    protocol: 'https',
    hostname: 'images.unsplash.com',
    port: '',
    pathname: '/**',
  }
]

// Add Supabase domain if configured
if (supabaseUrl) {
  try {
    const { hostname } = new URL(supabaseUrl)
    if (hostname) {
      remotePatterns.push({
        protocol: 'https',
        hostname: hostname,
        port: '',
        pathname: '/storage/v1/**',
      })
    }
  } catch (error) {
    console.warn('Invalid SUPABASE URL provided, skipping image domain configuration.')
  }
}

const nextConfig = {
  images: {
    remotePatterns,
    loader: 'custom',
    loaderFile: './src/lib/image-loader.js',
  },
}

module.exports = nextConfig
