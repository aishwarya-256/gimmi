import { getTrainerDashboardData, handleInteractionRequestAction } from "../actions";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Copy, ShieldCheck, ShieldAlert, BadgeCheck, XCircle, CheckCircle } from "lucide-react";

export default async function TrainerDashboardPage() {
  const trainer = await getTrainerDashboardData();

  const pendingRequests = trainer.interactionRequests.filter(r => r.status === "PENDING");
  const approvedRequests = trainer.interactionRequests.filter(r => r.status === "APPROVED");

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col relative overflow-hidden pb-32">
      {/* Header */}
      <header className="px-6 py-6 max-w-5xl mx-auto w-full flex items-center justify-between z-10 border-b border-white/[0.06]">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center font-bold text-white shadow-lg shadow-emerald-500/20 ring-2 ring-white/10">
            {trainer.name.charAt(0)}
          </div>
          <div>
            <h1 className="font-bold tracking-tight text-white mb-0.5">{trainer.name}</h1>
            <p className="text-[11px] text-gray-500 uppercase tracking-widest font-semibold">Trainer</p>
          </div>
        </div>
        <UserButton appearance={{ elements: { userButtonAvatarBox: "w-10 h-10 ring-2 ring-white/10" } }} />
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-10 space-y-10">
        
        {/* Verification Status Banner */}
        {trainer.isVerified ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 flex items-center gap-4">
            <div className="p-3 bg-emerald-500/20 rounded-full">
              <BadgeCheck className="text-emerald-400 w-6 h-6" />
            </div>
            <div>
              <h2 className="text-emerald-400 font-bold mb-0.5">Verified Trainer</h2>
              <p className="text-sm text-emerald-500/70">Officially verified by {trainer.verifiedByGym?.name}. This badge appears on your public profile.</p>
            </div>
          </div>
        ) : trainer.verificationRequests.some(r => r.status === "PENDING") ? (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 flex items-center gap-4">
            <div className="p-3 bg-amber-500/20 rounded-full">
              <ShieldAlert className="text-amber-400 w-6 h-6" />
            </div>
            <div>
              <h2 className="text-amber-400 font-bold mb-0.5">Verification Pending</h2>
              <p className="text-sm text-amber-500/70">Your verification request is awaiting admin approval from {trainer.verificationRequests.find(r => r.status === "PENDING")?.gym?.name}.</p>
            </div>
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/5 rounded-full ring-1 ring-white/10">
                <ShieldCheck className="text-gray-400 w-6 h-6" />
              </div>
              <div>
                <h2 className="text-gray-300 font-bold mb-0.5">Unverified Profile</h2>
                <p className="text-sm text-gray-500">You are listed as an independent trainer.</p>
              </div>
            </div>
          </div>
        )}

        {/* Profile Card & Link */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -z-10 group-hover:bg-emerald-500/20 transition-colors duration-700"></div>
          
          <h2 className="text-xl font-bold text-white mb-6">Your Profile</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div>
              <p className="text-[11px] text-gray-500 uppercase tracking-widest font-bold mb-1">Gym Affiliation</p>
              <p className="font-semibold text-gray-300">{trainer.gymName}</p>
            </div>
            <div>
              <p className="text-[11px] text-gray-500 uppercase tracking-widest font-bold mb-1">Specialization</p>
              <p className="font-semibold text-gray-300">{trainer.specialization || "None listed"}</p>
            </div>
            <div>
              <p className="text-[11px] text-gray-500 uppercase tracking-widest font-bold mb-1">Public Link</p>
              <div className="flex items-center gap-2">
                <Link href={`/trainer/${trainer.id}`} className="text-emerald-400 hover:text-emerald-300 font-medium truncate">
                  gimmi.app/trainer/{trainer.id.slice(0, 8)}...
                </Link>
                <button className="p-1.5 text-gray-500 hover:text-white transition-colors" title="Copy public link">
                  <Copy size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Interaction Requests */}
        <div>
          <h2 className="text-xl font-bold text-white mb-6">Contact Requests</h2>
          
          {pendingRequests.length === 0 && approvedRequests.length === 0 ? (
            <div className="text-center py-12 bg-white/5 border border-white/10 rounded-2xl">
              <p className="text-gray-400">No client contact requests yet.</p>
              <p className="text-sm text-gray-500 mt-2">Share your public link to start receiving requests.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map(request => (
                <div key={request.id} className="bg-white/[0.03] border border-emerald-500/30 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/50"></div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                      <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">New Request</p>
                    </div>
                    <h3 className="font-bold text-white text-lg">{request.user.name}</h3>
                    <p className="text-sm text-gray-400">Wants to see your contact info to train with you.</p>
                  </div>
                  
                  <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                    <form action={handleInteractionRequestAction} className="flex-1 sm:flex-none">
                      <input type="hidden" name="requestId" value={request.id} />
                      <input type="hidden" name="action" value="reject" />
                      <button type="submit" className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 font-bold transition-all text-sm">
                        <XCircle size={16} /> Decline
                      </button>
                    </form>
                    <form action={handleInteractionRequestAction} className="flex-1 sm:flex-none">
                      <input type="hidden" name="requestId" value={request.id} />
                      <input type="hidden" name="action" value="approve" />
                      <button type="submit" className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 font-bold transition-all text-sm ring-1 ring-emerald-500/20">
                        <CheckCircle size={16} /> Accept
                      </button>
                    </form>
                  </div>
                </div>
              ))}

              {approvedRequests.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Approved Clients</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {approvedRequests.map(request => (
                      <div key={request.id} className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-gray-200">{request.user.name}</p>
                          <p className="text-[11px] text-gray-500 mt-0.5">Can view your phone & email</p>
                        </div>
                        <CheckCircle size={16} className="text-emerald-500/50" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
