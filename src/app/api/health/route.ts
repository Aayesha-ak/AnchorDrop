import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { handleApiError } from "@/lib/errors";

export async function GET() {
  try {
    const mongoose = await connectDB();
    const isConnected = mongoose.connection.readyState === 1;

    return NextResponse.json({
      status: "ok",
      database: isConnected ? "connected" : "connecting",
      host: mongoose.connection.host,
      name: mongoose.connection.name,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
