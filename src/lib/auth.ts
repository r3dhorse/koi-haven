import { cookies } from "next/headers";

const COOKIE = "koi_admin";

/**
 * The admin password. Set ADMIN_PASSWORD as a Vercel env var in production.
 * Defaults to "changeme" for local development.
 */
function adminPassword(): string {
  return process.env.ADMIN_PASSWORD || "changeme";
}

export async function setAdminSession(): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE, adminPassword(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 8, // 8h
  });
}

export async function clearAdminSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  const jar = await cookies();
  const val = jar.get(COOKIE)?.value;
  if (!val) return false;
  return val === adminPassword();
}

export function checkPassword(input: string): boolean {
  return input === adminPassword();
}
