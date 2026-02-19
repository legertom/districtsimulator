import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';


export const authOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || 'placeholder',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'placeholder',
        }),
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                // Placeholder logic until user persistence is wired up
                // Hardcoded admin for initial testing
                const user = {
                    id: "1",
                    name: "Principal Jones",
                    email: "principal@example.com",
                    role: "admin"
                };

                if (credentials?.email === user.email && credentials?.password === "password") {
                    return user;
                }

                // Return null if user data could not be retrieved
                return null;
            }
        })
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === "google") {
                return user?.email?.endsWith("@clever.com");
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
        }
    },
    pages: {
        signIn: '/login', // Custom login page (to be built in Task 24)
    }
};
