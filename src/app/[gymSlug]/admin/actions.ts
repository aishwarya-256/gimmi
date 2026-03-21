"use server";

import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// Helper: verify the current user is an OWNER/MANAGER of the given gym
async function verifyGymAdmin(gymSlug: string) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const gym = await prisma.gym.findUnique({
    where: { slug: gymSlug.toLowerCase() },
    include: {
      members: { where: { userId, role: { in: ["OWNER", "MANAGER"] } } }
    }
  });

  if (!gym) redirect("/admin");
  if (gym.members.length === 0) redirect("/admin");

  return { gym, userId };
}

// Fetch gym dashboard data
export async function getGymDashboardData(gymSlug: string) {
  const { gym } = await verifyGymAdmin(gymSlug);

  const [memberCount, planCount, todayAttendance, announcements] = await Promise.all([
    prisma.gymMember.count({ where: { gymId: gym.id, role: "MEMBER" } }),
    prisma.membershipPlan.count({ where: { gymId: gym.id } }),
    prisma.attendance.count({
      where: {
        gymId: gym.id,
        entryTime: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }
      }
    }),
    prisma.announcement.findMany({
      where: { gymId: gym.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return { gym, memberCount, planCount, todayAttendance, announcements };
}

// Fetch all membership plans for a gym
export async function getGymPlans(gymSlug: string) {
  const { gym } = await verifyGymAdmin(gymSlug);
  return prisma.membershipPlan.findMany({
    where: { gymId: gym.id },
    include: { _count: { select: { members: true } } },
    orderBy: { createdAt: "desc" },
  });
}

// Create a new membership plan
export async function createPlanAction(gymSlug: string, formData: FormData) {
  const { gym } = await verifyGymAdmin(gymSlug);

  const name = formData.get("name") as string;
  const durationDays = parseInt(formData.get("durationDays") as string);
  const price = parseFloat(formData.get("price") as string);

  if (!name || isNaN(durationDays) || isNaN(price)) {
    return;
  }

  await prisma.membershipPlan.create({
    data: { gymId: gym.id, name, durationDays, price }
  });
}

// Delete a membership plan
export async function deletePlanAction(gymSlug: string, planId: string) {
  const { gym } = await verifyGymAdmin(gymSlug);

  await prisma.membershipPlan.delete({
    where: { id: planId, gymId: gym.id }
  });
}

// Get all members of a gym
export async function getGymMembers(gymSlug: string) {
  const { gym } = await verifyGymAdmin(gymSlug);
  return prisma.gymMember.findMany({
    where: { gymId: gym.id },
    include: { user: true, plan: true },
    orderBy: { createdAt: "desc" },
  });
}

// Post an announcement
export async function createAnnouncementAction(gymSlug: string, formData: FormData) {
  const { gym } = await verifyGymAdmin(gymSlug);

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  if (!title || !content) {
    return;
  }

  await prisma.announcement.create({
    data: { gymId: gym.id, title, content }
  });
}

// Delete an announcement
export async function deleteAnnouncementAction(gymSlug: string, announcementId: string) {
  const { gym } = await verifyGymAdmin(gymSlug);

  await prisma.announcement.delete({
    where: { id: announcementId, gymId: gym.id }
  });
}

// Get daily attendance sheet
export async function getDailyAttendance(gymSlug: string) {
  const { gym } = await verifyGymAdmin(gymSlug);
  
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  return prisma.attendance.findMany({
    where: {
      gymId: gym.id,
      entryTime: { gte: startOfDay }
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        }
      }
    },
    orderBy: { entryTime: "desc" }
  });
} 

export async function getJoinRequests(gymSlug: string) {
  const gym = await prisma.gym.findUnique({
    where: { slug: gymSlug },
    select: { id: true }
  });

  if (!gym) return [];

  return await prisma.joinRequest.findMany({
    where: { gymId: gym.id, status: "PENDING" },
    include: { user: true },
    orderBy: { createdAt: "desc" }
  });
}

export async function handleJoinRequestAction(requestId: string, action: "ACCEPT" | "REJECT") {
  const { userId: adminUserId } = await auth();
  if (!adminUserId) redirect("/sign-in");

  const request = await prisma.joinRequest.findUnique({
    where: { id: requestId },
    include: { gym: true }
  });

  if (!request) return;

  // Update request status
  await prisma.joinRequest.update({
    where: { id: requestId },
    data: { status: action === "ACCEPT" ? "ACCEPTED" : "REJECTED" }
  });

  if (action === "ACCEPT") {
    // Create or Activate member record
    // We already create a member record with status ACTIVE in joinGymAction,
    // but the approval flow is what unlocks the UI.
    // If for some reason member record doesn't exist, create it.
    await prisma.gymMember.upsert({
      where: { userId_gymId: { userId: request.userId, gymId: request.gymId } },
      update: { status: "ACTIVE" },
      create: { 
        userId: request.userId, 
        gymId: request.gymId, 
        role: "MEMBER", 
        status: "ACTIVE" 
      }
    });
  }

  // Real-time notification via Pusher
  try {
    const { pusherServer } = await import("@/lib/pusher");
    await pusherServer.trigger(`user-${request.userId}`, "join-request-updated", {
      gymName: request.gym.name,
      status: action.toLowerCase()
    });
  } catch (err) {
    console.error("Pusher error:", err);
  }

  revalidatePath(`/${request.gym.slug}/admin/requests`);
}

// Get the static QR secret for the Check-In Desk Poster
export async function getGymQrSecret(gymSlug: string) {
  const { gym } = await verifyGymAdmin(gymSlug);
  return gym.qrSecret;
}

// Rotate the static QR secret to invalidate old printed codes
export async function rotateGymQrSecretAction(gymSlug: string) {
  const { gym } = await verifyGymAdmin(gymSlug);
  const { randomUUID } = await import("crypto");
  
  const newSecret = randomUUID();
  await prisma.gym.update({
    where: { id: gym.id },
    data: { qrSecret: newSecret }
  });
  
  revalidatePath(`/${gymSlug}/admin/attendance`);
  return newSecret;
}

// Get gym ID by slug (for Pusher channel subscription)
export async function getGymIdBySlug(gymSlug: string) {
  const { gym } = await verifyGymAdmin(gymSlug);
  return gym.id;
}

const QR_SECRET = process.env.CLERK_SECRET_KEY || "gimmi-qr-secret-fallback";

// Generate a short-lived cryptographically signed token for the wall display
export async function generateDynamicQrPass(gymSlug: string) {
  const { gym } = await verifyGymAdmin(gymSlug);
  
  const payload = {
    gymId: gym.id,
    gymSlug: gym.slug,
    type: "entry",
    nonce: Math.random().toString(36).substring(2, 15)
  };

  // Issue a 60-second rolling token
  const token = jwt.sign(payload, QR_SECRET, { expiresIn: "60s" });
  return token;
}

// Get holistic analytics-oriented attendance history directly from DB
export async function getAttendanceSheet(gymSlug: string) {
  const { gym } = await verifyGymAdmin(gymSlug);
  
  const records = await prisma.attendance.findMany({
    where: { gymId: gym.id },
    orderBy: { entryTime: "desc" },
    include: {
      user: {
        include: {
          memberships: {
            where: { gymId: gym.id },
            include: { plan: true }
          }
        }
      }
    }
  });

  return records.map(record => {
    const membership = record.user?.memberships?.[0];
    const planDuration = membership?.plan?.durationDays || null;
    let memberType = "Unknown";
    
    if (membership) {
       const twoMonthsAgo = new Date();
       twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
       memberType = new Date(membership.createdAt) < twoMonthsAgo ? "Old Member" : "New Member";
    }
    const rec = record as any;
    
    return {
      id: record.id,
      name: rec.memberName,
      entryTime: record.entryTime,
      isSuccess: rec.isSuccess,
      denialReason: rec.denialReason,
      planName: rec.planStatus,
      scanMethod: rec.scanMethod,
      planDuration,
      memberType,
    };
  });
}
