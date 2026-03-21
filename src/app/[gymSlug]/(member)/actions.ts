"use server";

import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { notFound, redirect } from "next/navigation";

const prisma = new PrismaClient();
const QR_SECRET = process.env.CLERK_SECRET_KEY || "gimmi-qr-secret-fallback";

// Verify user is an active member of this gym
async function verifyActiveMember(gymSlug: string) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const gym = await prisma.gym.findUnique({ where: { slug: gymSlug.toLowerCase() } });
  if (!gym) notFound();

  const membership = await prisma.gymMember.findUnique({
    where: { userId_gymId: { userId, gymId: gym.id } },
    include: { plan: true },
  });

  if (!membership) {
    redirect(`/${gymSlug}/join`);
  }

  // Allow Owners/Managers to bypass plan check
  if (membership.role === "OWNER" || membership.role === "MANAGER") {
    return { gym, membership, userId };
  }

  if (membership.status !== "ACTIVE") {
    redirect(`/${gymSlug}/join`);
  }

  return { gym, membership, userId };
}

// Get member dashboard data
export async function getMemberDashboard(gymSlug: string) {
  const { gym, membership, userId } = await verifyActiveMember(gymSlug);

  const [announcements, attendanceCount, recentAttendance, joinRequest] = await Promise.all([
    prisma.announcement.findMany({
      where: { gymId: gym.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    // @ts-ignore
    prisma.attendance.count({
      where: { gymId: gym.id, userId, isSuccess: true },
    }),
    prisma.attendance.findMany({
      where: { gymId: gym.id, userId },
      orderBy: { entryTime: "desc" },
      take: 10,
    }),
    prisma.joinRequest.findUnique({
      where: { userId_gymId: { userId, gymId: gym.id } }
    })
  ]);

  return {
    gym: {
      id: gym.id,
      name: gym.name,
      slug: gym.slug,
      ownerPhone: gym.ownerPhone,
      ownerEmail: gym.ownerEmail,
      ownerWhatsApp: gym.ownerWhatsApp,
      address: gym.address,
    },
    membership,
    announcements,
    joinStatus: joinRequest?.status || "PENDING",
    totalVisits: attendanceCount,
    recentAttendance,
  };
}


// Get member's attendance history
export async function getAttendanceHistory(gymSlug: string) {
  const { gym, userId } = await verifyActiveMember(gymSlug);

  return prisma.attendance.findMany({
    where: { gymId: gym.id, userId },
    orderBy: { entryTime: "desc" },
    take: 50,
  });
}

// Verify scanning entry
export async function verifyGymEntryAction(gymSlug: string, tokenParam: string, method: "in-app" | "external" = "in-app") {
  const { userId } = await auth();
  if (!userId) return { success: false, message: "Authentication required" };

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.name || user.name.trim().length < 2) {
    return { success: false, message: "Profile incomplete. Real name required." };
  }

  const gym = await prisma.gym.findUnique({
    where: { slug: gymSlug },
    include: {
      joinRequests: { where: { userId, status: "ACCEPTED" } },
      members: { where: { userId }, include: { plan: true } }
    }
  });

  if (!gym) return { success: false, message: "Gym not found" };

  const member = gym.members[0];
  const joinRequest = gym.joinRequests[0];

  const logScan = async (isSuccess: boolean, reason: string | null = null, planStatus: string = "None") => {
    await prisma.attendance.create({
      // @ts-ignore
      data: {
        userId,
        gymId: gym.id,
        // @ts-ignore
        memberName: user.name,
        planStatus,
        isSuccess,
        denialReason: reason,
        // @ts-ignore - IDE Cache Lag
        scanMethod: method,
        entryTime: new Date(),
      }
    });
  };

  async function triggerPusher() {
    try {
      const { pusherServer } = await import("@/lib/pusher");
      await pusherServer.trigger(`gym-${gym?.id}`, "entry-log", {
        userName: user?.name || "Member",
        userEmail: user?.email,
        planName: member?.plan?.name || member?.role || "Approved Member",
        timestamp: new Date().toISOString(),
      });
    } catch (pushErr) {
      console.error("Pusher trigger failed:", pushErr);
    }
  }

  try {
    // 1. Extract Token from potentially full URL
    let secretToCheck = tokenParam;
    
    // Handle full URL format: https://domain.com/gym-slug/check-in?t=SECRET
    if (tokenParam.includes("check-in") || tokenParam.includes("?") || tokenParam.startsWith("http")) {
      try {
        const url = new URL(tokenParam);
        const extracted = url.searchParams.get("t");
        if (extracted) {
          secretToCheck = extracted;
        }
        
        // Cross-gym protection
        const pathSlug = url.pathname.split('/')[1];
        if (pathSlug && pathSlug !== gymSlug) {
          await logScan(false, "Wrong Gym QR Scanned");
          return { success: false, message: "Wrong Gym QR Scanned" };
        }
      } catch (e) {
        // If URL parsing fails, try regex fallback
        const match = tokenParam.match(/[?&]t=([^&]+)/);
        if (match && match[1]) {
          secretToCheck = decodeURIComponent(match[1]);
        }
      }
    }

    if (!gym.qrSecret || gym.qrSecret !== secretToCheck) {
      await logScan(false, "Invalid QR token or tampered URL");
      return { success: false, message: "Invalid or expired QR code" };
    }

    // 3. User Validation Rule Engine
    const isOwnerOrStaff = member && ["OWNER", "MANAGER", "STAFF"].includes(member.role);
    if (isOwnerOrStaff) {
      await logScan(true, null, member.role);
      await triggerPusher();
      return { success: true, message: `Welcome to ${gym.name}!` };
    }

    if (!member && !joinRequest) {
      await logScan(false, "Not requested or approved yet");
      return { success: false, message: "Your membership is not approved yet" };
    }

    if (!member || member.status !== "ACTIVE") {
      await logScan(false, `Membership Status: ${member?.status || 'Missing'}`);
      return { success: false, message: "You don't have an active membership" };
    }

    if (!member.planId || !member.plan) {
      await logScan(false, "No Membership Plan", "None");
      return { success: false, message: "Please purchase a membership plan" };
    }

    // @ts-ignore - IDE Cache Lag
    let expiresAt = member.planExpiresAt;
    if (!expiresAt) {
      expiresAt = new Date(new Date(member.createdAt).getTime() + member.plan.durationDays * 24 * 60 * 60 * 1000);
    }

    if (new Date() > expiresAt) {
      await logScan(false, "Plan Expired", member.plan.name);
      return { success: false, message: "Your membership plan has expired" };
    }

    // 4. Cooldown Anti-Spam
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    // @ts-ignore - IDE Cache Lag
    const recentScan = await prisma.attendance.findFirst({
      where: {
        gymId: gym.id,
        userId: userId,
        // @ts-ignore
        isSuccess: true,
        entryTime: { gte: twoHoursAgo },
      }
    });

    if (recentScan) {
      return { success: true, message: "Already checked in! Have a great workout." };
    }

    await logScan(true, null, member.plan.name);
    await triggerPusher();
    return { success: true, message: `Welcome to ${gym.name}!` };

  } catch (err: any) {
    console.error("verifyGymEntryAction error:", err);
    return { success: false, message: `System Error: ${err.message}` };
  }
}
