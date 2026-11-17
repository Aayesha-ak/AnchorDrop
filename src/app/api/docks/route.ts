import { NextRequest, NextResponse } from "next/server";
import { dockQuerySchema, createDockSchema } from "@/validations/dock.schema";
import { listDocks, createDock, getOwnerBerths } from "@/services/dock.service";
import { getSessionUser, requireRole } from "@/lib/auth";
import { USER_ROLES } from "@/lib/constants";
import { handleApiError, jsonError } from "@/lib/errors";

/**
 * GET /api/docks
 * Public search and multi-parameter filtering for Explore Docks marketplace.
 * Also supports ?mine=true for authenticated dock owners to inspect their full berth inventory.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    const searchParams = req.nextUrl.searchParams;

    const isMine = searchParams.get("mine") === "true";
    if (isMine) {
      if (!session || session.role !== USER_ROLES.DOCK_OWNER) {
        return jsonError("Authentication required as dock owner to access your berths", 401);
      }
      const berths = await getOwnerBerths(session.userId);
      return NextResponse.json({
        status: "ok",
        count: berths.length,
        docks: berths,
      });
    }

    // Parse filter query parameters
    const queryParams: Record<string, unknown> = {};
    const search = searchParams.get("search");
    const location = searchParams.get("location");
    const waterway = searchParams.get("waterway");
    const dockType = searchParams.get("dockType");
    const maxLength = searchParams.get("maxLength");
    const minDepth = searchParams.get("minDepth");
    const maxPrice = searchParams.get("maxPrice");
    const ownerId = searchParams.get("ownerId");

    if (search) queryParams.search = search;
    if (location) queryParams.location = location;
    if (waterway) queryParams.waterway = waterway;
    if (dockType) queryParams.dockType = dockType;
    if (maxLength) queryParams.maxLength = maxLength;
    if (minDepth) queryParams.minDepth = minDepth;
    if (maxPrice) queryParams.maxPrice = maxPrice;

    const validation = dockQuerySchema.safeParse(queryParams);
    if (!validation.success) {
      return jsonError("Invalid query parameters", 400, validation.error.format());
    }

    const filters = {
      ...validation.data,
      ownerId: ownerId || undefined,
    };

    const docks = await listDocks(filters, session?.userId);

    return NextResponse.json({
      status: "ok",
      count: docks.length,
      docks,
    });
  } catch (err) {
    return handleApiError(err);
  }
}

/**
 * POST /api/docks
 * Owner endpoint to publish a new dock berth listing.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await requireRole(USER_ROLES.DOCK_OWNER, req);

    const body = await req.json().catch(() => null);
    if (!body) {
      return jsonError("Request body must be valid JSON", 400);
    }

    const validation = createDockSchema.safeParse(body);
    if (!validation.success) {
      return jsonError("Validation failed", 400, validation.error.format());
    }

    const newDock = await createDock(validation.data, session.userId);

    return NextResponse.json(
      {
        status: "ok",
        message: "Dock berth published successfully",
        dock: newDock,
      },
      { status: 201 }
    );
  } catch (err) {
    return handleApiError(err);
  }
}
