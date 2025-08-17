import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { EmailTemplatesManager } from "@/components/admin/email-templates-manager"

export default async function EmailTemplatesPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id || session.user.role !== "admin") {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-title-1 text-black mb-2">
            Email šablony
          </h1>
          <p className="text-body text-gray-600">
            Spravujte email šablony a odesílejte hromadné emaily uživatelům.
          </p>
        </div>
        
        <EmailTemplatesManager />
      </div>
    </div>
  )
}