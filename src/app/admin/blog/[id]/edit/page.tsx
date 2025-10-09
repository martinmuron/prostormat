import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { DeleteBlogButton } from './delete-button'

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

const updatePost = async (formData: FormData) => {
  'use server'

  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'admin') {
    redirect('/dashboard')
  }

  const id = (formData.get('id') as string)?.trim()
  const title = (formData.get('title') as string)?.trim()
  const slugInput = (formData.get('slug') as string | null)?.trim() || ''
  const excerpt = (formData.get('excerpt') as string | null)?.trim() || null
  const content = (formData.get('content') as string)?.trim()
  const coverImage = (formData.get('coverImage') as string | null)?.trim() || null
  const tagsInput = (formData.get('tags') as string | null)?.trim() || ''
  const status = (formData.get('status') as string) || 'draft'
  const metaTitle = (formData.get('metaTitle') as string | null)?.trim() || null
  const metaDescription = (formData.get('metaDescription') as string | null)?.trim() || null

  if (!id || !title || !content) {
    throw new Error('Chybí povinná pole')
  }

  const existing = await db.blogPost.findUnique({ where: { id } })
  if (!existing) {
    notFound()
  }

  const baseSlugCandidate = slugify(slugInput || title)
  const baseSlug = baseSlugCandidate || existing.slug || `clanek-${Date.now()}`
  const slug = await ensureUniqueSlug(baseSlug, id)

  const tagsArray = tagsInput
    ? tagsInput.split(',').map((tag) => tag.trim()).filter(Boolean)
    : []

  const publishedAt = status === 'published'
    ? existing.publishedAt ?? new Date()
    : null

  await db.blogPost.update({
    where: { id },
    data: {
      title,
      slug,
      excerpt,
      content,
      coverImage,
      status,
      tags: JSON.stringify(tagsArray),
      metaTitle,
      metaDescription,
      publishedAt,
    },
  })

  revalidatePath('/blog')
  revalidatePath('/admin/blog')
  revalidatePath(`/blog/${slug}`)
  redirect('/admin/blog')
}

const deletePost = async (formData: FormData) => {
  'use server'

  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'admin') {
    redirect('/dashboard')
  }

  const id = (formData.get('id') as string)?.trim()
  if (!id) {
    throw new Error('Neplatné ID článku')
  }

  const existing = await db.blogPost.findUnique({ where: { id } })
  if (!existing) {
    notFound()
  }

  await db.blogPost.delete({ where: { id } })

  revalidatePath('/blog')
  revalidatePath('/admin/blog')
  redirect('/admin/blog')
}

export const dynamic = 'force-dynamic'

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'admin') {
    redirect('/dashboard')
  }

  const post = await db.blogPost.findUnique({ where: { id } })
  if (!post) {
    notFound()
  }

  let tagsString = ''
  try {
    tagsString = post.tags ? (JSON.parse(post.tags) as string[]).join(', ') : ''
  } catch (error) {
    console.warn('Failed to parse tags for post', post.id, error)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">Upravit článek</h1>
          <p className="text-gray-600 mt-2">Aktualizujte obsah blogu „{post.title}“</p>
        </div>
        <Button variant="secondary" asChild>
          <Link href="/admin/blog">Zpět na přehled</Link>
        </Button>
      </div>

      <form action={updatePost} className="space-y-6">
        <input type="hidden" name="id" value={post.id} />
        <Card>
          <CardHeader>
            <CardTitle>Základní informace</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Název *</label>
                <Input name="title" defaultValue={post.title} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <Input name="slug" defaultValue={post.slug} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Perex</label>
              <Textarea name="excerpt" rows={3} defaultValue={post.excerpt || ''} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Obsah *</label>
              <Textarea name="content" required rows={12} defaultValue={post.content} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL obrázku</label>
                <Input name="coverImage" defaultValue={post.coverImage || ''} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tagy</label>
                <Input name="tags" defaultValue={tagsString} placeholder="oddělte čárkami" />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meta titulek</label>
                <Input name="metaTitle" defaultValue={post.metaTitle || ''} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meta popis</label>
                <Input name="metaDescription" defaultValue={post.metaDescription || ''} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stav *</label>
              <select
                name="status"
                defaultValue={post.status}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="draft">Koncept</option>
                <option value="published">Zveřejněno</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit">Uložit změny</Button>
        </div>
      </form>
      <div className="pt-4">
        <DeleteBlogButton postId={post.id} action={deletePost} />
      </div>
    </div>
  )
}
