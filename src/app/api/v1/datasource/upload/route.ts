import { NextResponse } from "next/server";

// Mock upload endpoint — accepts any file and returns success without persisting data.
export async function POST() {
  return NextResponse.json({ ok: true }, { status: 201 });
}
