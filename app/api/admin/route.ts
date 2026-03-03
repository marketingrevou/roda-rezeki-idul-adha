import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const expectedSecret = `Bearer ${process.env.ADMIN_SECRET}`;

  if (!authHeader || authHeader !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("spins")
    .select("id, email, result, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Admin fetch error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  return NextResponse.json({ spins: data });
}
