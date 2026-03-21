"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function createGymAction(formData: FormData) {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    redirect("/sign-in");
  }

  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;

  if (!name || !slug) {
    redirect("/admin");
  }

  const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, "");

  // 1. Ensure user exists in our DB (use real Clerk data)
  await prisma.user.upsert({
    where: { id: userId },
    update: {
      name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : "Platform Admin",
      email: user.emailAddresses[0]?.emailAddress || `user-${userId.slice(0, 8)}@gimmi.app`,
    },
    create: {
      id: userId,
      email: user.emailAddresses[0]?.emailAddress || `user-${userId.slice(0, 8)}@gimmi.app`,
      name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : "Platform Admin",
      platformRole: "SUPER_ADMIN"
    }
  });

  // 2. Check if slug is already taken
  const existing = await prisma.gym.findUnique({ where: { slug: cleanSlug } });
  if (existing) {
    // Slug taken — redirect back (ideally with an error query param)
    redirect("/admin?error=slug_taken");
  }

  // 3. Create the Gym and associate the user as OWNER
  await prisma.gym.create({
    data: {
      name,
      slug: cleanSlug,
      isActive: true,
      // @ts-ignore - IDE Cache Lag
      verificationStatus: "NOT_SUBMITTED",
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
  if (!userId) redirect("/sign-in");

  const gymId = formData.get("gymId") as string;
  if (!gymId) redirect("/admin");

  // Ensure current user is the actual OWNER of this gym
  const membership = await prisma.gymMember.findUnique({
    where: { userId_gymId: { userId, gymId } }
  });

  if (!membership || membership.role !== "OWNER") {
    redirect("/admin");
  }

  // Delete all related records in correct order
  await prisma.attendance.deleteMany({ where: { gymId } });
  await prisma.story.deleteMany({ where: { gymId } });
  await prisma.joinRequest.deleteMany({ where: { gymId } });
  await prisma.announcement.deleteMany({ where: { gymId } });
  await prisma.gymMember.deleteMany({ where: { gymId } });
  await prisma.membershipPlan.deleteMany({ where: { gymId } });
  await prisma.trainerVerificationRequest.deleteMany({ where: { gymId } });

  // @ts-ignore - IDE Cache Lag
  const verification = await prisma.gymVerification.findUnique({ where: { gymId } });
  if (verification) {
    // @ts-ignore
    await prisma.verificationAuditLog.deleteMany({ where: { verificationId: verification.id } });
    // @ts-ignore
    await prisma.gymVerification.delete({ where: { id: verification.id } });
  }

  // Finally, delete the Gym itself
  await prisma.gym.delete({
    where: { id: gymId }
  });

  revalidatePath("/admin");
}
