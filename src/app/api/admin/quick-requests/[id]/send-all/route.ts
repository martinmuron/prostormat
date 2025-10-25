import { POST as sendSingle } from "../send/route"

export async function POST(
  request: Request,
  context: unknown
) {
  return sendSingle(request, context as { params: Promise<{ id: string }> })
}
