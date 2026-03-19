"use server";

import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

export async function createGymAction(formData: FormData) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized — please sign in first.");
  }

  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;

  if (!name || !slug) {
    throw new Error("Name and Slug are required.");
  }

  const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, "");

  // 1. Ensure user exists in our DB
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      email: `user-${userId.slice(0, 8)}@gimmi.app`,
      name: "Platform Admin",
      platformRole: "SUPER_ADMIN"
    }
  });

  // 2. Check if slug is already taken
  const existing = await prisma.gym.findUnique({ where: { slug: cleanSlug } });
  if (existing) {
    throw new Error(`The web address "${cleanSlug}" is already taken. Try a different one.`);
  }

  // 3. Create the Gym and associate the user as OWNER
  await prisma.gym.create({
    data: {
      name,
      slug: cleanSlug,
      isActive: true,
      members: {
        create: {
          userId: userId,
          role: "OWNER",
          status: "ACTIVE"
        }
      }
    }
  });

  redirect(`/${cleanSlug}/admin`);
}
