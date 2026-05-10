import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  const { documentId } = await params;
  const filePath = path.join(
    process.cwd(),
    "public",
    "mock",
    "chat",
    `${documentId}.json`
  );

  try {
    const fileContents = await fs.readFile(filePath, "utf-8");
    return NextResponse.json(JSON.parse(fileContents));
  } catch {
    return NextResponse.json([]);
  }
}
