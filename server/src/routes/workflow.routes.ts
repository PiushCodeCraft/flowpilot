import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const workflowRouter = Router();

workflowRouter.use(requireAuth);

// GET /api/workflows
workflowRouter.get("/", async (_req, res) => {
  try {
    const userId = res.locals.userId as string;

    const memberships = await prisma.organizationMember.findMany({
      where: { userId },
      select: { organizationId: true },
    });

    const organizationIds = memberships.map(
      (membership) => membership.organizationId,
    );

    const workflows = organizationIds.length
      ? await prisma.workflowDefinition.findMany({
          where: { organizationId: { in: organizationIds } },
          orderBy: { updatedAt: "desc" },
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: { requests: true },
            },
          },
        })
      : [];

    return res.status(200).json({
      success: true,
      data: workflows,
    });
  } catch (error) {
    console.error("Workflow list error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load workflows.",
    });
  }
});

export default workflowRouter;
