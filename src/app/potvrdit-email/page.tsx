import VerifyEmailPage from "@/components/pages/auth/verify-email-page"

type SearchParams = {
  token?: string | string[]
}

export default async function VerifyEmail({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const tokenParam = params?.token
  const token = Array.isArray(tokenParam) ? tokenParam[0] : tokenParam

  return <VerifyEmailPage token={token} />
}

