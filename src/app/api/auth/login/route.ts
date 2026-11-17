import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/validations/auth.schema";
import { loginUser } from "@/services/auth.service";
import { setSessionCookie } from "@/lib/auth";
import { handleApiError, jsonError } from "@/lib/errors";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return jsonError("Request body must be valid JSON", 400);
    }

    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return jsonError("Validation failed", 400, validation.error.format());
    }

    const { user, token } = await loginUser(validation.data);
    await setSessionCookie(token);

    return NextResponse.json({
      status: "ok",
      message: "Sign in successful",
      user,
      token,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
