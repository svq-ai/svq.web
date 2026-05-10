import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";

export async function GET(request: NextRequest) {
  const filePath = path.join(process.cwd(), "public", "mock", "documents.json");
  try {
    const fileContents = await fs.readFile(filePath, "utf-8");
    const data = JSON.parse(fileContents);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { ok: false, documents: [], error: "Failed to load documents" },
      { status: 500 }
    );
  }
}
