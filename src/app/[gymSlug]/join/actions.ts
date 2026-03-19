"use server";

import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

export async function joinGymAction(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const gymId = formData.get("gymId") as string;
  const planId = formData.get("planId") as string;
  const slug = formData.get("slug") as string;

  if (!gymId || !planId) throw new Error("Missing gym or plan ID.");

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
