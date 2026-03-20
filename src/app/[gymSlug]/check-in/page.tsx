import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";
import { CheckCircle2, XCircle, Clock, ShieldAlert } from "lucide-react";
import Link from "next/link";

const prisma = new PrismaClient();

export default async function CheckInPage(props: { params: Promise<{ gymSlug: string }>; searchParams: Promise<{ t?: string }> }) {
  const { gymSlug } = await props.params;
  const { t: token } = await props.searchParams;
  const { userId } = await auth();

  // If they aren't logged in, redirect them to sign-in securely, and then drop them right back here to check-in!
  if (!userId) {
    redirect(`/sign-in?redirect_url=/${gymSlug}/check-in${token ? `?t=${token}` : ""}`);
  }

  // 1. Validate Gym exists
  const gym = await prisma.gym.findUnique({ where: { slug: gymSlug } });
  if (!gym) {
    return <StatusView status="error" message="This gym does not exist on the Gimmi network." />;
  }

  // 1.5 Validate Secure Static QR Token
  if (!token || gym.qrSecret !== token) {
    return <StatusView status="error" message="Invalid or Expired QR Code" subtext="Please scan the latest poster at the front desk." actionLink={`/${gymSlug}`} actionText="Return Home" />;
  }

  const joinRequest = await prisma.joinRequest.findUnique({
    where: { userId_gymId: { userId, gymId: gym.id } },
  });

  const member = await prisma.gymMember.findUnique({
    where: { userId_gymId: { userId, gymId: gym.id } },
    include: { plan: true },
  });

  const hasAccess = 
    (member && ["OWNER", "MANAGER", "STAFF"].includes(member.role)) || 
    (member && member.status === "ACTIVE") || 
    (joinRequest && joinRequest.status === "ACCEPTED");

  if (!hasAccess) {
    return (
      <StatusView 
        status="denied" 
        message="Access Denied" 
        subtext="You do not have an active membership at this gym."
        actionLink={`/${gymSlug}`}
        actionText="Return Home"
      />
    );
  }

  // 4. Cooldown Protection (e.g., prevent scanning twice by accident in 2 hours)
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
  const recentEntry = await prisma.attendance.findFirst({
    where: { gymId: gym.id, userId, entryTime: { gte: twoHoursAgo } },
  });

  if (recentEntry) {
    return (
      <StatusView 
        status="cooldown" 
        message="You're already checked in!" 
        subtext="Have a great workout."
        actionLink={`/${gymSlug}`}
        actionText="Go to Dashboard"
      />
    );
  }

  // 5. Record the Successful Check-In
  await prisma.attendance.create({
    data: {
      gymId: gym.id,
      userId,
      status: "SUCCESS",
    },
  });

  // 6. Trigger Pusher for Admin Live Dashboard
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

  // Success 
  return (
    <StatusView 
      status="success" 
      message="Access Granted" 
      subtext={`Welcome to ${gym.name}!`}
      actionLink={`/${gymSlug}`}
      actionText="Enter App"
    />
  );
}

// Reusable UI for the full-screen check-in response
function StatusView({ status, message, subtext, actionLink, actionText }: { 
  status: "success" | "denied" | "cooldown" | "error"; 
  message: string; 
  subtext?: string;
  actionLink?: string;
  actionText?: string;
}) {
  
  const ui = {
    success: { icon: <CheckCircle2 size={80} />, color: "text-emerald-400", bg: "from-emerald-900/40", ring: "ring-emerald-500/50", glow: "bg-emerald-500/20" },
    denied: { icon: <XCircle size={80} />, color: "text-red-400", bg: "from-red-900/40", ring: "ring-red-500/50", glow: "bg-red-500/20" },
    cooldown: { icon: <Clock size={80} />, color: "text-amber-400", bg: "from-amber-900/40", ring: "ring-amber-500/50", glow: "bg-amber-500/20" },
    error: { icon: <ShieldAlert size={80} />, color: "text-rose-400", bg: "from-rose-900/40", ring: "ring-rose-500/50", glow: "bg-rose-500/20" },
  }[status];

  return (
    <div className={`min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 bg-gradient-to-t ${ui.bg} to-transparent relative overflow-hidden`}>
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] ${ui.glow} rounded-full blur-[150px] -z-10`}></div>
      
      <div className={`w-32 h-32 rounded-full border-4 border-[#0a0a0a] bg-black ${ui.color} ring-1 ${ui.ring} flex items-center justify-center shadow-2xl mb-8 animate-bounce-slow`}>
        {ui.icon}
      </div>

      <h1 className="text-4xl font-black text-white tracking-tight text-center mb-3">
        {message}
      </h1>
      
      {subtext && (
        <p className="text-lg text-gray-400 text-center max-w-sm mb-12">
          {subtext}
        </p>
      )}

      {actionLink && actionText ? (
        <Link href={actionLink} className="w-full max-w-sm py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all text-center ring-1 ring-white/10 backdrop-blur-md">
          {actionText}
        </Link>
      ) : (
        <Link href="/customer" className="w-full max-w-sm py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all text-center border border-white/5">
          Go Home
        </Link>
      )}
    </div>
  );
}
