"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Eye, EyeOff, Calendar, User } from "lucide-react"

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt?: string
  content: string
  coverImage?: string
  status: "draft" | "published"
  tags: string[]
  metaTitle?: string
  metaDescription?: string
  publishedAt?: string
  createdAt: string
  author: { name: string; email: string }
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "draft" | "published">("all")
  const [showForm, setShowForm] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    coverImage: "",
    status: "draft",
    tags: "",
    metaTitle: "",
    metaDescription: ""
  })

  // Check authentication
  useEffect(() => {
    const storedPassword = sessionStorage.getItem("adminPassword")
    if (storedPassword === "112233") {
      setIsAuthenticated(true)
      fetchPosts()
    }
  }, [])

  const handleAuth = () => {
    if (password === "112233") {
      sessionStorage.setItem("adminPassword", password)
      setIsAuthenticated(true)
      fetchPosts()
    }
  }

  const fetchPosts = async () => {
    try {
      const response = await fetch(`/api/admin/blog?status=${filter}`, {
        headers: { "x-admin-password": "112233" }
      })
      if (response.ok) {
        const data = await response.json()
        setPosts(data)
      }
    } catch (error) {
      console.error("Error fetching posts:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchPosts()
    }
  }, [filter, isAuthenticated])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const tagsArray = formData.tags.split(",").map(tag => tag.trim()).filter(Boolean)
      
      const payload = {
        ...formData,
        tags: tagsArray
      }

      const url = editingPost ? `/api/admin/blog/${editingPost.id}` : "/api/admin/blog"
      const method = editingPost ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": "112233"
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        setShowForm(false)
        setEditingPost(null)
        setFormData({
          title: "",
          excerpt: "",
          content: "",
          coverImage: "",
          status: "draft",
          tags: "",
          metaTitle: "",
          metaDescription: ""
        })
        fetchPosts()
      }
    } catch (error) {
      console.error("Error saving post:", error)
    }
  }

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post)
    setFormData({
      title: post.title,
      excerpt: post.excerpt || "",
      content: post.content,
      coverImage: post.coverImage || "",
      status: post.status,
      tags: post.tags.join(", "),
      metaTitle: post.metaTitle || "",
      metaDescription: post.metaDescription || ""
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Opravdu chcete smazat tento článek?")) return

    try {
      const response = await fetch(`/api/admin/blog/${id}`, {
        method: "DELETE",
        headers: { "x-admin-password": "112233" }
      })

      if (response.ok) {
        fetchPosts()
      }
    } catch (error) {
      console.error("Error deleting post:", error)
    }
  }

  const toggleStatus = async (post: BlogPost) => {
    try {
      const newStatus = post.status === "published" ? "draft" : "published"
      const response = await fetch(`/api/admin/blog/${post.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": "112233"
        },
        body: JSON.stringify({
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          coverImage: post.coverImage,
          status: newStatus,
          tags: post.tags,
          metaTitle: post.metaTitle,
          metaDescription: post.metaDescription
        })
      })

      if (response.ok) {
        fetchPosts()
      }
    } catch (error) {
      console.error("Error updating status:", error)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Admin - Blog Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                type="password"
                placeholder="Admin heslo"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAuth()}
              />
              <Button onClick={handleAuth} className="w-full">
                Přihlásit
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (showForm) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold">
              {editingPost ? "Upravit článek" : "Nový článek"}
            </h1>
            <Button variant="secondary" onClick={() => {
              setShowForm(false)
              setEditingPost(null)
            }}>
              Zrušit
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Nadpis *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                    placeholder="Nadpis článku"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Perex</label>
                  <Textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                    placeholder="Krátký popis článku"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Obsah *</label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    required
                    placeholder="Obsah článku"
                    rows={15}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Nastavení</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Status</label>
                      <Select
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                      >
                        <option value="draft">Koncept</option>
                        <option value="published">Publikováno</option>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Tagy</label>
                      <Input
                        value={formData.tags}
                        onChange={(e) => setFormData({...formData, tags: e.target.value})}
                        placeholder="event, prostor, tips (oddělené čárkou)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">URL obrázku</label>
                      <Input
                        value={formData.coverImage}
                        onChange={(e) => setFormData({...formData, coverImage: e.target.value})}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">SEO</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Meta Title</label>
                      <Input
                        value={formData.metaTitle}
                        onChange={(e) => setFormData({...formData, metaTitle: e.target.value})}
                        placeholder="SEO nadpis"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Meta Description</label>
                      <Textarea
                        value={formData.metaDescription}
                        onChange={(e) => setFormData({...formData, metaDescription: e.target.value})}
                        placeholder="SEO popis"
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Button type="submit" className="w-full">
                  {editingPost ? "Uložit změny" : "Publikovat článek"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Blog Management</h1>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nový článek
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <Select value={filter} onChange={(e) => setFilter(e.target.value as any)}>
            <option value="all">Všechny články</option>
            <option value="published">Publikované</option>
            <option value="draft">Koncepty</option>
          </Select>
        </div>

        {/* Posts List */}
        {loading ? (
          <div className="text-center py-8">Načítání...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Žádné články nenalezeny</p>
            <Button onClick={() => setShowForm(true)}>
              Vytvořit první článek
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <Card key={post.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{post.title}</h3>
                        <Badge variant={post.status === "published" ? "default" : "secondary"}>
                          {post.status === "published" ? "Publikováno" : "Koncept"}
                        </Badge>
                      </div>
                      
                      {post.excerpt && (
                        <p className="text-gray-600 mb-3">{post.excerpt}</p>
                      )}
                      
                      {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {post.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {post.author.name}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(post.publishedAt || post.createdAt).toLocaleDateString('cs-CZ')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => toggleStatus(post)}
                      >
                        {post.status === "published" ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleEdit(post)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDelete(post.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 