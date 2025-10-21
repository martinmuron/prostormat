import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { ensureFallbackBlogPosts } from '@/lib/blog-admin'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

function formatDate(value: Date | string | null | undefined) {
  if (!value) return '—'
  const date = typeof value === 'string' ? new Date(value) : value
  return new Intl.DateTimeFormat('cs-CZ', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date)
}

export const dynamic = 'force-dynamic'

export default async function AdminBlogPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'admin') {
    redirect('/dashboard')
  }

  try {
    await ensureFallbackBlogPosts(session.user.id)
  } catch (error) {
    console.error('Failed to seed fallback blog posts:', error)
  }

  const posts = await db.blogPost.findMany({
    orderBy: {
      updatedAt: 'desc'
    },
    include: {
      author: {
        select: {
          name: true,
          email: true
        }
      }
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">Správa blogu</h1>
          <p className="text-gray-600 mt-2">
            Publikujte a upravujte blogové články pro Prostormat
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/blog/new">Nový článek</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Publikované články</CardTitle>
        </CardHeader>
        <CardContent>
          {posts.length === 0 ? (
            <div className="text-center text-gray-600 py-12">
              Zatím nemáte žádné články. Začněte kliknutím na tlačítko „Nový článek“.
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => {
                let tags: string[] = []
                try {
                  tags = post.tags ? (JSON.parse(post.tags) as string[]) : []
                } catch (error) {
                  console.warn('Failed to parse tags for post', post.id, error)
                }

                return (
                  <div
                    key={post.id}
                    className="border border-gray-200 rounded-xl p-4 sm:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h2 className="text-xl font-semibold text-black">{post.title}</h2>
                        <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                          {post.status === 'published' ? 'Zveřejněno' : 'Koncept'}
                        </Badge>
                        {post.publishedAt && (
                          <Badge variant="outline" className="text-xs">
                            Publikováno {formatDate(post.publishedAt)}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{post.excerpt || 'Bez perexu'}</p>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                        <span>Autor: {post.author?.name || post.author?.email || '—'}</span>
                        <span>· Aktualizováno: {formatDate(post.updatedAt)}</span>
                        <span>· Slug: <code className="text-xs bg-gray-100 px-2 py-1 rounded">{post.slug}</code></span>
                      </div>
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button asChild variant="secondary">
                        <Link href={`/blog/${post.slug}`} target="_blank">Zobrazit</Link>
                      </Button>
                      <Button asChild>
                        <Link href={`/admin/blog/${post.id}/edit`}>Upravit</Link>
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
