import { NextRequest, NextResponse } from "next/server";
import { registerSchema } from "@/validations/auth.schema";
import { registerUser } from "@/services/auth.service";
import { setSessionCookie } from "@/lib/auth";
import { handleApiError, jsonError } from "@/lib/errors";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return jsonError("Request body must be valid JSON", 400);
    }

    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return jsonError("Validation failed", 400, validation.error.format());
    }

    const { user, token } = await registerUser(validation.data);
    await setSessionCookie(token);

    return NextResponse.json(
      {
        status: "ok",
        message: "Account created successfully",
        user,
        token,
      },
      { status: 201 }
    );
  } catch (err) {
    return handleApiError(err);
  }
}
