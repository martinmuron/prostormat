/** @type {import('next').NextConfig} */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL

const imageDomains = ['images.unsplash.com']

if (supabaseUrl) {
  try {
    const { host } = new URL(supabaseUrl)
    if (host && !imageDomains.includes(host)) {
      imageDomains.push(host)
    }
  } catch (error) {
    console.warn('Invalid SUPABASE URL provided, skipping image domain configuration.')
  }
}

const nextConfig = {
  images: {
    domains: imageDomains,
  },
}

module.exports = nextConfig
