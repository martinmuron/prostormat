import { Suspense } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"
import Link from "next/link"
import { Calendar, User, ArrowRight } from "lucide-react"

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

function BlogPostCard({ post }: { post: any }) {
  const tags = post.tags ? JSON.parse(post.tags) : []
  
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="space-y-4">
          {post.coverImage && (
            <div className="aspect-video relative overflow-hidden rounded-lg">
              <img
                src={post.coverImage}
                alt={post.title}
                className="object-cover w-full h-full"
              />
            </div>
          )}
          
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {post.title}
            </h2>
            
            {post.excerpt && (
              <p className="text-gray-600 mb-4 line-clamp-3">
                {post.excerpt}
              </p>
            )}
            
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>{post.author.name || post.author.email}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
              </div>
            </div>
            
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            
            <Link href={`/blog/${post.slug}`}>
              <Button variant="outline" className="group rounded-xl border-2 border-gray-300 hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl">
                Číst více
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function BlogGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="aspect-video bg-gray-200 rounded-lg animate-pulse" />
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

async function BlogGrid() {
  const posts = await getBlogPosts()
  
  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No blog posts yet</h3>
        <p className="text-gray-600">Check back soon for new content!</p>
      </div>
    )
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <BlogPostCard key={post.id} post={post} />
      ))}
    </div>
  )
}

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Užitečné tipy a rady pro organizaci eventů v Praze
          </p>
        </div>
        
        <Suspense fallback={<BlogGridSkeleton />}>
          <BlogGrid />
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