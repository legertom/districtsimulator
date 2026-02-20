import { withAuth } from "next-auth/middleware";

/**
 * NextAuth Proxy (formerly Middleware for Next.js 16+).
 * 
 * Protects all matching routes. If a user is not authenticated,
 * they are automatically redirected to /login.
 */
export const proxy = withAuth({
    pages: {
        signIn: '/login', // Redirect unauthenticated users here
    },
});

/**
 * Route Matcher Configuration.
 * 
 * Specifies which paths the proxy should run on.
 * 
 * EXCLUDED paths (matched by negative lookahead):
 * - /login (public login page)
 * - /api/auth/* (auth endpoints)
 * - /_next/* (Next.js internals/static assets)
 * - /favicon.ico, /images/* (static files)
 */
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - login
         * - api/auth
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico, sitemap.xml, robots.txt (public files)
         * - *.svg, *.png, *.jpg, *.jpeg, *.gif, *.webp (images)
         */
        '/((?!login|api/auth|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
