import { PrismaPg } from "@prisma/adapter-pg";
// @ts-ignore Generated client is outside the configured TypeScript rootDir.
import { PrismaClient } from "../../generated/prisma/client.js";
import { env } from "../config/env.js";

const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL,
});

export const prisma = new PrismaClient({
  adapter,
});
