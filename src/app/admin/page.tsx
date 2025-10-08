import { redirect } from "next/navigation"

export default function AdminPage() {
  // Redirect to the main dashboard which handles admin role
  redirect("/dashboard")
}
