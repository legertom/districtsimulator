import { createClient } from "@supabase/supabase-js";

/**
 * Browser-side Supabase client (singleton).
 * Uses the publishable key — safe for client-side use with RLS.
 */
let _client = null;

export function getSupabaseBrowserClient() {
    if (_client) return _client;

    _client = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    );

    return _client;
}
