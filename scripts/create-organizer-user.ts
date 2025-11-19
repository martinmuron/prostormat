import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const email = "events@prostormat.cz"
  const password = "Malepero2025!"
  const name = "Prostormat Organizátor"

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    console.log("User already exists:", existingUser.email)
    console.log("Role:", existingUser.role)
    console.log("Verified:", existingUser.emailVerified ? "Yes" : "No")

    // Update to organizer role if needed
    if (existingUser.role !== "organizer") {
      const updated = await prisma.user.update({
        where: { email },
        data: {
          role: "organizer",
          emailVerified: new Date(),
        },
      })
      console.log("Updated user role to organizer")
    }
    return
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12)

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      role: "organizer",
      emailVerified: new Date(), // Pre-verified
    },
  })

  console.log("Created organizer user:")
  console.log("  ID:", user.id)
  console.log("  Email:", user.email)
  console.log("  Name:", user.name)
  console.log("  Role:", user.role)
  console.log("  Verified:", user.emailVerified ? "Yes" : "No")
}

main()
  .catch((e) => {
    console.error("Error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
