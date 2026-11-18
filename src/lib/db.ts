import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/anchordrop";

if (process.env.NODE_ENV === "production" && !process.env.MONGODB_URI) {
  console.warn(
    "[Database Warning] MONGODB_URI is not set in production. Attempting localhost fallback. Configure MONGODB_URI (e.g. MongoDB Atlas) for persistent production storage."
  );
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  mongodInstance?: unknown;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

/**
 * Connect to MongoDB with singleton caching across Next.js API requests.
 * Automatically falls back to an embedded in-memory MongoDB instance in dev/test
 * if local mongod is not running.
 */
export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn && cached.conn.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 4000,
    };

    cached.promise = (async () => {
      try {
        const maskedUri = MONGODB_URI.replace(/:([^:@]+)@/, ":***@");
        console.log(`[Database] Connecting to ${maskedUri}...`);
        return await mongoose.connect(MONGODB_URI, opts);
      } catch (primaryErr) {
        // Fall back to in-memory MongoDB for local development if local connection fails
        if (process.env.NODE_ENV !== "production" && !MONGODB_URI.includes("mongodb+srv://")) {
          console.warn(
            "[Database] Local MongoDB unreachable on port 27017. Starting embedded in-memory MongoDB...",
            (primaryErr as Error).message
          );
          try {
            const { MongoMemoryServer } = await import("mongodb-memory-server");
            const mongod = await MongoMemoryServer.create({
              instance: { dbName: "anchordrop" },
            });
            cached.mongodInstance = mongod;
            const memoryUri = mongod.getUri();
            console.log(`[Database] Connected to in-memory MongoDB at ${memoryUri}`);
            const conn = await mongoose.connect(memoryUri, { bufferCommands: false });
            cached.conn = conn;
            try {
              const { seedDatabase } = await import("../../scripts/seed");
              await seedDatabase();
              console.log("[Database] In-memory database auto-seeded successfully with demo accounts & slips.");
            } catch (seedErr) {
              console.warn("[Database] Auto-seed skipped:", (seedErr as Error).message);
            }
            return conn;
          } catch (fallbackErr) {
            console.error("[Database] Failed to initialize in-memory fallback:", fallbackErr);
            throw primaryErr;
          }
        }
        throw primaryErr;
      }
    })();
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }

  return cached.conn;
}

export default connectDB;
