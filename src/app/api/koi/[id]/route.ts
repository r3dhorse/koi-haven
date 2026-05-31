import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { deleteKoi, getKoi } from "@/lib/store";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const koi = await getKoi(id);
  if (!koi) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ koi });
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  await deleteKoi(id);
  return NextResponse.json({ ok: true });
}
