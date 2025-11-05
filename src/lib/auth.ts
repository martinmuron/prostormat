import { NextAuthOptions } from "next-auth"
import type { Adapter } from "next-auth/adapters"
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"

const nextAuthSecret = process.env.NEXTAUTH_SECRET
const isManagedEnvironment = process.env.VERCEL === "1"

if (!nextAuthSecret) {
  const message = "NEXTAUTH_SECRET is not set. Define it in your environment before starting the app."
  if (isManagedEnvironment) {
    throw new Error(message)
  }
  console.warn(`[auth] ${message}`)
}

export const authOptions: NextAuthOptions = {
  secret: nextAuthSecret ?? "development-nextauth-secret",
  adapter: PrismaAdapter(db) as Adapter,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/prihlaseni",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Heslo", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await db.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (!user) {
          return null
        }

        // For users created via OAuth, they might not have a password
        if (!user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        if (!user.emailVerified) {
          if (user.role === "admin") {
            // Allow admin login without database update - set in memory only
            user.emailVerified = new Date()
          } else {
            throw new Error("EMAIL_NOT_VERIFIED")
          }
        }

        if (user.role === "venue_manager") {
          const now = new Date()
          const hasActiveSubscription = await db.venue.findFirst({
            where: {
              managerId: user.id,
              paid: true,
              OR: [
                { expiresAt: null },
                { expiresAt: { gt: now } }
              ]
            },
            select: { id: true }
          })

          if (!hasActiveSubscription) {
            return null
          }
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          role: user.role,
        }
      }
      return token
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub,
          role: token.role,
        }
      }
    },
  },
}
