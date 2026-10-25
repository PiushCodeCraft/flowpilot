
import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Prisma } from "../../generated/prisma/client.js";

import { prisma } from "../lib/prisma.js";
import { env } from "../config/env.js";
import {
  loginSchema,
  registerSchema,
} from "../schemas/auth.schema.js";

const COOKIE_NAME = "flowpilot_token";
const TOKEN_EXPIRY = "1d";

const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

function createToken(userId: string): string {
  return jwt.sign(
    { userId },
    env.JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY },
  );
}

function setAuthCookie(res: Response, token: string) {
  res.cookie(COOKIE_NAME, token, {
    ...cookieOptions,
    maxAge: 24 * 60 * 60 * 1000,
  });
}

export async function register(
  req: Request,
  res: Response,
) {
  const parsed = registerSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid registration details",
      errors: parsed.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  const { name, email, password, workspaceName } = parsed.data;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Create the user, workspace, and owner membership atomically.
    const { user, organization } = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          systemRole: "USER",
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      });

      const defaultWorkspaceName =
        workspaceName?.trim() || `${name.trim()}'s Workspace`;

      const baseSlug =
        defaultWorkspaceName
          .normalize("NFKD")
          .toLowerCase()
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
          .slice(0, 50) || "workspace";

      // User IDs make generated slugs unique across registrations.
      const createdOrg = await tx.organization.create({
        data: {
          name: defaultWorkspaceName,
          slug: `${baseSlug}-${createdUser.id}`,
        },
        select: {
          id: true,
          name: true,
          slug: true,
          createdAt: true,
        },
      });

      await tx.organizationMember.create({
        data: {
          userId: createdUser.id,
          organizationId: createdOrg.id,
          role: "OWNER",
        },
      });

      return {
        user: createdUser,
        organization: createdOrg,
      };
    });

    const token = createToken(user.id);
    setAuthCookie(res, token);

    return res.status(201).json({
      success: true,
      message: "Account and workspace created successfully",
      user: {
        ...user,
        organization,
      },
    });
  } catch (error) {
    // Handle duplicate email if simultaneous requests race.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    console.error("Registration failed:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create account",
    });
  }
}

export async function login(
  req: Request,
  res: Response,
) {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid login details",
      errors: parsed.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  const { email, password } = parsed.data;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        memberships: {
          select: {
            id: true,
            role: true,
            organization: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    if (
      !user ||
      !(await bcrypt.compare(password, user.passwordHash))
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = createToken(user.id);
    setAuthCookie(res, token);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        memberships: user.memberships,
      },
    });
  } catch (error) {
    console.error("Login failed:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to log in",
    });
  }
}

export function logout(_req: Request, res: Response) {
  res.clearCookie(COOKIE_NAME, cookieOptions);

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
}

export async function getCurrentUser(
  _req: Request,
  res: Response,
) {
  const userId = res.locals.userId as string;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        memberships: {
          select: {
            id: true,
            role: true,
            organization: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      res.clearCookie(COOKIE_NAME, cookieOptions);

      return res.status(401).json({
        success: false,
        message: "User account no longer exists",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Current-user lookup failed:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve current user",
    });
  }
}
