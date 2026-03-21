"use server";

import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { notFound, redirect } from "next/navigation";

const prisma = new PrismaClient();

export async function getInactiveMembersAction(gymSlug: string) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const gym = await prisma.gym.findUnique({
    where: { slug: gymSlug },
    include: { members: { where: { userId } } },
  });

  if (!gym || !gym.members.length) notFound();

  // Ensure they are admin
  const role = gym.members[0].role;
  if (role !== "OWNER" && role !== "MANAGER") {
    redirect(`/${gymSlug}`);
  }

  // Fetch all active members
  const activeMembers = await prisma.gymMember.findMany({
    where: { gymId: gym.id, status: "ACTIVE", role: "MEMBER" },
    include: {
      user: true,
      plan: true,
    }
  });

  // Calculate inactivity
  const now = Date.now();

  const results = await Promise.all(activeMembers.map(async (member) => {
    const lastAttendance = await prisma.attendance.findFirst({
      where: { userId: member.userId, gymId: gym.id, isSuccess: true },
      orderBy: { entryTime: "desc" }
    });

    let inactiveDays = 0;
    let lastVisitDate: Date | null = null;

    if (!lastAttendance) {
      // If never visited, use creation date
      lastVisitDate = member.createdAt;
      inactiveDays = Math.floor((now - lastVisitDate.getTime()) / (1000 * 60 * 60 * 24));
    } else {
      lastVisitDate = lastAttendance.entryTime;
      inactiveDays = Math.floor((now - lastVisitDate.getTime()) / (1000 * 60 * 60 * 24));
    }

    return {
      id: member.id,
      name: member.user.name || "Unknown Member",
      email: member.user.email,
      planName: member.plan?.name || "No Plan",
      inactiveDays,
      lastVisitDate: lastVisitDate,
    };
  }));

  // Filter out people who are still active (less than 7 days)
  return results.filter(m => m.inactiveDays >= 7).sort((a, b) => b.inactiveDays - a.inactiveDays);
}
