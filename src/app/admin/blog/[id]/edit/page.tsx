'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  coverImage: string | null
  status: string
  tags: string
  metaTitle: string | null
  metaDescription: string | null
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  author: {
    name: string | null
    email: string
  }
}

export default function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const [blogPost, setBlogPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [id, setId] = useState<string>('')

  // Resolve params
  useEffect(() => {
    params.then(resolvedParams => {
      setId(resolvedParams.id)
    })
  }, [params])

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    coverImage: '',
    status: 'draft',
    tags: '',
    metaTitle: '',
    metaDescription: '',
  })

  useEffect(() => {
    if (id) {
      fetchBlogPost()
    }
  }, [id])

  const fetchBlogPost = async () => {
    try {
      const response = await fetch(`/api/admin/blog/${id}`)
      if (response.ok) {
        const data = await response.json()
        setBlogPost(data.post)
        setFormData({
          title: data.post.title,
          slug: data.post.slug,
          excerpt: data.post.excerpt || '',
          content: data.post.content,
          coverImage: data.post.coverImage || '',
          status: data.post.status,
          tags: data.post.tags,
          metaTitle: data.post.metaTitle || '',
          metaDescription: data.post.metaDescription || '',
        })
      } else {
        console.error('Failed to fetch blog post')
        router.push('/admin/blog')
      }
    } catch (error) {
      console.error('Error fetching blog post:', error)
      router.push('/admin/blog')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(`/api/admin/blog/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push('/admin/blog')
      } else {
        console.error('Failed to update blog post')
      }
    } catch (error) {
      console.error('Error updating blog post:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Načítání...</p>
        </div>
      </div>
    )
  }

  if (!blogPost) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Příspěvek nenalezen</h1>
          <Link href="/admin/blog">
            <Button>Zpět na blog</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <Link href="/admin/blog">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zpět na blog
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Upravit příspěvek</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Základní informace</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Název příspěvku</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Zadejte název příspěvku"
                  required
                />
              </div>

              <div>
                <Label htmlFor="slug">URL slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  placeholder="url-slug-prispevku"
                  required
                />
              </div>

              <div>
                <Label htmlFor="excerpt">Krátký popis</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => handleInputChange('excerpt', e.target.value)}
                  placeholder="Krátký popis příspěvku..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="content">Obsah</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="Obsah příspěvku..."
                  rows={15}
                  required
                />
              </div>

              <div>
                <Label htmlFor="coverImage">URL obrázku</Label>
                <Input
                  id="coverImage"
                  value={formData.coverImage}
                  onChange={(e) => handleInputChange('coverImage', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <Label htmlFor="tags">Tagy (oddělené čárkou)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => handleInputChange('tags', e.target.value)}
                  placeholder="tag1, tag2, tag3"
                />
              </div>

              <div>
                <Label htmlFor="status">Stav</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Koncept</SelectItem>
                    <SelectItem value="published">Publikováno</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SEO nastavení</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="metaTitle">Meta název</Label>
                <Input
                  id="metaTitle"
                  value={formData.metaTitle}
                  onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                  placeholder="SEO název pro vyhledávače"
                />
              </div>

              <div>
                <Label htmlFor="metaDescription">Meta popis</Label>
                <Textarea
                  id="metaDescription"
                  value={formData.metaDescription}
                  onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                  placeholder="SEO popis pro vyhledávače"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Link href="/admin/blog">
              <Button variant="outline">Zrušit</Button>
            </Link>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Ukládání...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Uložit změny
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}