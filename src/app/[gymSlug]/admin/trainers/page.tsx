import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { ShieldAlert, CheckCircle, XCircle, User } from "lucide-react";
import { revalidatePath } from "next/cache";
import Link from "next/link";

const prisma = new PrismaClient();

async function handleTrainerVerificationAction(formData: FormData) {
  "use server";
  
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  
  const gymSlug = formData.get("gymSlug") as string;
  const requestId = formData.get("requestId") as string;
  const action = formData.get("action") as string; // 'approve' or 'reject'
  
  // Verify admin
  const gym = await prisma.gym.findUnique({
    where: { slug: gymSlug },
    include: {
      members: { where: { userId, role: { in: ["OWNER", "MANAGER"] } } }
    }
  });
  
  if (!gym || gym.members.length === 0) {
    throw new Error("Access denied");
  }

  const request = await prisma.trainerVerificationRequest.findUnique({
    where: { id: requestId }
  });

  if (!request || request.gymId !== gym.id) {
    throw new Error("Request not found");
  }
  
  if (action === "approve") {
    // Approve request and update trainer
    await prisma.$transaction([
      prisma.trainerVerificationRequest.update({
        where: { id: requestId },
        data: { status: "APPROVED" }
      }),
      prisma.trainer.update({
        where: { id: request.trainerId },
        data: { 
          isVerified: true,
          verifiedByGymId: gym.id
        }
      })
    ]);
  } else {
    // Reject request
    await prisma.trainerVerificationRequest.update({
      where: { id: requestId },
      data: { status: "REJECTED" }
    });
  }
  
  revalidatePath(`/${gymSlug}/admin/trainers`);
}

export default async function GymTrainersPage(props: { params: Promise<{ gymSlug: string }> }) {
  const { gymSlug } = await props.params;
  const { userId } = await auth();
  
  if (!userId) return null;
  
  const gym = await prisma.gym.findUnique({
    where: { slug: gymSlug },
    include: {
      members: { where: { userId, role: { in: ["OWNER", "MANAGER"] } } },
      trainerVerifications: {
        where: { status: "PENDING" },
        include: { trainer: true },
        orderBy: { createdAt: "desc" }
      },
      verifiedTrainers: {
        orderBy: { name: "asc" }
      }
    }
  });
  
  if (!gym || gym.members.length === 0) return <div>Access denied</div>;

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <User className="text-emerald-400" />
          Trainers Overview
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage trainers affiliated with your gym and approve verification requests.
        </p>
      </div>

      {/* Pending Requests */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 relative overflow-hidden">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <ShieldAlert className="text-amber-400" size={20} />
          Verification Requests
        </h2>
        
        {gym.trainerVerifications.length === 0 ? (
          <div className="text-center py-8 bg-white/5 rounded-xl border border-white/5">
            <p className="text-gray-400">No pending verification requests.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {gym.trainerVerifications.map(request => (
              <div key={request.id} className="bg-white/[0.02] border border-white/10 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all hover:bg-white/[0.04]">
                <div>
                  <h3 className="text-lg font-bold text-white">{request.trainer.name}</h3>
                  <p className="text-sm text-gray-400 mb-1">{request.trainer.email} • {request.trainer.phone}</p>
                  <p className="text-xs text-gray-500 line-clamp-1 italic">"{request.trainer.bio}"</p>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
                  <Link href={`/trainer/${request.trainer.id}`} target="_blank" className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
                    View Profile
                  </Link>
                  <form action={handleTrainerVerificationAction} className="flex-1 md:flex-none">
                    <input type="hidden" name="gymSlug" value={gymSlug} />
                    <input type="hidden" name="requestId" value={request.id} />
                    <input type="hidden" name="action" value="reject" />
                    <button type="submit" className="w-full py-2 px-4 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 font-bold transition-all text-sm ring-1 ring-red-500/20">
                      Reject
                    </button>
                  </form>
                  <form action={handleTrainerVerificationAction} className="flex-1 md:flex-none">
                    <input type="hidden" name="gymSlug" value={gymSlug} />
                    <input type="hidden" name="requestId" value={request.id} />
                    <input type="hidden" name="action" value="approve" />
                    <button type="submit" className="w-full py-2 px-4 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 font-bold transition-all text-sm ring-1 ring-emerald-500/20">
                      Verify Trainer
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Verified Trainers */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 relative overflow-hidden">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <CheckCircle className="text-emerald-500" size={20} />
          Verified Trainers
        </h2>
        
        {gym.verifiedTrainers.length === 0 ? (
          <div className="text-center py-8 bg-white/5 rounded-xl border border-white/5">
            <p className="text-gray-400">You haven't verified any trainers yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {gym.verifiedTrainers.map(trainer => (
              <div key={trainer.id} className="bg-white/[0.02] border border-white/10 rounded-xl p-5 flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center font-bold text-white">
                    {trainer.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{trainer.name}</h3>
                    <p className="text-[10px] text-gray-500">{trainer.specialization}</p>
                  </div>
                </div>
                <Link href={`/trainer/${trainer.id}`} target="_blank" className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100">
                  <User size={16} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
