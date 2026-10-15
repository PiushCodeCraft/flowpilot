import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const dashboardRouter = Router();

dashboardRouter.use(requireAuth);

// GET /api/dashboard/summary
dashboardRouter.get("/summary", async (_req, res) => {
  try {
    const userId = res.locals.userId as string;

    // Only include organizations this user belongs to.
    const memberships = await prisma.organizationMember.findMany({
      where: { userId },
      select: { organizationId: true },
    });

    const organizationIds = memberships.map(
      (membership) => membership.organizationId,
    );

    if (organizationIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          totalWorkflows: 0,
          pendingRequests: 0,
          pendingApprovals: 0,
          completedThisMonth: 0,
          recentRequests: [],
        },
      });
    }

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const [
      totalWorkflows,
      pendingRequests,
      pendingApprovals,
      completedThisMonth,
      recentRequests,
    ] = await Promise.all([
      prisma.workflowDefinition.count({
        where: { organizationId: { in: organizationIds } },
      }),

      prisma.workflowRequest.count({
        where: {
          organizationId: { in: organizationIds },
          status: { in: ["PENDING", "IN_PROGRESS"] },
        },
      }),

      prisma.approvalTask.count({
        where: {
          approverId: userId,
          status: "PENDING",
          request: {
            organizationId: { in: organizationIds },
          },
        },
      }),

      prisma.workflowRequest.count({
        where: {
          organizationId: { in: organizationIds },
          status: "APPROVED",
          updatedAt: { gte: monthStart },
        },
      }),

      prisma.workflowRequest.findMany({
        where: {
          organizationId: { in: organizationIds },
        },
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          workflowDefinition: {
            select: { name: true },
          },
          createdBy: {
            select: { name: true },
          },
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalWorkflows,
        pendingRequests,
        pendingApprovals,
        completedThisMonth,
        recentRequests,
      },
    });
  } catch (error) {
    console.error("Dashboard summary error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load dashboard summary.",
    });
  }
});

export default dashboardRouter;
