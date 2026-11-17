import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getCurrentUser } from "@/services/auth.service";
import { handleApiError } from "@/lib/errors";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json(
        {
          status: "unauthenticated",
          user: null,
        },
        { status: 200 }
      );
    }

    const user = await getCurrentUser(session.userId);

    return NextResponse.json({
      status: "ok",
      user,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
