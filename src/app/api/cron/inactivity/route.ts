import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    // Secure the cron route, typically handled by Vercel CRON_SECRET or similar header
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      // In local dev without CRON_SECRET, we might allow it for testing, but in prod we restrict.
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get all active gym members
    const activeMembers = await prisma.gymMember.findMany({
      where: { status: "ACTIVE", role: "MEMBER" },
      include: {
        user: true,
        gym: true,
      }
    });

    let notificationsCreated = 0;

    for (const member of activeMembers) {
      if (!member.user.name || member.user.name === "Gym Member") continue;

      // Find their latest successful attendance
      const lastAttendance = await prisma.attendance.findFirst({
        where: { userId: member.userId, gymId: member.gymId, isSuccess: true },
        orderBy: { entryTime: "desc" }
      });

      let inactiveDays = -1;
      let lastVisitStr = "Never visited";

      if (!lastAttendance) {
        // Evaluate based on member creation date
        const creationDate = new Date(member.createdAt);
        if (creationDate < sevenDaysAgo) {
          inactiveDays = Math.floor((Date.now() - creationDate.getTime()) / (1000 * 60 * 60 * 24));
        }
      } else {
        const entryTime = new Date(lastAttendance.entryTime);
        if (entryTime < sevenDaysAgo) {
          inactiveDays = Math.floor((Date.now() - entryTime.getTime()) / (1000 * 60 * 60 * 24));
          lastVisitStr = entryTime.toLocaleDateString();
        }
      }

      if (inactiveDays >= 7) {
        // Prevent duplicate spam - check if we already notified them today
        const todayStr = new Date().toISOString().split("T")[0];
        const existingNotif = await prisma.notification.findFirst({
          where: {
            userId: member.userId,
            gymId: member.gymId,
            type: "INACTIVITY",
            createdAt: { gte: new Date(todayStr) }
          }
        });

        if (!existingNotif) {
          // Notify the USER
          await prisma.notification.create({
            data: {
              userId: member.userId,
              gymId: member.gymId,
              type: "INACTIVITY",
              title: `We miss you at ${member.gym.name}!`,
              message: `You haven't visited the gym in ${inactiveDays} days (Last visit: ${lastVisitStr}). Keep up your momentum!`,
            }
          });

          // Notify the GYM OWNER/ADMIN (userId = null implies gym-wide admin notification)
          await prisma.notification.create({
            data: {
              gymId: member.gymId,
              type: "INACTIVITY_ADMIN_ALERT",
              title: `Inactive Member: ${member.user.name}`,
              message: `${member.user.name} has not visited for ${inactiveDays} days. Reach out to them!`,
            }
          });
          
          notificationsCreated += 2;
        }
      }
    }

    return NextResponse.json({ success: true, processed: activeMembers.length, notificationsCreated });

  } catch (error: any) {
    console.error("Cron Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
