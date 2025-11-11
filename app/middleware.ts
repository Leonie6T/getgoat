import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Check role-based access
    if (pathname.startsWith('/dashboard') && token?.role !== 'SELLER') {
      return NextResponse.redirect(new URL('/browse', req.url))
    }

    if (pathname.startsWith('/orders') && token?.role !== 'BUYER') {
      return NextResponse.redirect(new URL('/browse', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname

        // Public routes that don't require auth
        const publicRoutes = [
          '/',
          '/browse',
          '/login',
          '/signup',
          '/forgot-password',
        ]

        // Check if route is public or starts with a public prefix
        const isPublicRoute =
          publicRoutes.includes(pathname) ||
          pathname.startsWith('/browse/') ||
          pathname.startsWith('/api/auth')

        if (isPublicRoute) {
          return true
        }

        // Protected routes require a token
        return !!token
      },
    },
    pages: {
      signIn: '/login',
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
}
