"use server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

// Utility for authorization check
async function assertSuperAdmin(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.platformRole !== "SUPER_ADMIN") {
    throw new Error("UNAUTHORIZED: Trust & Safety Level 4 Clearance Required.");
  }
}

export async function processVerificationAction(verificationId: string, actionPayload: {
  action: "APPROVE" | "REJECT" | "SUSPEND" | "ASSIGN" | "UPDATE_NOTES",
  reason?: string,
  notes?: string
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");
  await assertSuperAdmin(userId);

  // @ts-ignore - IDE Cache Lag
  const verification = await prisma.gymVerification.findUnique({ where: { id: verificationId } });
  if (!verification) return { error: "Verification profile not found." };

  const { action, reason, notes } = actionPayload;

  try {
    const updateData: any = {};
    const gymUpdateData: any = {};
    let newStatus = verification.status;

    if (notes) updateData.notes = notes;

    if (action === "APPROVE") {
      newStatus = "APPROVED";
      gymUpdateData.verificationStatus = "APPROVED";
    } else if (action === "REJECT") {
      newStatus = "REJECTED";
      gymUpdateData.verificationStatus = "REJECTED";
      updateData.rejectionReason = reason || "Does not meet physical location standard.";
    } else if (action === "SUSPEND") {
      newStatus = "SUSPENDED";
      gymUpdateData.verificationStatus = "SUSPENDED";
      updateData.suspensionReason = reason || "Suspended by Trust & Safety.";
    } else if (action === "ASSIGN") {
      updateData.assignedToId = userId;
      if (newStatus === "SUBMITTED" || newStatus === "NOT_SUBMITTED") {
         newStatus = "UNDER_REVIEW";
         gymUpdateData.verificationStatus = "UNDER_REVIEW";
      }
    }

    updateData.status = newStatus;

    // Execute atomic transaction for synchronization
    await prisma.$transaction(async (tx) => {
      // @ts-ignore - IDE Cache Lag
      await tx.gymVerification.update({
        where: { id: verification.id },
        data: updateData
      });

      if (Object.keys(gymUpdateData).length > 0) {
        await tx.gym.update({
          where: { id: verification.gymId },
          data: gymUpdateData
        });
      }

      // @ts-ignore - IDE Cache Lag
      await tx.verificationAuditLog.create({
        data: {
          verificationId: verification.id,
          changedById: userId,
          oldStatus: verification.status,
          newStatus: newStatus as any,
          reason: reason || action
        }
      });
    });

    revalidatePath(`/platform-admin/verifications`);
    revalidatePath(`/platform-admin/verifications/${verification.id}`);
    
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}
