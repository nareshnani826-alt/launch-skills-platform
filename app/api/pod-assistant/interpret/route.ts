import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";
import { interpretClientNeed } from "@/lib/pod-interpret";

// POST /api/pod-assistant/interpret  { clientNeed: string }
// Suggests catalog certifications for a free-text client need.
export async function POST(req: NextRequest) {
  if (!isAdmin(getSession())) {
    return NextResponse.json({ error: "Admin login required" }, { status: 401 });
  }

  const body = await req.json();
  const clientNeed = String(body.clientNeed ?? "");
  const catalog = await prisma.certification.findMany({ select: { name: true } });
  return NextResponse.json({ suggestions: interpretClientNeed(clientNeed, catalog.map((c) => c.name)) });
}
