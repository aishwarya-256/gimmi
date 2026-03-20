"use server";

import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Helper: verify the current user is an OWNER/MANAGER of the given gym
async function verifyGymAdmin(gymSlug: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const gym = await prisma.gym.findUnique({
    where: { slug: gymSlug },
    include: {
      members: { where: { userId, role: { in: ["OWNER", "MANAGER"] } } }
    }
  });

  if (!gym) throw new Error("Gym not found");
  if (gym.members.length === 0) throw new Error("Access denied — you are not an admin of this gym.");

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
    throw new Error("All fields are required.");
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
    throw new Error("Title and content are required.");
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

