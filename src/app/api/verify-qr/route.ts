import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const QR_SECRET = process.env.CLERK_SECRET_KEY || "gimmi-qr-secret-fallback";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ status: "DENIED_INVALID", message: "No QR token provided." }, { status: 400 });
    }

    // 1. Verify JWT token
    let payload: { userId: string; gymId: string; gymSlug: string; type: string };
    try {
      payload = jwt.verify(token, QR_SECRET) as typeof payload;
    } catch {
      return NextResponse.json({ status: "DENIED_INVALID", message: "QR code expired or tampered." }, { status: 401 });
    }

    if (payload.type !== "attendance") {
      return NextResponse.json({ status: "DENIED_INVALID", message: "Invalid QR code type." }, { status: 400 });
    }

    // 2. Check membership is active
    const membership = await prisma.gymMember.findUnique({
      where: { userId_gymId: { userId: payload.userId, gymId: payload.gymId } },
      include: { user: true },
    });

    if (!membership) {
      return NextResponse.json({ status: "DENIED_INVALID", message: "Not a member of this gym." }, { status: 403 });
    }

    if (membership.status !== "ACTIVE") {
      return NextResponse.json({
        status: "DENIED_EXPIRED",
        message: `Membership is ${membership.status.toLowerCase()}.`,
        memberName: membership.user.name,
      }, { status: 403 });
    }

    // 3. Cooldown check — prevent scanning same person within 2 hours
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const recentScan = await prisma.attendance.findFirst({
      where: {
        gymId: payload.gymId,
        userId: payload.userId,
        status: "SUCCESS",
        entryTime: { gte: twoHoursAgo },
      },
    });

    if (recentScan) {
      return NextResponse.json({
        status: "DENIED_COOLDOWN",
        message: "Already checked in within the last 2 hours.",
        memberName: membership.user.name,
        lastEntry: recentScan.entryTime,
      }, { status: 429 });
    }

    // 4. Record successful attendance
    const record = await prisma.attendance.create({
      data: {
        gymId: payload.gymId,
        userId: payload.userId,
        status: "SUCCESS",
      },
    });

    return NextResponse.json({
      status: "SUCCESS",
      message: "Check-in successful!",
      memberName: membership.user.name,
      memberRole: membership.role,
      entryTime: record.entryTime,
    });

  } catch (error) {
    console.error("QR verification failed:", error);
    return NextResponse.json({ status: "DENIED_INVALID", message: "Server error." }, { status: 500 });
  }
}
