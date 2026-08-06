import { cookies } from "next/headers";
import { qOne, q, type Row } from "@/lib/db";
import { hashPassword, verifyPassword, newToken, sha256 } from "@/lib/password";
import type { AuthUser, AuthMembership } from "@/lib/auth-types";

export type { AuthUser, AuthMembership } from "@/lib/auth-types";

export const SESSION_COOKIE = "estateflow_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const RESET_TTL_MS = 60 * 60 * 1000;

interface UserRow extends Row {
  id: string;
  email: string | null;
  display_name: string | null;
  is_superadmin: boolean;
  password_hash?: string | null;
}

export class AuthError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function membershipsFor(userId: string): Promise<AuthMembership[]> {
  const memberships = await q<{ code: string; name: string; role: string }>(
    `SELECT t.code, t.name, m.role
       FROM public.tenant_memberships m
       JOIN public.tenants t ON t.id = m.tenant_id
      WHERE m.user_id = $1 AND m.status = 'active'
      ORDER BY m.joined_at`,
    [userId],
  );
  return memberships.map((m) => ({
    tenantCode: m.code,
    tenantName: m.name,
    role: m.role,
  }));
}

async function userFromSession(token: string): Promise<AuthUser | null> {
  const hash = sha256(token);
  const row = await qOne<{ expires_at: Date } & UserRow>(
    `SELECT u.id, u.email, u.display_name, u.is_superadmin, s.expires_at
       FROM public.sessions s
       JOIN public.users u ON u.id = s.user_id
      WHERE s.token_hash = $1`,
    [hash],
  );
  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) return null;

  return {
    id: row.id,
    email: row.email ?? "",
    displayName: row.display_name ?? "User",
    isSuperadmin: !!row.is_superadmin,
    memberships: await membershipsFor(row.id),
  };
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return userFromSession(token);
}

export async function requireSuperAdmin(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) throw new AuthError(401, "authentication required");
  if (!user.isSuperadmin) throw new AuthError(403, "superadmin access required");
  return user;
}

export async function createSession(userId: string): Promise<string> {
  const { raw, hash } = newToken();
  await q(
    `INSERT INTO public.sessions (user_id, token_hash, expires_at)
     VALUES ($1, $2, now() + ($3 || ' milliseconds')::interval)`,
    [userId, hash, String(SESSION_TTL_MS)],
  );
  return raw;
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return;
  await q(`DELETE FROM public.sessions WHERE token_hash = $1`, [sha256(token)]);
}

export async function loginWithPassword(email: string, password: string): Promise<AuthUser | null> {
  const row = await qOne<UserRow>(
    `SELECT id, email, display_name, is_superadmin, password_hash FROM public.users WHERE lower(email) = lower($1) AND status = 'active'`,
    [email],
  );
  if (!row || !row.password_hash) return null;
  if (!verifyPassword(password, row.password_hash)) return null;
  return {
    id: row.id,
    email: row.email ?? email,
    displayName: row.display_name ?? "User",
    isSuperadmin: !!row.is_superadmin,
    memberships: await membershipsFor(row.id),
  };
}

export async function createPasswordResetToken(email: string): Promise<{ user: UserRow; raw: string } | null> {
  const user = await qOne<UserRow>(`SELECT * FROM public.users WHERE lower(email) = lower($1)`, [email]);
  if (!user) return null;
  const { raw, hash } = newToken();
  await q(
    `INSERT INTO public.password_reset_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, now() + ($3 || ' milliseconds')::interval)`,
    [user.id, hash, String(RESET_TTL_MS)],
  );
  return { user, raw };
}

export async function resetPasswordWithToken(token: string, newPassword: string): Promise<boolean> {
  const hash = sha256(token);
  const row = await qOne<{ user_id: string; expires_at: Date; used_at: Date | null }>(
    `SELECT user_id, expires_at, used_at FROM public.password_reset_tokens WHERE token_hash = $1`,
    [hash],
  );
  if (!row || row.used_at) return false;
  if (new Date(row.expires_at).getTime() < Date.now()) return false;

  await q(`UPDATE public.users SET password_hash = $1 WHERE id = $2`, [hashPassword(newPassword), row.user_id]);
  await q(`UPDATE public.password_reset_tokens SET used_at = now() WHERE token_hash = $1`, [hash]);
  await q(`DELETE FROM public.sessions WHERE user_id = $1`, [row.user_id]);
  return true;
}

export async function setUserPassword(userId: string, password: string): Promise<void> {
  await q(`UPDATE public.users SET password_hash = $1 WHERE id = $2`, [hashPassword(password), userId]);
}
