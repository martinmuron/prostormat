import VerifyEmailPage from "@/components/pages/auth/verify-email-page"

interface VerifyEmailPageProps {
  searchParams: {
    token?: string
  }
}

export default function VerifyEmail({ searchParams }: VerifyEmailPageProps) {
  return <VerifyEmailPage token={searchParams.token} />
}

