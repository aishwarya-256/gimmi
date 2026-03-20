import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, BadgeCheck, Dumbbell, MapPin, Pickaxe, Phone, Mail, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

async function sendInteractionRequestAction(formData: FormData) {
  "use server";
  
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const trainerId = formData.get("trainerId") as string;
  
  await prisma.interactionRequest.upsert({
    where: {
      userId_trainerId: { userId, trainerId }
    },
    update: {},
    create: {
      userId,
      trainerId,
      status: "PENDING"
    }
  });

  revalidatePath(`/trainer/${trainerId}`);
}

export default async function TrainerProfilePage(props: { params: Promise<{ trainerId: string }> }) {
  const { trainerId } = await props.params;
  const { userId } = await auth();

  const trainer = await prisma.trainer.findUnique({
    where: { id: trainerId },
    include: {
      verifiedByGym: true,
      interactionRequests: !!userId ? {
        where: { userId }
      } : false
    }
  });

  if (!trainer) notFound();

  const hasRequested = trainer.interactionRequests && trainer.interactionRequests.length > 0;
  const requestStatus = hasRequested ? trainer.interactionRequests[0].status : null;
  const canViewContact = requestStatus === "APPROVED";

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col relative overflow-hidden pb-32">
      {/* Background */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[150px] -z-10 animate-pulse"></div>

      {/* Header */}
      <header className="px-6 py-6 max-w-4xl mx-auto w-full flex items-center justify-between z-10">
        <Link href="/trainers" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors text-white ring-1 ring-white/10">
          <ArrowLeft size={18} />
        </Link>
        {trainer.isVerified && trainer.verifiedByGym ? (
          <div className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold tracking-wider text-emerald-400 uppercase flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <BadgeCheck size={14} />
            Verified by {trainer.verifiedByGym.name}
          </div>
        ) : null}
      </header>

      {/* Profile Info */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-6 pt-8 space-y-8 relative z-10">
        
        {/* Identity */}
        <div className="text-center flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-4xl font-black text-white shadow-xl shadow-emerald-500/20 ring-4 ring-[#0a0a0a] ring-offset-2 ring-offset-white/10 mb-6">
            {trainer.name.charAt(0)}
          </div>
          <h1 className="text-4xl font-black tracking-tight flex items-center justify-center gap-2">
            {trainer.name}
            {trainer.isVerified && <BadgeCheck className="text-emerald-400 w-6 h-6 mt-1" />}
          </h1>
          <p className="text-emerald-400 font-semibold mt-1">Professional Trainer</p>
        </div>

        {/* Bio */}
        {trainer.bio && (
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-6 text-center text-gray-400 text-sm leading-relaxed max-w-lg mx-auto italic">
            "{trainer.bio}"
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 flex flex-col items-center text-center hover:bg-white/[0.05] transition-colors">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 mb-3 group-hover:bg-emerald-500/20 transition-colors">
              <MapPin className="text-emerald-400 w-5 h-5" />
            </div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Primary Gym</p>
            <p className="font-semibold text-gray-200">{trainer.gymName}</p>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 flex flex-col items-center text-center hover:bg-white/[0.05] transition-colors">
            <div className="p-2.5 rounded-xl bg-amber-500/10 mb-3 group-hover:bg-amber-500/20 transition-colors">
              <Pickaxe className="text-amber-400 w-5 h-5" />
            </div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Specialization</p>
            <p className="font-semibold text-gray-200">{trainer.specialization || "General Fitness"}</p>
          </div>
        </div>

        {/* Contact or Request Action */}
        <div className="mt-12 text-center pt-8 border-t border-white/5">
          {!userId ? (
            <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-3xl p-8">
              <Dumbbell className="w-10 h-10 text-emerald-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Want to train with {trainer.name.split(' ')[0]}?</h3>
              <p className="text-sm text-gray-400 mb-6 max-w-sm mx-auto">Sign in to request their contact information and arrange a session.</p>
              <Link href="/sign-in" className="inline-flex py-3 px-8 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all border border-white/10">
                Sign in to Request Contact
              </Link>
            </div>
          ) : canViewContact ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-6 relative overflow-hidden text-left">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-[40px] -z-10"></div>
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <BadgeCheck size={16} /> Contact Authorized
              </h3>
              
              <div className="space-y-4">
                {trainer.phone && (
                  <a href={`tel:${trainer.phone}`} className="flex items-center gap-4 p-4 rounded-xl bg-black/40 hover:bg-black/60 transition-colors border border-white/5 group">
                    <div className="p-3 rounded-xl bg-emerald-500/20 group-hover:bg-emerald-500/30 transition-colors">
                      <Phone size={18} className="text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Direct Phone</p>
                      <p className="text-lg text-white font-medium">{trainer.phone}</p>
                    </div>
                  </a>
                )}
                
                {trainer.email && (
                  <a href={`mailto:${trainer.email}`} className="flex items-center gap-4 p-4 rounded-xl bg-black/40 hover:bg-black/60 transition-colors border border-white/5 group">
                    <div className="p-3 rounded-xl bg-indigo-500/20 group-hover:bg-indigo-500/30 transition-colors">
                      <Mail size={18} className="text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Email Address</p>
                      <p className="text-base text-white font-medium">{trainer.email}</p>
                    </div>
                  </a>
                )}
              </div>
            </div>
          ) : requestStatus === "PENDING" ? (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-8 flex flex-col items-center">
              <div className="p-3 rounded-full bg-amber-500/20 text-amber-400 mb-4 animate-pulse">
                <ShieldAlert size={24} />
              </div>
              <h3 className="text-lg font-bold text-amber-400 mb-2">Request Pending</h3>
              <p className="text-sm text-amber-400/70 max-w-sm mx-auto">
                {trainer.name.split(' ')[0]} has received your request. Check back later to see if they've approved access to their contact details.
              </p>
            </div>
          ) : requestStatus === "REJECTED" ? (
            <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-8">
              <h3 className="text-lg font-bold text-red-400 mb-2">Request Declined</h3>
              <p className="text-sm text-red-400/70 max-w-sm mx-auto">
                This trainer is not currently accepting new requests.
              </p>
            </div>
          ) : (
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-8 text-center ring-1 ring-white/5">
              <h3 className="text-xl font-bold text-white mb-2">Ready to train?</h3>
              <p className="text-sm text-gray-400 mb-6 max-w-sm mx-auto">
                Send a request to securely access {trainer.name.split(' ')[0]}'s contact information.
              </p>
              
              <form action={sendInteractionRequestAction}>
                <input type="hidden" name="trainerId" value={trainer.id} />
                <button type="submit" className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:-translate-y-1">
                  Request Contact Details
                </button>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
