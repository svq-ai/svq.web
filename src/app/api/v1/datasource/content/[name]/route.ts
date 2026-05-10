import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  const filePath = path.join(process.cwd(), "public", "mock", "documents", name);

  try {
    const content = await fs.readFile(filePath);
    const ext = name.split(".").pop()?.toLowerCase();
    const contentType =
      ext === "pdf"
        ? "application/pdf"
        : "text/plain; charset=utf-8";

    return new NextResponse(content, {
      headers: { "Content-Type": contentType },
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "File not found" },
      { status: 404 }
    );
  }
}
