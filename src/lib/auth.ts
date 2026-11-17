import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, UserRole } from "@/lib/constants";
import { AppError } from "@/lib/errors";

const AUTH_SECRET = process.env.AUTH_SECRET || "anchordrop-default-dev-secret-key-32chars";

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
}

/**
 * Sign a JWT token for a session
 */
export function signSessionToken(payload: SessionPayload): string {
  return jwt.sign(payload, AUTH_SECRET, { expiresIn: "7d" });
}

/**
 * Verify and decode a JWT session token
 */
export function verifySessionToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, AUTH_SECRET) as SessionPayload;
  } catch {
    return null;
  }
}

/**
 * Set the session HTTP-only cookie on response headers / cookie store
 */
export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

/**
 * Remove the session cookie on logout
 */
export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}

/**
 * Extract the current session payload from cookies or request
 */
export async function getSessionUser(req?: NextRequest): Promise<SessionPayload | null> {
  let token: string | undefined;

  if (req) {
    token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
    // Fallback: check Authorization Bearer header
    if (!token) {
      const authHeader = req.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }
  } else {
    const cookieStore = await cookies();
    token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  }

  if (!token) {
    return null;
  }

  return verifySessionToken(token);
}

/**
 * Guard that guarantees user is authenticated, otherwise throws AppError(401)
 */
export async function requireAuth(req?: NextRequest): Promise<SessionPayload> {
  const session = await getSessionUser(req);
  if (!session) {
    throw new AppError("Authentication required. Please sign in.", 401);
  }
  return session;
}

/**
 * Guard that guarantees user has one of the allowed roles, otherwise throws AppError(403)
 */
export async function requireRole(
  allowedRoles: UserRole | UserRole[],
  req?: NextRequest
): Promise<SessionPayload> {
  const session = await requireAuth(req);
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  if (!roles.includes(session.role)) {
    throw new AppError(
      `Forbidden. This action requires one of the following roles: ${roles.join(", ")}`,
      403
    );
  }

  return session;
}
