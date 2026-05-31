import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { getSettings, updateSettings } from "@/lib/store";

export async function GET() {
  const settings = await getSettings();
  // Never leak the password to clients.
  const { adminPassword: _ignored, ...safe } = settings;
  return NextResponse.json({ settings: safe });
}

export async function PATCH(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const updated = await updateSettings(body);
  const { adminPassword: _ignored, ...safe } = updated;
  return NextResponse.json({ settings: safe });
}
