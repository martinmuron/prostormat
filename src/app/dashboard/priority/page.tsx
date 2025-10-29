import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { PriorityInterestForm } from "@/components/dashboard/priority-interest-form"

export const dynamic = "force-dynamic"

export default async function PriorityInterestPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/prihlaseni?callbackUrl=/dashboard/priority")
  }

  if (session.user.role !== "venue_manager" && session.user.role !== "admin") {
    redirect("/dashboard")
  }

  const [userProfile, venues] = await Promise.all([
    db.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        email: true,
        phone: true,
        company: true,
      },
    }),
    db.venue.findMany({
      where: session.user.role === "admin" ? {} : { managerId: session.user.id },
      select: {
        id: true,
        name: true,
        status: true,
        slug: true,
        priority: true,
        prioritySource: true,
        paid: true,
      },
      orderBy: { updatedAt: "desc" },
    }),
  ])

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <PriorityInterestForm
          venues={venues}
          defaultContact={{
            name: userProfile?.name ?? session.user.email ?? "",
            email: userProfile?.email ?? session.user.email ?? "",
            phone: userProfile?.phone ?? "",
            company: userProfile?.company ?? "",
          }}
        />
      </div>
    </div>
  )
}
