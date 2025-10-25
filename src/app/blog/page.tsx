import { Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import type { Metadata } from "next"
import { Calendar, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { db } from "@/lib/db"
import { fallbackBlogPosts } from "@/data/blog-fallback-posts"
import { DEFAULT_OG_IMAGE, DEFAULT_OG_IMAGES } from "@/lib/seo"

type BlogPostWithRelations = {
  id: string
  title: string
  slug: string
  excerpt?: string | null
  coverImage?: string | null
  tags?: string | null
  publishedAt: string | Date
  author?: { name: string | null; email: string | null } | null
  prostormat_users?: { name: string | null; email: string | null } | null
}

async function getBlogPosts() {
  try {
    const posts = await db.blogPost.findMany({
      where: {
        status: "published"
      },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          }
        }
      },
      orderBy: {
        publishedAt: "desc"
      },
      take: 10
    })
    return posts
  } catch (error) {
    console.error("Error fetching blog posts:", error)
    return []
  }
}

export const metadata: Metadata = {
  title: "Blog o firemních akcích a event marketingu | Prostormat",
  description: "Tipy na prostory, inspirace pro firemní akce, svatby a teambuildingy v Praze. Čerstvé novinky a know-how od týmu Prostormat.",
  alternates: {
    canonical: "https://prostormat.cz/blog",
  },
  openGraph: {
    title: "Blog Prostormat | Firemní akce a event marketing",
    description: "Inspirace a praktické rady pro organizaci firemních akcí, svateb a teambuildingů v Praze.",
    url: "https://prostormat.cz/blog",
    siteName: "Prostormat",
    images: [...DEFAULT_OG_IMAGES],
    locale: "cs_CZ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog Prostormat | Firemní akce a event marketing",
    description: "Inspirace a praktické rady pro organizaci firemních akcí, svateb a teambuildingů v Praze.",
    images: [DEFAULT_OG_IMAGE],
  },
}

function formatExcerpt(excerpt?: string | null) {
  if (!excerpt) return ""
  const clean = excerpt.replace(/\s+/g, " ").trim()
  if (clean.length <= 140) return clean
  return `${clean.slice(0, 137)}…`
}

function BlogPostCard({ post, className }: { post: BlogPostWithRelations; className?: string }) {
  const tags = post.tags ? JSON.parse(post.tags) : []
  const excerpt = formatExcerpt(post.excerpt)

  return (
    <Link href={`/blog/${post.slug}`} className="group block h-full">
      <Card
        className={cn(
          "flex h-full flex-col overflow-hidden border border-gray-200 bg-white p-0 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl",
          "rounded-3xl",
          className
        )}
      >
        {post.coverImage && (
          <div className="relative aspect-[4/3] overflow-hidden sm:aspect-video">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
              priority={false}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </div>
        )}

        <CardContent className="flex flex-1 flex-col space-y-5 p-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold leading-tight text-gray-900 transition-colors duration-300 group-hover:text-blue-700 sm:text-xl">
              {post.title}
            </h2>

            {excerpt && (
              <p className="text-sm leading-relaxed text-gray-600 sm:text-base">
                {excerpt}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.22em] text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(post.publishedAt).toLocaleDateString("cs-CZ")}</span>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag: string) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[0.65rem] font-semibold tracking-[0.18em] text-slate-600"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <span className="mt-auto inline-flex items-center justify-between rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition-all duration-300 group-hover:border-blue-600 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-lg">
            <span>Objevit celý článek</span>
            <ChevronRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </CardContent>
      </Card>
    </Link>
  )
}

function BlogGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="overflow-hidden h-full">
          <CardContent className="p-6 h-full flex flex-col">
            <div className="flex-1 space-y-4">
              <div className="aspect-video bg-gray-200 rounded-lg animate-pulse" />
              <div className="space-y-2 flex-1">
                <div className="h-6 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
              </div>
            </div>
            <div className="mt-auto">
              <div className="h-10 bg-gray-200 rounded-xl animate-pulse w-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

async function BlogGrid() {
  const posts = await getBlogPosts()

  const displayPosts =
    posts.length > 0
      ? posts.map((post) => ({
          ...post,
          publishedAt: (post.publishedAt ?? post.createdAt).toISOString(),
        }))
      : fallbackBlogPosts.map((post) => ({
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          coverImage: post.coverImage,
          tags: post.tags,
          publishedAt: post.publishedAt,
          author: { name: post.author.name, email: post.author.email },
          content: post.content,
        }))

  if (displayPosts.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-3xl font-semibold text-gray-900 mb-4">Zatím žádné články</h2>
        <p className="text-gray-600 max-w-xl mx-auto">
          Pracujeme na tom, aby zde byla inspirace pro organizátory i majitele prostor. Zkuste to prosím později.
        </p>
      </div>
    )
  }

  const [featuredPost, ...otherPosts] = displayPosts

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
        <div className="grid lg:grid-cols-2">
          <div className="relative h-72 sm:h-96 lg:h-full">
            <Image
              src={featuredPost.coverImage || 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=1200&h=800&fit=crop'}
              alt={featuredPost.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-black/20 to-transparent" />
          </div>
          <div className="p-8 sm:p-10 lg:p-12 flex flex-col justify-center bg-gradient-to-br from-white via-white to-slate-50">
            <div className="uppercase tracking-[0.2em] text-xs text-blue-600 font-semibold mb-4">Čerstvý článek</div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-5 leading-tight">
              {featuredPost.title}
            </h1>
            <p className="text-base sm:text-lg text-gray-600 mb-6 leading-relaxed">
              {formatExcerpt(featuredPost.excerpt)}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
              <span className="inline-flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date(featuredPost.publishedAt).toLocaleDateString('cs-CZ', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div className="flex flex-wrap gap-3 mb-8">
              {featuredPost.tags ? JSON.parse(featuredPost.tags).slice(0, 3).map((tag: string) => (
                <Badge key={tag} variant="secondary" className="bg-blue-50 text-blue-700 border border-blue-100">
                  {tag}
                </Badge>
              )) : null}
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/blog/${featuredPost.slug}`}
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-transform hover:-translate-y-0.5 hover:shadow-xl"
              >
                Otevřít celý článek
              </Link>
              <Link href="/prostory" className="inline-flex items-center justify-center rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:border-gray-400 transition-colors">
                Prohlédnout prostory
              </Link>
            </div>
          </div>
        </div>
      </section>

      {otherPosts.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Další inspirace</h2>
            <Link href="/prostory" className="text-sm text-blue-600 hover:text-blue-700 inline-flex items-center gap-1">
              Najít prostor pro akci
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherPosts.map((post) => (
              <BlogPostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
        <Suspense fallback={<BlogGridSkeleton />}>
          <BlogGrid />
        </Suspense>
      </div>
    </div>
  )
}
