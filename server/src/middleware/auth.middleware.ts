import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import { env } from "../config/env.js";

const COOKIE_NAME = "flowpilot_token";

interface AuthTokenPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

export function requireAuth(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = _req.cookies?.[COOKIE_NAME] as
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
