import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";

/**
 * GET /api/progress
 * Returns the authenticated user's training progress.
 */
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !session?.user?.id) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

    if (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }

    // Return defaults if no row exists yet
    if (!data) {
        return Response.json({
            completed_scenarios: [],
            completed_modules: [],
            scores: {},
            coach_marks_enabled: true,
            idm_setup_complete: false,
            state_version: 3,
        });
    }

    return Response.json(data);
}

/**
 * PUT /api/progress
 * Upserts the authenticated user's training progress.
 * Body: { completed_scenarios, completed_modules, scores, coach_marks_enabled, idm_setup_complete }
 */
export async function PUT(request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !session?.user?.id) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Basic input validation
    if (typeof body !== "object" || body === null || Array.isArray(body)) {
        return Response.json({ error: "Invalid payload" }, { status: 400 });
    }
    if (body.completed_scenarios && !Array.isArray(body.completed_scenarios)) {
        return Response.json({ error: "completed_scenarios must be an array" }, { status: 400 });
    }
    if (body.completed_modules && !Array.isArray(body.completed_modules)) {
        return Response.json({ error: "completed_modules must be an array" }, { status: 400 });
    }
    if (body.scores && typeof body.scores !== "object") {
        return Response.json({ error: "scores must be an object" }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();

    const row = {
        user_id: session.user.id,
        completed_scenarios: body.completed_scenarios ?? [],
        completed_modules: body.completed_modules ?? [],
        scores: body.scores ?? {},
        coach_marks_enabled: body.coach_marks_enabled ?? true,
        idm_setup_complete: body.idm_setup_complete ?? false,
        state_version: body.state_version ?? 3,
    };

    const { data, error } = await supabase
        .from("user_progress")
        .upsert(row, { onConflict: "user_id" })
        .select()
        .single();

    if (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json(data);
}
