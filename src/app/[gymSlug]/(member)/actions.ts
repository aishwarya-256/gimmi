"use server";

import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const QR_SECRET = process.env.CLERK_SECRET_KEY || "gimmi-qr-secret-fallback";

// Verify user is an active member of this gym
async function verifyActiveMember(gymSlug: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const gym = await prisma.gym.findUnique({ where: { slug: gymSlug } });
  if (!gym) throw new Error("Gym not found");

  const membership = await prisma.gymMember.findUnique({
    where: { userId_gymId: { userId, gymId: gym.id } },
    include: { plan: true },
  });

  if (!membership) throw new Error("You are not a member of this gym.");
  if (membership.status !== "ACTIVE") throw new Error("Your membership is not active.");

  return { gym, membership, userId };
}

// Get member dashboard data
export async function getMemberDashboard(gymSlug: string) {
  const { gym, membership, userId } = await verifyActiveMember(gymSlug);

  const [announcements, attendanceCount, recentAttendance] = await Promise.all([
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
  ]);

  return {
    gym,
    membership,
    announcements,
    totalVisits: attendanceCount,
    recentAttendance,
  };
}

// Generate a short-lived signed QR token for attendance
export async function generateQRToken(gymSlug: string) {
  const { gym, userId } = await verifyActiveMember(gymSlug);

  const token = jwt.sign(
    { userId, gymId: gym.id, gymSlug, type: "attendance" },
    QR_SECRET,
    { expiresIn: "30s" }
  );

  return token;
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
