import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ShieldCheck, Dumbbell, Zap } from "lucide-react";
import { joinGymAction } from "./actions";
import { auth } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

export default async function JoinGymPage(props: { 
  params: Promise<{ gymSlug: string }>,
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const gymSlug = (await props.params).gymSlug.toLowerCase();
  const searchParams = await props.searchParams;
  const urlStatus = searchParams.status as string | undefined;
  const { userId } = await auth();

  const gym = await prisma.gym.findUnique({
    where: { slug: gymSlug },
    include: {
      plans: {
        orderBy: { price: "asc" }
      }
    }
  });

  if (!gym) {
    redirect("/customer");
  }

  // Check database for actual join status
  let dbStatus: string | null = null;
  if (userId) {
    const request = await prisma.joinRequest.findUnique({
      where: { userId_gymId: { userId, gymId: gym.id } }
    });
    dbStatus = request?.status.toLowerCase() || null;
  }

  const status = urlStatus || dbStatus;

  // If already accepted, redirect to dashboard
  if (status === "accepted") {
    redirect(`/${gym.slug}`);
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col relative overflow-hidden selection:bg-emerald-500/30">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] -z-10 animate-pulse"></div>
      <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-teal-600/10 rounded-full blur-[100px] -z-10"></div>

      {/* Header */}
      <header className="px-6 py-6 max-w-5xl mx-auto w-full flex items-center justify-between z-10">
        <Link href="/customer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors text-white ring-1 ring-white/10">
          <ArrowLeft size={18} />
        </Link>
        <div className="px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-xs font-semibold tracking-wider text-gray-400 uppercase flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-emerald-500" />
          Verified Partner
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-12 flex flex-col items-center">
        
        {/* Gym Identity Info */}
        <div className="text-center mb-16 max-w-2xl">
          <div className="w-20 h-20 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.3)] ring-1 ring-white/20">
            <Dumbbell className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 capitalize">{gym.name}</h1>
          <p className="text-lg text-gray-400 leading-relaxed font-light">Join the most active fitness community on Gimmi. Purchase a plan below to instantly activate your digital key and gain access.</p>
        </div>

        {/* Membership Plans or Status Feedback */}
        <div className="w-full">
          {status === "pending" ? (
            <div className="max-w-xl mx-auto p-10 rounded-[2.5rem] bg-white/[0.02] border border-emerald-500/20 backdrop-blur-md text-center">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl mx-auto mb-6 flex items-center justify-center animate-pulse">
                <ShieldCheck size={32} className="text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Request Sent Successfully!</h2>
              <p className="text-gray-400 mb-8 leading-relaxed">
                Your request to join <span className="text-white font-semibold">@{gym.slug}</span> is currently pending approval by the gym owner. 
                You will be notified once they have reviewed your request.
              </p>
              <div className="flex gap-4 items-center justify-center">
                <Link href="/customer" className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-sm font-semibold border border-white/10">
                  Go to Dashboard
                </Link>
                <Link href={`/${gym.slug}`} className="px-6 py-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-sm font-semibold hover:bg-emerald-500/20 transition-all opacity-50 cursor-not-allowed">
                  Access Community (Locked)
                </Link>
              </div>
            </div>
          ) : status === "rejected" ? (
            <div className="max-w-xl mx-auto p-10 rounded-[2.5rem] bg-white/[0.02] border border-red-500/20 backdrop-blur-md text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <ArrowLeft size={32} className="text-red-400 rotate-45" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Membership Declined</h2>
              <p className="text-gray-400 mb-8 leading-relaxed">
                We re sorry, but your request to join this gym has been declined by the administrator. 
                Please contact the gym directly if you believe this is an error.
              </p>
              <Link href="/customer" className="inline-block px-8 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-sm font-semibold border border-white/10 text-white">
                Back to Dashboard
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-center mb-8 flex items-center justify-center gap-2">
                <Zap size={20} className="text-amber-400" />
                Select a Membership Plan
              </h2>

              {gym.plans.length === 0 ? (
                <div className="text-center p-8 bg-white/5 rounded-2xl border border-white/10 max-w-md mx-auto">
                  <p className="text-gray-400 font-medium">This gym hasn&apos;t set up any membership plans yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {gym.plans.map((plan) => (
                    <div key={plan.id} className="relative p-6 rounded-3xl bg-white/[0.03] border border-white/[0.08] hover:border-emerald-500/50 hover:bg-white/[0.05] transition-all duration-300 group flex flex-col justify-between">
                      {/* Subtle hover glow */}
                      <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none"></div>

                      <div className="relative z-10">
                        <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                        <div className="flex items-baseline gap-1 mb-6">
                          <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">₹{plan.price}</span>
                          <span className="text-sm text-gray-500 font-medium">/ {plan.durationDays} days</span>
                        </div>

                        <ul className="space-y-4 mb-8">
                          <li className="flex items-start gap-3 text-sm text-gray-300">
                            <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                            <span>Full Gym Access for {plan.durationDays} days</span>
                          </li>
                          <li className="flex items-start gap-3 text-sm text-gray-300">
                            <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                            <span>App-based QR Check-ins</span>
                          </li>
                          <li className="flex items-start gap-3 text-sm text-gray-300">
                            <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                            <span>Member Community Access</span>
                          </li>
                        </ul>
                      </div>

                      <form action={joinGymAction} className="relative z-10 mt-auto">
                        <input type="hidden" name="gymId" value={gym.id} />
                        <input type="hidden" name="planId" value={plan.id} />
                        <input type="hidden" name="slug" value={gym.slug} />
                        
                        {userId ? (
                          <button type="submit" className="w-full py-4 rounded-xl bg-white/10 hover:bg-gradient-to-r hover:from-emerald-500 hover:to-teal-500 text-white font-bold transition-all duration-300 shadow-lg hover:shadow-emerald-500/25">
                            Purchase & Request Access
                          </button>
                        ) : (
                          <Link href="/sign-in" className="flex items-center justify-center w-full py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold transition-all">
                            Sign In to Join
                          </Link>
                        )}
                      </form>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
