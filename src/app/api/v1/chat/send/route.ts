import { NextRequest, NextResponse } from "next/server";

const CANNED_RESPONSES = [
  "Based on the document, the key requirement is that organisations must implement appropriate technical and organisational measures to ensure data protection by design and by default.",
  "According to the document, data controllers are responsible for ensuring compliance with data protection regulations and must maintain records of all processing activities.",
  "The document outlines specific requirements for data breach notification — organisations must report breaches to the relevant supervisory authority within 72 hours of becoming aware of the incident.",
  "The document emphasises that data subjects have the right to access, rectify, and request erasure of their personal data, as well as the right to data portability.",
  "Based on the content, organisations must conduct a Data Protection Impact Assessment (DPIA) for any processing that is likely to result in a high risk to individuals' rights and freedoms.",
  "The document highlights that consent must be freely given, specific, informed and unambiguous. Pre-ticked boxes or inactivity do not constitute valid consent.",
];

let responseIndex = 0;

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { message, documentId } = body as {
    message: string;
    documentId?: string;
  };

  const content = CANNED_RESPONSES[responseIndex % CANNED_RESPONSES.length];
  responseIndex += 1;

  const responseMessage = {
    id: `msg-${Date.now()}`,
    content,
    timestamp: new Date().toISOString(),
    role: "assistant",
    documentId: documentId ?? null,
  };

  return NextResponse.json({ ok: true, message: responseMessage });
}
