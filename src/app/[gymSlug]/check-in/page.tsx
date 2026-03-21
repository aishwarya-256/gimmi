import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";
import CheckInGate from "./check-in-gate";

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

  // ==== TRUST AND SAFETY: VERIFICATION LOCKOUT ====
  // @ts-ignore - IDE Cache Lag
  if (gym.verificationStatus !== "APPROVED") {
    return <StatusView status="error" message="Gym Not Verified" subtext="This facility is currently undergoing physical Trust & Safety verification and cannot accept check-ins yet." />;
  }

  // 1.5 Quick existence check for token URL parameter
  if (!token) {
    return <StatusView status="error" message="No Check-In Pass Found" subtext="Please scan the live display at the front desk." actionLink={`/${gymSlug}`} actionText="Return Home" />;
  }

  // 2. Render Interactive Gate to prevent CSRF / Remote auto-scans
  return <CheckInGate gymSlug={gymSlug} token={token} gymName={gym.name} />;
}

// Reusable UI for pre-gate errors
function StatusView({ status, message, subtext, actionLink, actionText }: { 
  status: "error"; 
  message: string; 
  subtext?: string;
  actionLink?: string;
  actionText?: string;
}) {
  return (
    <div className={`min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 bg-gradient-to-t from-rose-900/40 to-transparent relative overflow-hidden`}>
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-500/20 rounded-full blur-[150px] -z-10`}></div>
      
      <div className={`w-32 h-32 rounded-full border-4 border-[#0a0a0a] bg-black text-rose-400 ring-1 ring-rose-500/50 flex items-center justify-center shadow-2xl mb-8`}>
        <ShieldAlert size={80} />
      </div>

      <h1 className="text-4xl font-black text-white tracking-tight text-center mb-3">
        {message}
      </h1>
      
      {subtext && (
        <p className="text-lg text-gray-400 text-center max-w-sm mb-12">
          {subtext}
        </p>
      )}

      {actionLink && actionText && (
        <Link href={actionLink} className="w-full max-w-sm py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all text-center ring-1 ring-white/10 backdrop-blur-md">
          {actionText}
        </Link>
      )}
    </div>
  );
}
