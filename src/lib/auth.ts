import { cookies } from "next/headers";
import {
  randomBytes,
  scrypt as _scrypt,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
import { readData, writeData } from "./store";

const COOKIE = "koi_admin";
const SCRYPT_KEYLEN = 64;

const scrypt = promisify(_scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number,
) => Promise<Buffer>;

function envPassword(): string {
  return process.env.ADMIN_PASSWORD || "changeme";
}

async function hashPassword(plain: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scrypt(plain, salt, SCRYPT_KEYLEN);
  return `${salt.toString("hex")}:${key.toString("hex")}`;
}

async function verifyHash(plain: string, stored: string): Promise<boolean> {
  const [saltHex, keyHex] = stored.split(":");
  if (!saltHex || !keyHex) return false;
  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(keyHex, "hex");
  try {
    const actual = await scrypt(plain, salt, expected.length);
    if (actual.length !== expected.length) return false;
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

/**
 * Validate a password against either the stored hash (if set) or the
 * ADMIN_PASSWORD env var (bootstrap, used before the admin first sets one).
 */
export async function checkPassword(input: string): Promise<boolean> {
  if (!input) return false;
  const data = await readData();
  const stored = data.auth?.passwordHash;
  if (stored) return verifyHash(input, stored);
  return input === envPassword();
}

export async function setAdminSession(): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const data = await readData();
  data.auth = {
    passwordHash: data.auth?.passwordHash ?? "",
    sessionToken: token,
  };
  await writeData(data);
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 8, // 8h
  });
}

export async function clearAdminSession(): Promise<void> {
  const data = await readData();
  if (data.auth) {
    data.auth = { ...data.auth, sessionToken: null };
    await writeData(data);
  }
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  const jar = await cookies();
  const cookieVal = jar.get(COOKIE)?.value;
  if (!cookieVal) return false;
  const data = await readData();
  const stored = data.auth?.sessionToken;
  if (!stored) return false;
  if (cookieVal.length !== stored.length) return false;
  return timingSafeEqual(Buffer.from(cookieVal), Buffer.from(stored));
}

/**
 * Update the stored password and rotate the active session so the caller
 * stays signed in but every other session is invalidated.
 */
export async function changeAdminPassword(
  current: string,
  next: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!next || next.length < 8) {
    return { ok: false, error: "New password must be at least 8 characters." };
  }
  if (!(await checkPassword(current))) {
    return { ok: false, error: "Current password is incorrect." };
  }
  const data = await readData();
  const passwordHash = await hashPassword(next);
  const sessionToken = randomBytes(32).toString("hex");
  data.auth = { passwordHash, sessionToken };
  await writeData(data);
  const jar = await cookies();
  jar.set(COOKIE, sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 8,
  });
  return { ok: true };
}
