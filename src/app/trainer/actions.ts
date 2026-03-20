"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

// Redirect trainer to dashboard if they are already registered
export async function checkTrainerRegistration() {
  const { userId } = await auth();
  if (!userId) redirect("/trainer/sign-in");

  const trainer = await prisma.trainer.findUnique({
    where: { userId }
  });

  if (trainer) {
    redirect("/trainer/dashboard");
  }

  // Find gyms for the dropdown
  const gyms = await prisma.gym.findMany({
    where: { isActive: true },
    select: { id: true, name: true }
  });

  return gyms;
}

export async function registerTrainerAction(formData: FormData) {
  const { userId } = await auth();
  const user = await currentUser();
  if (!userId || !user) throw new Error("Unauthorized");

  const phone = formData.get("phone") as string;
  const gymId = formData.get("gymId") as string;
  const gymName = formData.get("gymName") as string;
  const specialization = formData.get("specialization") as string;
  const bio = formData.get("bio") as string;

  if (!gymName) {
    throw new Error("Gym name is required.");
  }

  // Ensure user is in our User table (for interaction requests later)
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      email: user.emailAddresses[0]?.emailAddress || `trainer-${userId}@gimmi.app`,
      name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : "Trainer",
    }
  });

  const trainer = await prisma.trainer.create({
    data: {
      userId,
      name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : "Trainer",
      email: user.emailAddresses[0]?.emailAddress || "",
      phone,
      specialization,
      bio,
      gymName,
    }
  });

  // If they selected a registered gym, create a verification request
  if (gymId) {
    await prisma.trainerVerificationRequest.create({
      data: {
        trainerId: trainer.id,
        gymId
      }
    });
  }

  redirect("/trainer/dashboard");
}

export async function getTrainerDashboardData() {
  const { userId } = await auth();
  if (!userId) redirect("/trainer/sign-in");

  const trainer = await prisma.trainer.findUnique({
    where: { userId },
    include: {
      verifiedByGym: true,
      verificationRequests: {
        include: { gym: true }
      },
      interactionRequests: {
        include: { user: true },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!trainer) {
    redirect("/trainer/register");
  }

  return trainer;
}

export async function handleInteractionRequestAction(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const requestId = formData.get("requestId") as string;
  const action = formData.get("action") as string; // 'approve' or 'reject'

  const trainer = await prisma.trainer.findUnique({
    where: { userId }
  });

  if (!trainer) throw new Error("Trainer profile not found");

  await prisma.interactionRequest.update({
    where: { 
      id: requestId,
      trainerId: trainer.id // Ensure trainer owns this request
    },
    data: {
      status: action === 'approve' ? 'APPROVED' : 'REJECTED'
    }
  });

  revalidatePath("/trainer/dashboard");
}
