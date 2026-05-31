import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { getSettings, updateSettings } from "@/lib/store";

export async function GET() {
  const settings = await getSettings();
  return NextResponse.json({ settings });
}

export async function PATCH(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const updated = await updateSettings(body);
  return NextResponse.json({ settings: updated });
}
