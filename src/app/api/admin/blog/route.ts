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

// GET - List all blog posts (for admin)
export async function GET(request: NextRequest) {
  try {
    if (!checkAdminAuth(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") // draft, published, all

    const where: any = {}
    if (status && status !== "all") {
      where.status = status
    }

    const posts = await db.blogPost.findMany({
      where,
      include: {
        author: {
          select: { name: true, email: true }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json(posts)
  } catch (error) {
    console.error("Error fetching blog posts:", error)
    return NextResponse.json({ error: "Failed to fetch blog posts" }, { status: 500 })
  }
}

// POST - Create new blog post
export async function POST(request: NextRequest) {
  try {
    if (!checkAdminAuth(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

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

    // Generate slug from title
    let slug = generateSlug(title)
    
    // Ensure slug is unique
    const existingPost = await db.blogPost.findUnique({ where: { slug } })
    if (existingPost) {
      slug = `${slug}-${Date.now()}`
    }

    // For now, use a default author - in production you'd get this from session
    // We'll create a default admin user if needed
    let adminUser = await db.user.findFirst({ where: { role: "admin" } })
    if (!adminUser) {
      // Create default admin user
      adminUser = await db.user.create({
        data: {
          name: "Admin",
          email: "admin@prostormat.cz",
          role: "admin"
        }
      })
    }

    const post = await db.blogPost.create({
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
        authorId: adminUser.id,
        publishedAt: status === "published" ? new Date() : null
      },
      include: {
        author: {
          select: { name: true, email: true }
        }
      }
    })

    return NextResponse.json(post)
  } catch (error) {
    console.error("Error creating blog post:", error)
    return NextResponse.json({ error: "Failed to create blog post" }, { status: 500 })
  }
} 