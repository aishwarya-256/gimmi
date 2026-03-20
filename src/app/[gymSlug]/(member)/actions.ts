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
    prisma.attendance.count({
      where: { gymId: gym.id, userId, status: "SUCCESS" },
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
export async function verifyGymEntryAction(gymSlug: string, token: string) {
  const { userId } = await auth();
  if (!userId) return { success: false, message: "Authentication required" };

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

  const hasAccess = 
    (member && ["OWNER", "MANAGER", "STAFF"].includes(member.role)) || 
    (member && member.status === "ACTIVE") || 
    (joinRequest);

  if (!hasAccess) {
    return { success: false, message: "Access Denied: You do not have an active membership here." };
  }

  // 3. Verify Token
  try {
    let secretToCheck = token;
    
    // If the scanned token is a URL (the desk poster), extract the "t" param
    if (token.includes("check-in?t=")) {
      try {
        const url = new URL(token);
        secretToCheck = url.searchParams.get("t") || token;
      } catch (e) {
        // Fallback to raw token if URL parsing fails
      }
    }

    if (!gym.qrSecret || gym.qrSecret !== secretToCheck) {
      return { success: false, message: "Invalid or expired QR code. Please scan the latest desk poster." };
    }

    // 4. Mark Attendance
    await prisma.attendance.create({
      data: {
        userId,
        gymId: gym.id,
        status: "SUCCESS",
        entryTime: new Date(),
      }
    });

    // 5. Trigger Pusher for Admin Dashboard live feed
    try {
      const { pusherServer } = await import("@/lib/pusher");
      const user = await prisma.user.findUnique({ where: { id: userId } });
      
      await pusherServer.trigger(`gym-${gym.id}`, "entry-log", {
        userName: user?.name || "Member",
        userEmail: user?.email,
        planName: member?.plan?.name || member?.role || "Approved Member",
        timestamp: new Date().toISOString(),
      });
    } catch (pushErr) {
      console.error("Pusher trigger failed:", pushErr);
    }

    return { success: true, message: `Welcome to ${gym.name}!` };
  } catch (err) {
    return { success: false, message: "QR code expired or invalid" };
  }
}
