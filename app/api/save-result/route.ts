import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { pickResult } from "@/lib/segments";
import { appendRow } from "@/lib/sheets";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const supabase = getSupabase();
    const normalizedEmail = email.toLowerCase().trim();

    // Double-check email hasn't spun already
    const { data: existing } = await supabase
      .from("spins")
      .select("result")
      .eq("email", normalizedEmail)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Email already used", result: existing.result },
        { status: 409 }
      );
    }

    // Pick result server-side
    const { label, segmentIndex } = pickResult();

    // Save to database
    const { error } = await supabase.from("spins").insert({
      email: normalizedEmail,
      result: label,
    });

    if (error) {
      console.error("Supabase insert error:", error);
      // If unique constraint violation, email already exists
      if (error.code === "23505") {
        const { data: existingData } = await supabase
          .from("spins")
          .select("result")
          .eq("email", normalizedEmail)
          .single();
        return NextResponse.json(
          { error: "Email already used", result: existingData?.result },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: "Failed to save result" }, { status: 500 });
    }

    // also append to Google Sheet (fire-and-forget)
    try {
      await appendRow([new Date().toISOString(), normalizedEmail, label]);
    } catch (sheetErr) {
      console.error("Failed to append row to Google Sheets:", sheetErr);
    }

    return NextResponse.json({ result: label, segmentIndex });
  } catch (err) {
    console.error("Save result error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
