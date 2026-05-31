import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { listKoi, makeId, upsertKoi } from "@/lib/store";
import type { KoiListing } from "@/lib/types";

export async function GET() {
  const items = await listKoi();
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json()) as Partial<KoiListing>;

  const now = new Date().toISOString();
  const koi: KoiListing = {
    id: body.id ?? makeId(),
    code: (body.code ?? "").trim() || `KH-${Date.now().toString(36)}`,
    name: (body.name ?? "Unnamed koi").trim(),
    variety: (body.variety ?? "Unknown").trim(),
    size: (body.size ?? "").trim(),
    age: body.age?.trim(),
    sex: body.sex,
    breeder: body.breeder?.trim(),
    price: Number(body.price ?? 0),
    currency: body.currency ?? "USD",
    status: body.status ?? "available",
    description: body.description ?? "",
    media: body.media ?? [],
    proofOfSale: body.proofOfSale ?? [],
    featured: Boolean(body.featured),
    createdAt: body.createdAt ?? now,
    updatedAt: now,
  };

  const saved = await upsertKoi(koi);
  return NextResponse.json({ koi: saved });
}
