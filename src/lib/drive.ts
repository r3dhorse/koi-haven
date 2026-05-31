import { Readable } from "node:stream";
import { google, type drive_v3 } from "googleapis";

export interface DriveUploadResult {
  driveId: string;
  url: string;
  kind: "image" | "video";
}

function getEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env: ${name}`);
  return v;
}

function hasDriveEnv(): boolean {
  return Boolean(
    process.env.GOOGLE_DRIVE_CLIENT_EMAIL &&
      process.env.GOOGLE_DRIVE_PRIVATE_KEY &&
      process.env.GOOGLE_DRIVE_FOLDER_ID,
  );
}

export function isDriveConfigured(): boolean {
  return hasDriveEnv();
}

function getDriveClient(): drive_v3.Drive {
  const clientEmail = getEnv("GOOGLE_DRIVE_CLIENT_EMAIL");
  // Private keys are usually stored with escaped newlines in .env
  const privateKey = getEnv("GOOGLE_DRIVE_PRIVATE_KEY").replace(/\\n/g, "\n");

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/drive"],
  });

  return google.drive({ version: "v3", auth });
}

/**
 * Returns a public-ish url that displays the Drive file.
 * For images we prefer the thumbnail/CDN url; for videos a direct preview link.
 */
export function driveFileUrl(fileId: string, kind: "image" | "video"): string {
  if (kind === "image") {
    return `https://lh3.googleusercontent.com/d/${fileId}=s2000`;
  }
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

export async function uploadToDrive(
  buffer: Buffer,
  filename: string,
  mimeType: string,
): Promise<DriveUploadResult> {
  const drive = getDriveClient();
  const folderId = getEnv("GOOGLE_DRIVE_FOLDER_ID");

  const kind: "image" | "video" = mimeType.startsWith("video/")
    ? "video"
    : "image";

  const res = await drive.files.create({
    requestBody: {
      name: filename,
      parents: [folderId],
    },
    media: {
      mimeType,
      body: Readable.from(buffer),
    },
    fields: "id",
  });

  const driveId = res.data.id;
  if (!driveId) throw new Error("Drive did not return a file id");

  // Make the file publicly readable so the storefront can show it.
  try {
    await drive.permissions.create({
      fileId: driveId,
      requestBody: { role: "reader", type: "anyone" },
    });
  } catch (err) {
    // Permission may already exist; non-fatal for re-uploads.
    console.warn("Drive permission set failed:", err);
  }

  return {
    driveId,
    url: driveFileUrl(driveId, kind),
    kind,
  };
}

export async function deleteFromDrive(fileId: string): Promise<void> {
  const drive = getDriveClient();
  await drive.files.delete({ fileId });
}
