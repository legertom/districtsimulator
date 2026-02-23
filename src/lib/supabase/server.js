import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client.
 * Uses the secret key — bypasses RLS. Only use in API routes / server components.
 * Creates a new instance per request to avoid shared state between users.
 */
export function getSupabaseServerClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SECRET_KEY
    );
}
