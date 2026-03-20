import { getJoinRequests, handleJoinRequestAction } from "../actions";
import { User, Check, X, Clock, Mail } from "lucide-react";

export default async function JoinRequestsPage(props: { params: Promise<{ gymSlug: string }> }) {
  const { gymSlug } = await props.params;
  const requests = await getJoinRequests(gymSlug);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Join Requests</h1>
        <p className="text-gray-500 text-sm mt-1">Review and manage users who want to join your gym community</p>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-20 bg-white/[0.02] border border-white/[0.05] rounded-[2.5rem] backdrop-blur-sm">
          <Clock className="w-12 h-12 mx-auto mb-4 text-gray-700" />
          <h3 className="text-xl font-bold text-gray-400">No Pending Requests</h3>
          <p className="text-gray-600 mt-2 max-w-xs mx-auto">When customers request to join your gym, they will appear here for your approval.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {requests.map((request: any) => (
            <div key={request.id} className="group relative bg-white/[0.03] border border-white/[0.08] rounded-3xl p-6 hover:bg-white/[0.05] transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xl shadow-inner">
                  {request.user.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">{request.user.name}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Mail size={12} />
                      {request.user.email}
                    </div>
                    <span className="w-1 h-1 rounded-full bg-gray-700"></span>
                    <span className="text-[10px] text-gray-600 uppercase font-bold tracking-widest">
                      Requested {new Date(request.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <form action={async () => {
                  "use server";
                  await handleJoinRequestAction(request.id, "REJECT");
                }}>
                  <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all font-bold text-sm">
                    <X size={16} /> Reject
                  </button>
                </form>
                
                <form action={async () => {
                  "use server";
                  await handleJoinRequestAction(request.id, "ACCEPT");
                }}>
                  <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-black border border-emerald-400/50 hover:bg-emerald-400 transition-all font-bold text-sm shadow-lg shadow-emerald-500/20">
                    <Check size={16} /> Accept
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
