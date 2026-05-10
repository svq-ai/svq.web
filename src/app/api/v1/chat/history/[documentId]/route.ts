import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  const { documentId } = await params;
  const chatDir = path.join(process.cwd(), "public", "mock", "chat");
  const filePath = path.join(chatDir, `${documentId}.json`);

  // Guard against path traversal
  if (!filePath.startsWith(chatDir + path.sep)) {
    return NextResponse.json([], { status: 400 });
  }

  try {
    const fileContents = await fs.readFile(filePath, "utf-8");
    return NextResponse.json(JSON.parse(fileContents));
  } catch {
    return NextResponse.json([]);
  }
}
