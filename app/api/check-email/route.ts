import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("spins")
      .select("result, created_at")
      .eq("email", email.toLowerCase().trim())
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows found
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    if (data) {
      return NextResponse.json({ exists: true, result: data.result });
    }

    return NextResponse.json({ exists: false });
  } catch (err) {
    console.error("Check email error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
