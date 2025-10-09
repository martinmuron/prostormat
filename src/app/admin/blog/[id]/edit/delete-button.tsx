'use client'

import { Button } from '@/components/ui/button'

interface DeleteBlogButtonProps {
  postId: string
  action: (formData: FormData) => Promise<void>
}

export function DeleteBlogButton({ postId, action }: DeleteBlogButtonProps) {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (!confirm('Opravdu chcete tento článek smazat?')) {
      event.preventDefault()
    }
  }

  return (
    <form action={action} onSubmit={handleSubmit} className="flex items-center justify-end">
      <input type="hidden" name="id" value={postId} />
      <Button type="submit" variant="destructive">
        Smazat článek
      </Button>
    </form>
  )
}
