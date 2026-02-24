import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";

/**
 * GET /api/progress/session
 * Returns the authenticated user's active session state.
 */
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !session?.user?.id) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase
        .from("session_state")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

    if (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
        return Response.json({
            active_scenario_id: null,
            current_step_id: null,
            welcome_seen: false,
            metadata: {},
        });
    }

    return Response.json(data);
}

/**
 * PUT /api/progress/session
 * Upserts the authenticated user's session state.
 * Body: { active_scenario_id, current_step_id, welcome_seen, metadata }
 */
export async function PUT(request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !session?.user?.id) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    if (typeof body !== "object" || body === null || Array.isArray(body)) {
        return Response.json({ error: "Invalid payload" }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();

    const row = {
        user_id: session.user.id,
        active_scenario_id: body.active_scenario_id ?? null,
        current_step_id: body.current_step_id ?? null,
        welcome_seen: body.welcome_seen ?? false,
        metadata: body.metadata ?? {},
    };

    const { data, error } = await supabase
        .from("session_state")
        .upsert(row, { onConflict: "user_id" })
        .select()
        .single();

    if (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json(data);
}
