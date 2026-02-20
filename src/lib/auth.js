import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { ENV } from './security/env';
import { isRateLimited, clearRateLimit } from './security/rateLimit';
import { getSafeRedirectUrl } from './security/redirect';
import { isGoogleProviderEnabled } from './security/providerGate';
import { logSecurityEvent } from './security/audit';

// Validate secrets on load
ENV.validateAuthSecret();

export const authOptions = {
    // Determine providers
    providers: [
        ...(isGoogleProviderEnabled()
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
                    clearRateLimit(identifier); // Reset attempts on success
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
                const isCleverEmail = !!user?.email?.endsWith("@clever.com");
                if (!isCleverEmail) {
                    logSecurityEvent('rejected-provider-signin', {
                        provider: 'google',
                        email: user?.email,
                        reason: 'Non-matching email domain'
                    });
                }
                return isCleverEmail;
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
            return getSafeRedirectUrl(url, baseUrl);
        }
    },
    pages: {
        signIn: '/login', // Custom login page (to be built in Task 24)
    }
};
