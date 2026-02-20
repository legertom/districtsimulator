import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';

// Simple in-memory rate limiter for credential brute-force protection
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000;
const MAX_ATTEMPTS = parseInt(process.env.AUTH_MAX_ATTEMPTS, 10) || 5;
const loginAttempts = new Map();

function isRateLimited(identifier) {
    if (process.env.NODE_ENV === 'test') return false; // Disable limiter in test environment

    const now = Date.now();
    const attempts = loginAttempts.get(identifier) || [];
    const recentAttempts = attempts.filter(time => now - time < RATE_LIMIT_WINDOW_MS);

    if (recentAttempts.length >= MAX_ATTEMPTS) {
        return true;
    }

    recentAttempts.push(now);
    loginAttempts.set(identifier, recentAttempts);
    return false;
}

export const authOptions = {
    // Determine providers
    providers: [
        ...(process.env.GOOGLE_CLIENT_ID &&
            process.env.GOOGLE_CLIENT_SECRET &&
            process.env.GOOGLE_CLIENT_ID !== "YOUR_GOOGLE_CLIENT_ID" &&
            process.env.GOOGLE_CLIENT_SECRET !== "YOUR_GOOGLE_CLIENT_SECRET" &&
            process.env.GOOGLE_CLIENT_ID !== "placeholder_id" &&
            process.env.GOOGLE_CLIENT_SECRET !== "placeholder_secret"
            ? [
                GoogleProvider({
                    clientId: process.env.GOOGLE_CLIENT_ID,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                }),
            ]
            : []),
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {
                const emailInput = credentials?.email?.trim().toLowerCase();
                const ip = req?.headers?.['x-forwarded-for'] || req?.connection?.remoteAddress || 'unknown-ip';
                const identifier = `${emailInput}-${ip}`;

                if (isRateLimited(identifier)) {
                    throw new Error("Too many login attempts. Please try again later.");
                }

                // Placeholder logic until user persistence is wired up
                // Hardcoded admin for initial testing
                const user = {
                    id: "1",
                    name: "Clever Admin",
                    email: "admin@clever.com",
                    role: "admin"
                };

                if (emailInput === user.email && credentials?.password === "password") {
                    loginAttempts.delete(identifier); // Reset attempts on success
                    return user;
                }

                // Return null if user data could not be retrieved
                return null;
            }
        })
    ],
    secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === "google") {
                return !!user?.email?.endsWith("@clever.com");
            }
            return true; // Allow Credentials provider (dev)
        },
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session?.user) {
                session.user.role = token.role;
            }
            return session;
        },
        async redirect({ url, baseUrl }) {
            // Defensively try/catch new URL parsing
            try {
                // Allows relative callback URLs
                if (url.startsWith("/")) {
                    return new URL(url, baseUrl).toString()
                }
                // Allows callback URLs on the same origin
                else if (new URL(url).origin === baseUrl) {
                    return url
                }
            } catch (error) {
                // Ignore parse errors and fallback immediately
            }
            // Fallback to baseUrl
            return baseUrl
        }
    },
    pages: {
        signIn: '/login', // Custom login page (to be built in Task 24)
    }
};
