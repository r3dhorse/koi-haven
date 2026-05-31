import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { isDriveConfigured, uploadToDrive } from "@/lib/drive";

export const runtime = "nodejs";
// Allow generous file sizes for koi videos.
export const maxDuration = 60;

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isDriveConfigured()) {
    return NextResponse.json(
      {
        error:
          "Google Drive is not configured. Set GOOGLE_DRIVE_CLIENT_EMAIL, GOOGLE_DRIVE_PRIVATE_KEY, and GOOGLE_DRIVE_FOLDER_ID.",
      },
      { status: 503 },
    );
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await uploadToDrive(buffer, file.name, file.type || "application/octet-stream");
  return NextResponse.json({ media: result });
}
