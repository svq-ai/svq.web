import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";

export async function POST(request: NextRequest) {
  return NextResponse.json({ ok: true }, { status: 201 });
}
