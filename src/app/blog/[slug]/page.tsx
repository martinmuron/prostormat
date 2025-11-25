import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { Calendar, ArrowLeft, Clock, BookOpen } from "lucide-react"

import { db } from "@/lib/db"
import { staticBlogPosts } from "@/data/blog-posts"
import { Badge } from "@/components/ui/badge"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"
import { absoluteUrl, DEFAULT_OG_IMAGE, stripHtml } from "@/lib/seo"
import { generateBlogPostingSchema, generateBreadcrumbSchema, schemaToJsonLd } from "@/lib/schema-markup"

// Revalidate blog post pages every 60 seconds
export const revalidate = 60

type BlogPostData = {
  id: string
  title: string
  slug: string
  excerpt?: string | null
  content: string
  coverImage?: string | null
  tags?: string | null
  publishedAt: string
  author?: { name: string | null; email: string | null } | null
  metaTitle?: string | null
  metaDescription?: string | null
}

function parseTags(value?: string | null) {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function mapFallbackPost(slug: string): BlogPostData | null {
  const fallback = staticBlogPosts.find((post) => post.slug === slug)
  if (!fallback) return null

  return {
    id: fallback.id,
    title: fallback.title,
    slug: fallback.slug,
    excerpt: fallback.excerpt,
    content: fallback.content.trim(),
    coverImage: fallback.coverImage,
    tags: fallback.tags,
    publishedAt: fallback.publishedAt,
    author: { name: fallback.author.name, email: fallback.author.email },
    metaTitle: fallback.metaTitle,
    metaDescription: fallback.metaDescription,
  }
}

async function getBlogPost(slug: string): Promise<BlogPostData | null> {
  try {
    const post = await db.blogPost.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    if (post && post.status === "published") {
      const publishedAt = (post.publishedAt ?? post.createdAt).toISOString()

      return {
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt ?? undefined,
        content: post.content,
        coverImage: post.coverImage ?? undefined,
        tags: post.tags,
        publishedAt,
        author: post.author,
        metaTitle: post.metaTitle ?? undefined,
        metaDescription: post.metaDescription ?? undefined,
      }
    }
  } catch (error) {
    console.error("Error fetching blog post:", error)
  }

  return mapFallbackPost(slug)
}

function estimateReadingTime(html: string) {
  const text = html.replace(/<[^>]+>/g, " ")
  const words = text.trim().split(/\s+/).filter(Boolean)
  const wordsPerMinute = 220
  return Math.max(3, Math.ceil(words.length / wordsPerMinute))
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

function addAnchorsToHeadings(html: string) {
  return html.replace(/<h2>(.*?)<\/h2>/g, (_, heading) => {
    const id = slugify(heading)
    return `<h2 id="${id}">${heading}</h2>`
  })
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPost(slug)

  if (!post) {
    return {
      title: "Článek nenalezen | Prostormat",
      description: "Požadovaný blogový článek nebyl nalezen.",
    }
  }

  const title = post.metaTitle ?? post.title
  const tags = parseTags(post.tags)
  const fallbackDescription = stripHtml(post.content).slice(0, 155).trim()
  const description = post.metaDescription ?? post.excerpt ?? (fallbackDescription || "Článek z blogu Prostormat.")
  const canonicalUrl = absoluteUrl(`/blog/${post.slug}`)
  const ogImage = post.coverImage ? absoluteUrl(post.coverImage) : DEFAULT_OG_IMAGE
  const images = [
    {
      url: ogImage,
      width: 1200,
      height: 630,
      alt: post.title,
    },
  ]

  return {
    title,
    description,
    keywords: tags.length ? tags : undefined,
    authors: post.author?.name ? [{ name: post.author.name }] : undefined,
    openGraph: {
      title,
      description,
      type: "article",
      url: canonicalUrl,
      images,
      siteName: "Prostormat",
      publishedTime: post.publishedAt,
      tags: tags.length ? tags : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: canonicalUrl,
    },
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getBlogPost(slug)

  if (!post) {
    notFound()
  }

  const tags = parseTags(post.tags)
  const readingTime = estimateReadingTime(post.content)
  const contentWithAnchors = addAnchorsToHeadings(post.content)
  const seoDescription = post.metaDescription ?? post.excerpt ?? (stripHtml(post.content).slice(0, 155).trim() || "Článek z blogu Prostormat.")
  const canonicalUrl = absoluteUrl(`/blog/${post.slug}`)
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Domů", url: absoluteUrl("/") },
    { name: "Blog", url: absoluteUrl("/blog") },
    { name: post.title, url: canonicalUrl },
  ])
  const articleSchema = generateBlogPostingSchema({
    title: post.metaTitle ?? post.title,
    description: seoDescription,
    slug: post.slug,
    contentHtml: post.content,
    coverImage: post.coverImage,
    publishedAt: post.publishedAt,
    tags,
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={schemaToJsonLd(breadcrumbSchema)}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={schemaToJsonLd(articleSchema)}
      />
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-white pb-20 animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Breadcrumbs
            items={[
              { label: "Blog", href: "/blog" },
              { label: post.title, href: `/blog/${post.slug}` },
            ]}
            className="mb-8"
          />
          <Link
            href="/blog"
            className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium text-gray-600 bg-white/50 border border-gray-200 hover:bg-white hover:text-gray-900 hover:shadow-sm transition-all duration-200 mb-12 backdrop-blur-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zpět na všechny články
          </Link>

          <div className="max-w-4xl mx-auto text-center space-y-8 mb-16">
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs uppercase tracking-[0.2em] text-blue-600 font-bold">
              <span>Blog Prostormat</span>
              <span className="h-1 w-1 rounded-full bg-blue-300" />
              <span>{new Date(post.publishedAt).toLocaleDateString('cs-CZ')}</span>
              <span className="h-1 w-1 rounded-full bg-blue-300" />
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {readingTime} min čtení
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight leading-[1.1]">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
                {post.excerpt}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-center gap-4">
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100 transition-colors">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {post.coverImage && (
            <div className="relative max-w-6xl mx-auto mb-16">
              <div className="group relative overflow-hidden rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  width={1600}
                  height={900}
                  className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 rounded-[2.5rem] ring-1 ring-inset ring-black/5" />
              </div>
            </div>
          )}

          <div className="max-w-3xl mx-auto">
            <article className="prose prose-lg prose-slate max-w-none 
              prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-gray-900 
              prose-p:text-gray-600 prose-p:leading-loose
              prose-a:text-blue-600 prose-a:font-semibold prose-a:no-underline hover:prose-a:text-blue-700 hover:prose-a:underline
              prose-strong:text-gray-900 prose-strong:font-bold
              prose-img:rounded-2xl prose-img:shadow-lg
              prose-blockquote:border-l-blue-500 prose-blockquote:bg-blue-50/50 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
              prose-li:marker:text-blue-500"
            >
              <div
                dangerouslySetInnerHTML={{ __html: contentWithAnchors }}
              />
            </article>

            <div className="mt-16 pt-8 border-t border-gray-100">
              <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-xl shadow-gray-200/40 border border-gray-100">
                <div className="flex flex-col items-center text-center gap-6">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-gray-900">Líbil se vám článek?</h3>
                    <p className="text-gray-600 max-w-lg mx-auto">
                      Objevte ty nejlepší prostory pro vaši příští akci nebo nám dejte vědět, co hledáte.
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-4">
                    <Link 
                      href="/prostory" 
                      className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white border-2 border-gray-100 text-gray-900 font-semibold hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                    >
                      <BookOpen className="w-5 h-5" />
                      Prohlédnout prostory
                    </Link>
                    <Link 
                      href="/rychla-poptavka" 
                      className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transition-all duration-200"
                    >
                      <Calendar className="w-5 h-5" />
                      Nezávazná poptávka
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
