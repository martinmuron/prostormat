import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NewEmailTemplatesManager } from "@/components/admin/new-email-templates-manager"

export default async function EmailTemplatesPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id || session.user.role !== "admin") {
    redirect("/dashboard")
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-title-1 text-black mb-2">
          Email nastavení
        </h1>
        <p className="text-body text-gray-600">
          Spravujte texty emailů a automatické spouštěče, které se posílají uživatelům i majitelům prostorů.
        </p>
      </div>

      <NewEmailTemplatesManager />
    </div>
  )
}
