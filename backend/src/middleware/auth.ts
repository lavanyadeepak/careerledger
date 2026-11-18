import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { env } from "../config/env";
import { db } from "../config/db";

export interface AuthRequest extends Request {
  user?: { id: string; email: string; role: string };
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid Authorization header" });
    return;
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, env.jwtSecret) as JwtPayload & {
      id: string;
      email: string;
      role: string;
    };
    req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

export const optionalAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    next();
    return;
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, env.jwtSecret) as JwtPayload & {
      id: string;
      email: string;
      role: string;
    };
    req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
  } catch {
    // ignore invalid token for optional auth
  }
  next();
};

export const generateTokens = (userId: string, email: string, role: string) => {
  const accessToken = jwt.sign(
    { id: userId, email, role },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn as any }
  );
  const refreshToken = jwt.sign(
    { id: userId },
    env.jwtRefreshSecret,
    { expiresIn: env.jwtRefreshExpiresIn as any }
  );
  return { accessToken, refreshToken };
};

export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: "Insufficient permissions" });
      return;
    }
    next();
  };
};
