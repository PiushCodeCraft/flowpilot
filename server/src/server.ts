import app from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";

const server = app.listen(env.PORT, () => {
  const baseUrl = `http://localhost:${env.PORT}`;

  console.log("\n======================================");
  console.log("       FLOWPILOT API SERVER");
  console.log("======================================");
  console.log(`🚀 Server running:  ${baseUrl}`);
  console.log(`💚 API Health:      ${baseUrl}/api/health`);
  console.log(`🗄️  Database Health: ${baseUrl}/api/health/db`);
  console.log("======================================\n");
});

let shuttingDown = false;

async function shutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;

  console.log(`\n${signal} received. Shutting down FlowPilot...`);

  server.close(async (error) => {
    try {
      await prisma.$disconnect();
      console.log("Database connection closed.");
    } catch (disconnectError) {
      console.error("Database disconnect failed:", disconnectError);
      process.exitCode = 1;
    }

    if (error) {
      console.error("Server shutdown failed:", error);
      process.exitCode = 1;
    }
  });
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
