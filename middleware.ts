import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

  if (!token && req.nextUrl.pathname.startsWith("/dashboard")) {
    const loginUrl = new URL(`${basePath}/login`, req.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}
