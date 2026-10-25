
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";

const COOKIE_NAME = "flowpilot_token";

interface AuthTokenPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

// Checks whether the request has a valid login session.
export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = req.cookies?.[COOKIE_NAME] as
    | string
    | undefined;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);

    if (
      typeof decoded === "string" ||
      typeof decoded.userId !== "string" ||
      !decoded.userId
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
    }

    const payload = decoded as AuthTokenPayload;

    res.locals.userId = payload.userId;

    return next();
  } catch {
    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return res.status(401).json({
      success: false,
      message: "Session expired or invalid",
    });
  }
}

// Checks whether the authenticated user is a system administrator.
// Apply requireAuth before requireAdmin on protected routes.
export async function requireAdmin(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = res.locals.userId as string | undefined;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        systemRole: true,
      },
    });

    if (!user) {
      res.clearCookie(COOKIE_NAME, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });

      return res.status(401).json({
        success: false,
        message: "User account no longer exists",
      });
    }

    if (user.systemRole !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Administrator access required",
      });
    }

    return next();
  } catch (error) {
    console.error("Admin authorization failed:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to verify administrator permissions",
    });
  }
}
