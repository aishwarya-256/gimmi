"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

export async function joinGymAction(formData: FormData) {
  const { userId } = await auth();
  const user = await currentUser();
  
  if (!userId || !user) throw new Error("Unauthorized");

  const gymId = formData.get("gymId") as string;
  const planId = formData.get("planId") as string;
  const slug = formData.get("slug") as string;

  if (!gymId || !planId) throw new Error("Missing gym or plan ID.");

  // Make sure the user exists in our DB first
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      email: user.emailAddresses[0]?.emailAddress || `user-${userId}@gimmi.app`,
      name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : "Gym Member",
    }
  });

  // For this MVP, immediately create an active membership (mimicking a successful purchase).
  // In Phase 7, this will go to Stripe Checkout first.
  await prisma.gymMember.create({
    data: {
      userId,
      gymId,
      planId,
      role: "MEMBER",
      status: "ACTIVE",
    }
  });

  redirect(`/${slug}`);
}
