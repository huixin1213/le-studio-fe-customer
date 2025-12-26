import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
	const token = req.cookies.get("token")
	const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

	const url = req.nextUrl.clone()

	// Redirect logged-in users away from login page
	if (token && url.pathname === "/login") {
		url.pathname = "/dashboard"
		return NextResponse.redirect(url)
	}

	// Redirect non-logged-in users away from protected pages
	const protectedPrefixes = [
		"/booking",
		"/dashboard",
		"/packages",
		"/settings",
		"/top-up",
		"/vouchers",
	]

	if (!token && protectedPrefixes.some(path => url.pathname.startsWith(path))) {
		url.pathname = "/login"
		return NextResponse.redirect(url)
	}

	return NextResponse.next()
}

export const config = {
	matcher: [
		'/booking/:path*',
		'/dashboard/:path*',
		'/packages/:path*',
		'/settings/:path*',
		'/top-up/:path*',
		'/vouchers/:path*',
		'/login',
	],
}
