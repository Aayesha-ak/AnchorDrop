import { connectDB } from "@/lib/db";
import { User, IUser } from "@/models/User";
import { hashPassword, verifyPassword } from "@/lib/password";
import { signSessionToken, SessionPayload } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import { RegisterInput, LoginInput } from "@/validations/auth.schema";

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
}

export function toSafeUser(user: IUser): SafeUser {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

/**
 * Register a new user with duplicate email protection, password hashing, and token generation
 */
export async function registerUser(
  data: RegisterInput
): Promise<{ user: SafeUser; token: string }> {
  await connectDB();

  const normalizedEmail = data.email.toLowerCase().trim();

  // Check duplicate email
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new AppError("An account with this email already exists", 409);
  }

  // Hash password
  const passwordHash = await hashPassword(data.password);

  // Create user
  const newUser = await User.create({
    name: data.name.trim(),
    email: normalizedEmail,
    passwordHash,
    role: data.role,
  });

  const sessionPayload: SessionPayload = {
    userId: newUser._id.toString(),
    email: newUser.email,
    name: newUser.name,
    role: newUser.role,
  };

  const token = signSessionToken(sessionPayload);

  return {
    user: toSafeUser(newUser),
    token,
  };
}

/**
 * Authenticate a user by email and password, returning safe user details and token
 */
export async function loginUser(
  data: LoginInput
): Promise<{ user: SafeUser; token: string }> {
  await connectDB();

  const normalizedEmail = data.email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const isPasswordValid = await verifyPassword(data.password, user.passwordHash);
  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  const sessionPayload: SessionPayload = {
    userId: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
  };

  const token = signSessionToken(sessionPayload);

  return {
    user: toSafeUser(user),
    token,
  };
}

/**
 * Fetch profile of the currently authenticated user by ID
 */
export async function getCurrentUser(userId: string): Promise<SafeUser> {
  await connectDB();

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  return toSafeUser(user);
}
