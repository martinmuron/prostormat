import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { EmailFlowDashboard } from "@/components/admin/email-flow-dashboard"

export default async function EmailFlowPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id || session.user.role !== "admin") {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-title-1 text-black mb-2">
            Email Flow
          </h1>
          <p className="text-body text-gray-600">
            Sledujte všechny programové emaily odeslané přes Resend. Nikdy nezapomeňte na žádný email flow v systému.
          </p>
        </div>
        
        <EmailFlowDashboard />
      </div>
    </div>
  )
}