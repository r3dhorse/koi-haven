import { cookies } from "next/headers";
import { getSettings } from "./store";

const COOKIE = "koi_admin";

export async function setAdminSession(): Promise<void> {
  const settings = await getSettings();
  const jar = await cookies();
  jar.set(COOKIE, settings.adminPassword ?? "ok", {
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
  const settings = await getSettings();
  const jar = await cookies();
  const val = jar.get(COOKIE)?.value;
  if (!val) return false;
  return val === (settings.adminPassword ?? "changeme");
}
