
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";

async function main() {
  const email = "admin@gmail.com";
  const password = "admin123";
  const name = "FlowPilot Admin";

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.$transaction(async (tx) => {
    // Create the admin or update the designated account.
    const admin = await tx.user.upsert({
      where: { email },
      update: {
        name,
        passwordHash,
        systemRole: "ADMIN",
      },
      create: {
        name,
        email,
        passwordHash,
        systemRole: "ADMIN",
      },
      select: {
        id: true,
        name: true,
        email: true,
        systemRole: true,
      },
    });

    // Ensure the admin also has a workspace for the
    // existing organization-aware application.
    const membership = await tx.organizationMember.findFirst({
      where: { userId: admin.id },
      select: { id: true },
    });

    if (!membership) {
      const organization = await tx.organization.create({
        data: {
          name: "FlowPilot Admin Workspace",
          slug: `flowpilot-admin-${admin.id}`,
        },
        select: { id: true },
      });

      await tx.organizationMember.create({
        data: {
          userId: admin.id,
          organizationId: organization.id,
          role: "OWNER",
        },
      });
    }

    console.log("Admin account provisioned:", {
      email: admin.email,
      role: admin.systemRole,
    });
  });
}

main()
  .catch((error) => {
    console.error("Failed to provision admin account:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
