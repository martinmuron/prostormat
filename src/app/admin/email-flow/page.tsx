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
    <div className="space-y-8">
      <div>
        <h1 className="text-title-1 text-black mb-2">
          Email statistiky
        </h1>
        <p className="text-body text-gray-600">
          Sledujte všechny programové emaily odeslané přes Resend a kontrolujte doručení, otevření i chyby.
        </p>
      </div>
      
      <EmailFlowDashboard />
    </div>
  )
}
