"use server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

export async function submitGymVerification(gymId: string, gymSlug: string, formData: FormData) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // Security: Assert caller is actually OWNER
  const member = await prisma.gymMember.findUnique({
    where: { userId_gymId: { userId, gymId } }
  });

  if (!member || member.role !== "OWNER") {
    return { error: "Unauthorized. Only Gym Owners can submit verification evidence." };
  }

  const ownerName = formData.get("ownerName")?.toString().trim();
  const phone = formData.get("phone")?.toString().trim();
  const email = formData.get("email")?.toString().trim();
  const address = formData.get("address")?.toString().trim();
  const latitude = parseFloat(formData.get("latitude")?.toString() || "0");
  const longitude = parseFloat(formData.get("longitude")?.toString() || "0");
  const docsLink = formData.get("docsLink")?.toString().trim() || "";

  if (!ownerName || !phone || !email || !address) {
    return { error: "Missing required critical fields." };
  }

  // UPSERT the GymVerification profile
  const verification = await prisma.gymVerification.upsert({
    where: { gymId },
    update: {
      ownerName, phone, email, address, 
      latitude: latitude || null, 
      longitude: longitude || null,
      documents: [docsLink],
      status: "SUBMITTED",
      // Reset any previous rejection metadata when resubmitting
      rejectionReason: null,
      suspensionReason: null
    },
    create: {
      gymId, ownerName, phone, email, address,
      latitude: latitude || null, 
      longitude: longitude || null,
      documents: [docsLink],
      status: "SUBMITTED"
    }
  });

  // Synchronize top-level Gym status
  await prisma.gym.update({
    where: { id: gymId },
    data: { verificationStatus: "SUBMITTED" }
  });

  // Generate immutable Audit Log
  await prisma.verificationAuditLog.create({
    data: {
      verificationId: verification.id,
      changedById: userId,
      newStatus: "SUBMITTED",
      reason: "Owner submitted identity and location evidence."
    }
  });

  revalidatePath(`/${gymSlug}/admin`);
  return { success: true };
}
