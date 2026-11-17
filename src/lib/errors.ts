import { NextResponse } from "next/server";

export interface ApiErrorResponse {
  error: string;
  details?: unknown;
}

export class AppError extends Error {
  public statusCode: number;
  public details?: unknown;

  constructor(message: string, statusCode: number = 400, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function jsonError(message: string, statusCode: number = 400, details?: unknown) {
  const payload: ApiErrorResponse = { error: message };
  if (details !== undefined) {
    payload.details = details;
  }
  return NextResponse.json(payload, { status: statusCode });
}

export function handleApiError(err: unknown) {
  console.error("[API Error]", err);

  if (err instanceof AppError) {
    return jsonError(err.message, err.statusCode, err.details);
  }

  if (err instanceof Error) {
    // Check for Mongoose ValidationError
    if (err.name === "ValidationError") {
      return jsonError("Validation Error", 400, err.message);
    }
    // Check for Mongoose duplicate key error (E11000)
    const maybeMongoErr = err as unknown as { code?: number };
    if (maybeMongoErr && maybeMongoErr.code === 11000) {
      return jsonError("A record with this identifier already exists", 409);
    }
    return jsonError(err.message, 500);
  }

  return jsonError("An unexpected server error occurred", 500);
}
