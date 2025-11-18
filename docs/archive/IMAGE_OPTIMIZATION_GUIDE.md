# 🖼️ Image Optimization Guide - Supabase Storage

## Overview

All venue images are now stored in **Supabase Storage** with automatic optimization using Supabase's built-in image transformation API. This saves bandwidth and improves page load times.

---

## How It Works

### 1. Storage Structure

Images are stored in Supabase Storage bucket: `venue-images`

**Path structure:**
```
venue-images/
├── kafkoff/
│   ├── image_1.jpg
│   ├── image_2.jpg
│   └── image_3.jpg
├── space-cafe-hub-karlin/
│   └── image_1.jpg
└── space-cafe-hub-karlin_berlin-meeting-room/
    └── image_1.jpg
```

### 2. Automatic Optimization

Supabase automatically optimizes images when you add transformation parameters to the URL:

**Original URL (full size):**
```
https://your-project.supabase.co/storage/v1/object/public/venue-images/kafkoff/image_1.jpg
```

**Thumbnail URL (300x200, optimized):**
```
https://your-project.supabase.co/storage/v1/render/image/public/venue-images/kafkoff/image_1.jpg?width=300&height=200&quality=75&format=webp
```

### 3. Predefined Sizes

We have 3 predefined sizes for different use cases:

| Size | Dimensions | Quality | Use Case | Bandwidth |
|------|------------|---------|----------|-----------|
| **Thumbnail** | 300x200px | 75% | Listing pages, cards | ~15-30KB |
| **Medium** | 800x600px | 85% | Venue galleries | ~80-120KB |
| **Full** | Original | 100% | Lightbox, zoom | ~200-500KB |

---

## Usage

### React Components

We've created optimized React components that automatically handle image optimization:

#### 1. OptimizedImage (Single Image)

```tsx
import { OptimizedImage } from '@/components/venue/OptimizedImage';

// Thumbnail for listing page
<OptimizedImage
  imagePath="kafkoff/image_1.jpg"
  alt="Kafkoff venue"
  size="thumbnail"
  width={300}
  height={200}
/>

// Medium for venue page
<OptimizedImage
  imagePath="kafkoff/image_1.jpg"
  alt="Kafkoff interior"
  size="medium"
  width={800}
  height={600}
/>

// Full size for modal
<OptimizedImage
  imagePath="kafkoff/image_1.jpg"
  alt="Kafkoff full view"
  size="full"
  fill
/>
```

#### 2. VenueGallery (Multiple Images)

```tsx
import { VenueGallery } from '@/components/venue/OptimizedImage';

<VenueGallery
  images={venue.images}
  venueName={venue.name}
  onImageClick={(index) => openLightbox(index)}
/>
```

#### 3. VenueCardImage (Listing Cards)

```tsx
import { VenueCardImage } from '@/components/venue/OptimizedImage';

<VenueCardImage
  imagePath={venue.images[0]}
  venueName={venue.name}
  className="rounded-lg"
/>
```

### Helper Functions

If you need raw URLs for custom implementations:

```typescript
import { getOptimizedImageUrl, getResponsiveImageUrls } from '@/lib/supabase-images';

// Get single optimized URL
const thumbnailUrl = getOptimizedImageUrl('kafkoff/image_1.jpg', 'thumbnail');
const mediumUrl = getOptimizedImageUrl('kafkoff/image_1.jpg', 'medium');
const fullUrl = getOptimizedImageUrl('kafkoff/image_1.jpg', 'full');

// Get all sizes for responsive images
const urls = getResponsiveImageUrls('kafkoff/image_1.jpg');
// Returns: { thumbnail: '...', medium: '...', full: '...' }
```

---

## Bandwidth Savings

### Before Optimization (All Full Size)
- **Listing page** (20 venues): 20 × 500KB = **10MB** 📈
- **Venue gallery** (10 images): 10 × 500KB = **5MB** 📈
- **Total per user visit**: **~15MB** 📈

### After Optimization (Smart Sizing)
- **Listing page** (20 venues): 20 × 25KB = **500KB** ✅
- **Venue gallery** (10 images): 10 × 100KB = **1MB** ✅
- **Total per user visit**: **~1.5MB** ✅

**Savings: 90% bandwidth reduction!** 🎉

---

## Best Practices

### ✅ DO

1. **Always use OptimizedImage component** instead of Next.js Image directly
2. **Use thumbnail size** for all listing pages and cards
3. **Use medium size** for venue page galleries
4. **Use full size** only in lightbox/modal views
5. **Enable lazy loading** for off-screen images (default behavior)

### ❌ DON'T

1. **Don't load full-size images** on listing pages
2. **Don't bypass optimization** unless absolutely necessary
3. **Don't forget alt text** for accessibility
4. **Don't load all gallery images at once** - use pagination or lazy load

---

## Implementation Checklist

### Listing Pages
- [x] Venue listing page - uses thumbnails
- [ ] Search results - update to use `VenueCardImage`
- [ ] Featured venues - update to use `size="thumbnail"`
- [ ] Related venues - update to use `size="thumbnail"`

### Venue Detail Pages
- [ ] Main image - use `size="medium"`
- [ ] Image gallery - use `VenueGallery` component
- [ ] Sub-location images - use `size="thumbnail"`

### Admin Pages
- [ ] Admin venue management - use `size="thumbnail"` for previews
- [ ] Image upload preview - use `size="medium"`

---

## Troubleshooting

### Image Not Loading

**Check:**
1. Is the image path correct? (e.g., `venue-slug/image_name.jpg`)
2. Is the Supabase bucket public?
3. Are Supabase env vars set in `.env.local`?

### Image Quality Too Low

**Solution:**
- Increase quality parameter: `quality=90` instead of `quality=75`
- Or use `size="medium"` instead of `size="thumbnail"`

### Bandwidth Still High

**Check:**
1. Are you using `size="thumbnail"` on listing pages?
2. Are you loading too many images at once?
3. Consider pagination for long galleries

---

## Monitoring

### Check Supabase Storage Usage

1. Go to Supabase Dashboard → Storage
2. Check `venue-images` bucket size
3. Monitor bandwidth usage in Settings → Usage

### Current Stats (After Upload)
- **Total Images**: ~812 folders × 30 images = ~24,000 images
- **Total Storage**: Estimated ~10-15GB
- **Bandwidth Savings**: 90% reduction with optimization

---

## Migration Notes

All images have been:
- ✅ Uploaded to Supabase Storage
- ✅ Organized by venue slug
- ✅ Database updated with Supabase paths
- ✅ Non-Prague venue folders deleted (317 folders)
- ✅ Optimization components created

---

## Technical Details

### Supabase Image Transformation Parameters

| Parameter | Options | Example |
|-----------|---------|---------|
| `width` | 1-5000px | `width=300` |
| `height` | 1-5000px | `height=200` |
| `quality` | 1-100 | `quality=75` |
| `format` | `origin`, `webp` | `format=webp` |
| `resize` | `cover`, `contain`, `fill` | `resize=cover` |

### Environment Variables Required

```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

---

## Support

For issues or questions:
1. Check this guide first
2. Review `/src/lib/supabase-images.ts` for implementation details
3. Check Supabase logs for storage errors
4. Verify environment variables are set correctly

---

*Last Updated: October 2, 2025*
*Image Upload Complete: ✅*
*Total Venues: 866*
*Total Images: ~24,000*
