import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// Admin authentication check
function checkAdminAuth(request: NextRequest) {
  const adminPassword = request.headers.get("x-admin-password")
  return adminPassword === "112233"
}

// Generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!checkAdminAuth(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const post = await db.blogPost.findUnique({
      where: { id },
      include: {
        author: {
          select: { name: true, email: true }
        }
      }
    })

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error("Error fetching blog post:", error)
    return NextResponse.json({ error: "Failed to fetch blog post" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!checkAdminAuth(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { 
      title, 
      excerpt, 
      content, 
      coverImage, 
      status, 
      tags, 
      metaTitle, 
      metaDescription 
    } = body

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 })
    }

    // Check if post exists
    const existingPost = await db.blogPost.findUnique({ where: { id } })
    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    // Generate new slug if title changed
    let slug = existingPost.slug
    if (title !== existingPost.title) {
      slug = generateSlug(title)
      
      // Ensure slug is unique (excluding current post)
      const slugExists = await db.blogPost.findFirst({ 
        where: { 
          slug,
          id: { not: id }
        } 
      })
      if (slugExists) {
        slug = `${slug}-${Date.now()}`
      }
    }

    // Determine if we need to set publishedAt
    let publishedAt = existingPost.publishedAt
    if (status === "published" && existingPost.status === "draft") {
      publishedAt = new Date()
    } else if (status === "draft") {
      publishedAt = null
    }

    const post = await db.blogPost.update({
      where: { id },
      data: {
        title,
        slug,
        excerpt,
        content,
        coverImage,
        status: status || "draft",
        tags: tags || [],
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || excerpt,
        publishedAt
      },
      include: {
        author: {
          select: { name: true, email: true }
        }
      }
    })

    return NextResponse.json(post)
  } catch (error) {
    console.error("Error updating blog post:", error)
    return NextResponse.json({ error: "Failed to update blog post" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!checkAdminAuth(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const post = await db.blogPost.findUnique({ where: { id } })
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    await db.blogPost.delete({ where: { id } })

    return NextResponse.json({ message: "Post deleted successfully" })
  } catch (error) {
    console.error("Error deleting blog post:", error)
    return NextResponse.json({ error: "Failed to delete blog post" }, { status: 500 })
  }
} 