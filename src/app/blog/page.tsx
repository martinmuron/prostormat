import { Suspense } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  coverImage?: string
  tags: string[]
  publishedAt: string
  author: { name: string }
}

interface BlogResponse {
  posts: BlogPost[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

async function getBlogPosts(page: number = 1, tag?: string): Promise<BlogResponse> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: "12"
    })
    
    if (tag) {
      params.append("tag", tag)
    }

    const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/blog?${params}`, {
      cache: 'no-store'
    })
    
    if (!res.ok) {
      throw new Error('Failed to fetch blog posts')
    }
    
    return res.json()
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return {
      posts: [],
      pagination: { page: 1, limit: 12, total: 0, pages: 0 }
    }
  }
}

function BlogPostCard({ post }: { post: BlogPost }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/blog/${post.slug}`}>
        {post.coverImage && (
          <div className="aspect-[16/9] bg-gray-200 overflow-hidden">
            <img 
              src={post.coverImage} 
              alt={post.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <div className="p-4 sm:p-6">
          <div className="flex flex-wrap gap-2 mb-3">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-black mb-2 line-clamp-2">
            {post.title}
          </h2>
          {post.excerpt && (
            <p className="text-sm sm:text-body text-gray-600 mb-4 line-clamp-3">
              {post.excerpt}
            </p>
          )}
          <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
            <span>By {post.author.name}</span>
            <span>{new Date(post.publishedAt).toLocaleDateString('cs-CZ')}</span>
          </div>
        </div>
      </Link>
    </Card>
  )
}

function BlogPostsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <div className="aspect-[16/9] bg-gray-200 animate-pulse" />
          <div className="p-4 sm:p-6">
            <div className="flex gap-2 mb-3">
              <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
              <div className="h-5 w-20 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="h-6 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-1 w-3/4" />
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-4 w-1/2" />
            <div className="flex justify-between">
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

async function BlogPosts({ searchParams }: { searchParams: { page?: string; tag?: string } }) {
  const page = parseInt(searchParams.page || '1')
  const tag = searchParams.tag
  
  const { posts, pagination } = await getBlogPosts(page, tag)

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg sm:text-xl font-semibold text-black mb-2">
          {tag ? `Žádné články s tagem "${tag}"` : "Žádné články nenalezeny"}
        </h3>
        <p className="text-sm sm:text-body text-gray-600">
          {tag ? "Zkuste jiný tag nebo se podívejte na všechny články." : "Brzy přidáme nové články."}
        </p>
        {tag && (
          <Link 
            href="/blog"
            className="inline-block mt-4 px-6 py-2 bg-black text-white rounded-full text-sm hover:bg-gray-800 transition-colors"
          >
            Zobrazit všechny články
          </Link>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <BlogPostCard key={post.id} post={post} />
        ))}
      </div>
      
      {pagination.pages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-12">
          {page > 1 && (
            <Link 
              href={`/blog?page=${page - 1}${tag ? `&tag=${tag}` : ''}`}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              Předchozí
            </Link>
          )}
          
          <span className="px-4 py-2 text-sm text-gray-600">
            Stránka {page} z {pagination.pages}
          </span>
          
          {page < pagination.pages && (
            <Link 
              href={`/blog?page=${page + 1}${tag ? `&tag=${tag}` : ''}`}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              Další
            </Link>
          )}
        </div>
      )}
    </>
  )
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; tag?: string }>
}) {
  const resolvedSearchParams = await searchParams
  
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-4">
            Blog Prostormat
          </h1>
          <p className="text-sm sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Tipy, trendy a inspirace pro vaše akce. Objevte nejlepší prostory a získejte rady pro organizaci nezapomenutelných událostí.
          </p>
          {resolvedSearchParams.tag && (
            <div className="mt-4">
              <Badge variant="secondary" className="mr-2">
                Tag: {resolvedSearchParams.tag}
              </Badge>
              <Link 
                href="/blog"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Zrušit filtr
              </Link>
            </div>
          )}
        </div>

        <Suspense fallback={<BlogPostsSkeleton />}>
          <BlogPosts searchParams={resolvedSearchParams} />
        </Suspense>
      </div>
    </div>
  )
}

export const metadata = {
  title: "Blog - Prostormat",
  description: "Tipy, trendy a inspirace pro vaše akce. Objevte nejlepší prostory a získejte rady pro organizaci nezapomenutelných událostí.",
  openGraph: {
    title: "Blog - Prostormat",
    description: "Tipy, trendy a inspirace pro vaše akce. Objevte nejlepší prostory a získejte rady pro organizaci nezapomenutelných událostí.",
    type: "website"
  }
} 