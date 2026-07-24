import { NextResponse } from "next/server";

/** Konteyner healthcheck'i buraya bakar. */
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ status: "ok", timestamp: new Date().toISOString() });
}
