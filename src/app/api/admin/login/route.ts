import { NextResponse } from "next/server";
import { setAdminSession, clearAdminSession } from "@/lib/auth";
import { getSettings } from "@/lib/store";

export async function POST(req: Request) {
  const { password } = (await req.json()) as { password?: string };
  const settings = await getSettings();
  if (!password || password !== (settings.adminPassword ?? "changeme")) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }
  await setAdminSession();
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  await clearAdminSession();
  return NextResponse.json({ ok: true });
}
