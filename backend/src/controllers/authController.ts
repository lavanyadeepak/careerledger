import { Request, Response } from "express";
import { asyncHandler, AppError } from "../middleware/error";
import { generateTokens } from "../middleware/auth";
import { db } from "../config/db";
import bcrypt from "bcryptjs";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, name } = req.body as {
    email: string;
    password: string;
    name?: string;
  };

  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError("Email already registered", 409);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await db.user.create({
    data: { email, passwordHash, name },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });

  const { accessToken, refreshToken } = generateTokens(
    user.id,
    user.email,
    user.role
  );

  res.status(201).json({
    user,
    accessToken,
    refreshToken,
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };

  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new AppError("Invalid credentials", 401);
  }

  const { accessToken, refreshToken } = generateTokens(
    user.id,
    user.email,
    user.role
  );

  res.json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    accessToken,
    refreshToken,
  });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  if (!userId) {
    throw new AppError("Not authenticated", 401);
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });
  if (!user) {
    throw new AppError("User not found", 404);
  }

  res.json({ user });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  res.json({ message: "Logged out successfully" });
});