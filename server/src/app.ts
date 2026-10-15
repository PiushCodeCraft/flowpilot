import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import { env } from "./config/env.js";
import healthRouter from "./routes/health.routes.js";
import authRouter from "./routes/auth.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import workflowRouter from "./routes/workflow.routes.js";

const app = express();

app.disable("x-powered-by");

app.use(helmet());

app.use(
  cors({
    origin: env.CLIENT_ORIGIN,
    credentials: true,
  }),
);

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to FlowPilot API",
    health: "/api/health",
    databaseHealth: "/api/health/db",
  });
});
app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/workflows", workflowRouter);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

export default app;
