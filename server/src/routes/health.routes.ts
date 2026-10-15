import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const healthRouter = Router();

// Check whether the API is running.
healthRouter.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    service: "FlowPilot API",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

// Check whether the database is reachable.
healthRouter.get("/db", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      success: true,
      database: "connected",
    });
  } catch (error) {
    console.error("Database health check failed:", error);

    res.status(503).json({
      success: false,
      database: "unavailable",
    });
  }
});

export default healthRouter;
