import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

async function ensureUniqueSlug(baseSlug: string, excludeId?: string) {
  let slug = baseSlug
  let counter = 1

  while (true) {
    const existing = await db.blogPost.findUnique({ where: { slug } })
    if (!existing || existing.id === excludeId) {
      return slug
    }
    slug = `${baseSlug}-${counter}`
    counter += 1
  }
}

const createPost = async (formData: FormData) => {
  'use server'

  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'admin') {
    redirect('/dashboard')
  }

  const title = (formData.get('title') as string)?.trim()
  const slugInput = (formData.get('slug') as string | null)?.trim() || ''
  const excerpt = (formData.get('excerpt') as string | null)?.trim() || null
  const content = (formData.get('content') as string)?.trim()
  const coverImage = (formData.get('coverImage') as string | null)?.trim() || null
  const tagsInput = (formData.get('tags') as string | null)?.trim() || ''
  const status = (formData.get('status') as string) || 'draft'
  const metaTitle = (formData.get('metaTitle') as string | null)?.trim() || null
  const metaDescription = (formData.get('metaDescription') as string | null)?.trim() || null

  if (!title || !content) {
    throw new Error('Název i obsah jsou povinné')
  }

  const baseSlugCandidate = slugify(slugInput || title)
  const baseSlug = baseSlugCandidate || `clanek-${Date.now()}`
  const slug = await ensureUniqueSlug(baseSlug)

  const tagsArray = tagsInput
    ? tagsInput.split(',').map((tag) => tag.trim()).filter(Boolean)
    : []

  const publishedAt = status === 'published' ? new Date() : null

  await db.blogPost.create({
    data: {
      title,
      slug,
      excerpt,
      content,
      coverImage,
      status,
      authorId: session.user.id!,
      tags: JSON.stringify(tagsArray),
      metaTitle,
      metaDescription,
      publishedAt,
    },
  })

  revalidatePath('/blog')
  revalidatePath('/admin/blog')
  redirect('/admin/blog')
}

export const dynamic = 'force-dynamic'

export default async function NewBlogPostPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">Nový blogový článek</h1>
          <p className="text-gray-600 mt-2">Vytvořte nový obsah na blog Prostormat</p>
        </div>
        <Button variant="secondary" asChild>
          <Link href="/admin/blog">Zpět na přehled</Link>
        </Button>
      </div>

      <form action={createPost} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Základní informace</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Název *</label>
                <Input name="title" required placeholder="Název článku" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <Input name="slug" placeholder="automaticky vygenerováno z názvu" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Perex</label>
              <Textarea name="excerpt" rows={3} placeholder="Krátké shrnutí článku" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Obsah *</label>
              <Textarea name="content" required rows={12} placeholder="Hlavní obsah článku (HTML nebo Markdown)" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL obrázku</label>
                <Input name="coverImage" placeholder="https://..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tagy</label>
                <Input name="tags" placeholder="oddělte čárkami, např. firemni-akce, svatba" />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meta titulek</label>
                <Input name="metaTitle" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meta popis</label>
                <Input name="metaDescription" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stav *</label>
              <select
                name="status"
                defaultValue="draft"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="draft">Koncept</option>
                <option value="published">Zveřejněno</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="submit">Uložit článek</Button>
        </div>
      </form>
    </div>
  )
}
