import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const workflowRouter = Router();

workflowRouter.use(requireAuth);

// GET /api/workflows
workflowRouter.get("/", async (req, res) => {
  try {
    const userId = res.locals.userId as string;

    const memberships = await prisma.organizationMember.findMany({
      where: { userId },
      select: { organizationId: true },
    });

    const organizationIds = memberships.map(
      (membership) => membership.organizationId,
    );

    const requestedOrgId =
      (req.query.organizationId as string | undefined) ||
      (req.headers["x-organization-id"] as string | undefined);

    if (requestedOrgId && !organizationIds.includes(requestedOrgId)) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this organization",
      });
    }

    const targetOrgIds = requestedOrgId ? [requestedOrgId] : organizationIds;

    const workflows = targetOrgIds.length
      ? await prisma.workflowDefinition.findMany({
          where: { organizationId: { in: targetOrgIds } },
          orderBy: { updatedAt: "desc" },
          select: {
            id: true,
            organizationId: true,
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



 // POST /api/workflows
workflowRouter.post("/", async (req, res) => {
  try {
    const userId = res.locals.userId as string;
    const { name, description, organizationId } = req.body as {
      name?: string;
      description?: string;
      organizationId?: string;
    };

    // Validate the workflow name.
    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Workflow name is required.",
      });
    }

    if (name.trim().length > 120) {
      return res.status(400).json({
        success: false,
        message: "Workflow name must be 120 characters or fewer.",
      });
    }

    if (
      description !== undefined &&
      (typeof description !== "string" || description.length > 2000)
    ) {
      return res.status(400).json({
        success: false,
        message: "Description must be text and no longer than 2000 characters.",
      });
    }

    // Find the organizations this user belongs to.
    const memberships = await prisma.organizationMember.findMany({
      where: { userId },
      select: { organizationId: true },
    });

    const organizationIds = memberships.map(
      (membership) => membership.organizationId,
    );

    if (organizationIds.length === 0) {
      return res.status(403).json({
        success: false,
        message: "You must belong to an organization to create workflows.",
      });
    }

    // Use a requested organization only if the user is a member.
    const requestedOrgId =
      organizationId ||
      (req.headers["x-organization-id"] as string | undefined);

    if (requestedOrgId && !organizationIds.includes(requestedOrgId)) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this organization.",
      });
    }

    const targetOrganizationId = requestedOrgId || organizationIds[0];

    const workflow = await prisma.workflowDefinition.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        organizationId: targetOrganizationId,
      },
      select: {
        id: true,
        organizationId: true,
        name: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { requests: true },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Workflow created successfully.",
      data: workflow,
    });
  } catch (error) {
    console.error("Workflow creation error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create workflow.",
    });
  }
});


export default workflowRouter;
