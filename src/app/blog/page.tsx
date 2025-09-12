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
    <Card className="overflow-hidden hover-lift transition-all duration-500 group border-2 border-black bg-white rounded-2xl h-full flex flex-col">
      <Link href={`/blog/${post.slug}`}>
        {post.coverImage && (
          <div className="aspect-video relative overflow-hidden">
            <img
              src={post.coverImage}
              alt={post.title}
              className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
              <div className="w-10 h-10 bg-white/95 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm">
                <span className="text-sm font-bold text-black">→</span>
              </div>
            </div>
          </div>
        )}
      </Link>
      
      <CardContent className="p-4 sm:p-6 bg-white flex flex-col justify-between h-full">
        <Link href={`/blog/${post.slug}`}>
          <div className="flex-1 space-y-4">
            <div className="flex-1">
              <h2 className="text-lg sm:text-xl font-bold text-black group-hover:text-gray-500 transition-all duration-300 mb-2 leading-tight">
                {post.title}
              </h2>
              
              {post.excerpt && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                  {post.excerpt}
                </p>
              )}
              
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>{post.prostormat_users?.name || post.prostormat_users?.email || post.author?.name || 'Anonymous'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                </div>
              </div>
              
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Link>
        
        <Link href={`/blog/${post.slug}`} className="mt-auto">
          <Button 
            variant="outline" 
            size="sm"
            className="w-full bg-black text-white border-2 border-black hover:bg-gray-800 hover:text-white transition-all duration-200 font-medium rounded-xl"
          >
            <span>Číst více</span>
            <span className="ml-2 transform group-hover:translate-x-1 transition-transform duration-300">→</span>
          </Button>
        </Link>
      </CardContent>
    </Card>
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

// Placeholder blog posts for when database is empty
const placeholderPosts = [
  {
    id: "placeholder-1",
    title: "Jak vybrat ideální prostor pro firemní akci",
    slug: "jak-vybrat-idealni-prostor-pro-firemni-akci",
    excerpt: "Plánujete firemní akci a nevíte, na co se zaměřit při výběru prostoru? Zde najdete praktické tipy a checklisk, který vám pomůže vybrat to pravé místo.",
    coverImage: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&h=400&fit=crop",
    author: { name: "Prostormat Team", email: "team@prostormat.cz" },
    publishedAt: new Date("2024-01-15"),
    tags: '["Firemní akce", "Tipy", "Prostory"]'
  },
  {
    id: "placeholder-2",
    title: "5 trendů v organizaci svateb pro rok 2025",
    slug: "5-trendu-v-organizaci-svateb-pro-rok-2025",
    excerpt: "Objevte nejnovější trendy ve svatebním průmyslu. Od udržitelných svateb po netradiční prostory - inspirujte se pro vaši nezapomenutelnou oslavu.",
    coverImage: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&h=400&fit=crop",
    author: { name: "Prostormat Team", email: "team@prostormat.cz" },
    publishedAt: new Date("2024-01-10"),
    tags: '["Svatby", "Trendy", "2025"]'
  },
  {
    id: "placeholder-3",
    title: "Teambuilding v neobvyklých prostorech",
    slug: "teambuilding-v-neobvyklych-prostorech",
    excerpt: "Tradiční konferenční sály už nebaví? Přečtěte si, jak netradičně prostory mohou oživit váš teambuilding a posílit týmovou soudržnost.",
    coverImage: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop",
    author: { name: "Prostormat Team", email: "team@prostormat.cz" },
    publishedAt: new Date("2024-01-05"),
    tags: '["Teambuilding", "Netradičně", "Týmová práce"]'
  },
  {
    id: "placeholder-4",
    title: "Checklist pro organizaci úspěšné konference",
    slug: "checklist-pro-organizaci-uspesne-konference",
    excerpt: "Kompletní průvodce plánováním konference od výběru prostoru až po day-of koordinaci. Nezapomeňte na žádný důležitý detail.",
    coverImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop",
    author: { name: "Prostormat Team", email: "team@prostormat.cz" },
    publishedAt: new Date("2023-12-28"),
    tags: '["Konference", "Checklist", "Plánování"]'
  },
  {
    id: "placeholder-5",
    title: "Jak ušetřit na pronájmu prostoru bez kompromisů",
    slug: "jak-usetrit-na-pronajmu-prostoru-bez-kompromisu",
    excerpt: "Praktické rady, jak získat kvalitní prostor za rozumnou cenu. Naučte se vyjednávat a najít skryté poklady mezi dostupnými prostory.",
    coverImage: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=400&fit=crop",
    author: { name: "Prostormat Team", email: "team@prostormat.cz" },
    publishedAt: new Date("2023-12-20"),
    tags: '["Rozpočet", "Úspory", "Tipy"]'
  },
  {
    id: "placeholder-6",
    title: "Udržitelné akce: Jak zorganizovat eco-friendly event",
    slug: "udrzitelne-akce-jak-zorganizovat-eco-friendly-event",
    excerpt: "Ochrana životního prostředí se týká i eventů. Zjistěte, jak zorganizovat akci s minimálním dopadem na přírodu a inspirovat účastníky k udržitelnému myšlení.",
    coverImage: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=400&fit=crop",
    author: { name: "Prostormat Team", email: "team@prostormat.cz" },
    publishedAt: new Date("2023-12-15"),
    tags: '["Udržitelnost", "Eco-friendly", "Trendy"]'
  }
]

async function BlogGrid() {
  const posts = await getBlogPosts()
  
  // Use placeholder posts if no real posts exist
  const displayPosts = posts.length > 0 ? posts : placeholderPosts
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {displayPosts.map((post) => (
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
          <h1 className="text-4xl font-bold text-black mb-4">Blog</h1>
          <p className="text-xl text-black max-w-3xl mx-auto">
            Odborné rady a trendy pro úspěšné eventy. Získejte inspiraci od expertů.
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