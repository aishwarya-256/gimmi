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

  // Check if a request already exists
  const existingRequest = await prisma.joinRequest.findUnique({
    where: { userId_gymId: { userId, gymId } }
  });

  if (existingRequest) {
    if (existingRequest.status === "ACCEPTED") {
      // If already accepted but somehow they hit this page, ensure member record exists
      await prisma.gymMember.upsert({
        where: { userId_gymId: { userId, gymId } },
        update: { planId, status: "ACTIVE" },
        create: { userId, gymId, planId, role: "MEMBER", status: "ACTIVE" }
      });
      redirect(`/${slug}`);
    }
    // If pending or rejected, just redirect back or stay
    redirect(`/${slug}/join?status=${existingRequest.status.toLowerCase()}`);
  }

  // Create Join Request
  await prisma.joinRequest.create({
    data: {
      userId,
      gymId,
      status: "PENDING",
    }
  });

  // Also create the membership record but in a "PENDING" or restricted state?
  // User says: "customer cannot use gym entry QR access until request is accepted"
  // Let's create the member but with status EXPIRED or something, or better: 
  // Just use the JoinRequest as the guard.
  
  await prisma.gymMember.upsert({
    where: { userId_gymId: { userId, gymId } },
    update: { planId, status: "ACTIVE" }, // Plan is "taken", but entry is blocked by JoinRequest status in middleware/page logic
    create: {
      userId,
      gymId,
      planId,
      role: "MEMBER",
      status: "ACTIVE", // Plan is active, but "Join Request" is what we check for community/entry
    }
  });

  redirect(`/${slug}/join?status=pending`);
}
