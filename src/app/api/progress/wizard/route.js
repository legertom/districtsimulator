import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";

/**
 * GET /api/progress/wizard
 * Returns the authenticated user's IDM provisioning wizard state.
 */
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !session?.user?.id) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase
        .from("wizard_state")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

    if (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }

    // Return empty object if no wizard state exists yet
    if (!data) {
        return Response.json({ wizard_data: {} });
    }

    return Response.json(data);
}

/**
 * PUT /api/progress/wizard
 * Upserts the authenticated user's wizard state.
 * Body: { wizard_data: { ...full wizard JSON blob } }
 */
export async function PUT(request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !session?.user?.id) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const supabase = getSupabaseServerClient();

    const row = {
        user_id: session.user.id,
        wizard_data: body.wizard_data ?? {},
    };

    const { data, error } = await supabase
        .from("wizard_state")
        .upsert(row, { onConflict: "user_id" })
        .select()
        .single();

    if (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json(data);
}
