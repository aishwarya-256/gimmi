"use server";

import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

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

export async function deleteGymAction(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const gymId = formData.get("gymId") as string;
  if (!gymId) throw new Error("Gym ID is required.");

  // Ensure current user is the actual OWNER of this gym
  const membership = await prisma.gymMember.findUnique({
    where: { userId_gymId: { userId, gymId } }
  });

  if (!membership || membership.role !== "OWNER") {
    throw new Error("Only the owner can delete this gym.");
  }

  // 1. Delete all related check-in records
  await prisma.attendance.deleteMany({ where: { gymId } });

  // 2. Delete all gym announcements
  await prisma.announcement.deleteMany({ where: { gymId } });

  // 3. Delete all membership plans
  await prisma.membershipPlan.deleteMany({ where: { gymId } });

  // 4. Delete all gym members
  await prisma.gymMember.deleteMany({ where: { gymId } });

  // 5. Finally, delete the Gym itself
  await prisma.gym.delete({
    where: { id: gymId }
  });

  revalidatePath("/admin");
}
