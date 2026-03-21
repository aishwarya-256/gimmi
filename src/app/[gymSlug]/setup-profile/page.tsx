import { ShieldCheck, UserCircle } from "lucide-react";
import { submitRealName } from "./actions";

export default async function SetupProfilePage(props: { params: Promise<{ gymSlug: string }> }) {
  const { gymSlug } = await props.params;

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 bg-gradient-to-t from-emerald-900/40 to-transparent relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[150px] -z-10"></div>
      
      <div className="w-full max-w-sm bg-white/5 border border-white/10 p-8 rounded-[2rem] shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-8 duration-700 relative">
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-[#0a0a0a] border-4 border-[#0a0a0a] rounded-full flex items-center justify-center ring-1 ring-white/10 shadow-xl shadow-emerald-500/10">
          <UserCircle size={40} className="text-emerald-400" />
        </div>

        <div className="mt-10 text-center space-y-2">
          <h1 className="text-2xl font-black text-white tracking-tight">Real Name Required</h1>
          <p className="text-gray-400 text-sm">
            For security and attendance tracking, this gym requires your true full name.
          </p>
        </div>

        <form action={async (fd) => {
          "use server";
          await submitRealName(gymSlug, fd);
        }} className="mt-8 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Full Legal Name</label>
            <input 
              name="fullName"
              type="text" 
              required
              minLength={2}
              placeholder="e.g. John Doe"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium"
            />
          </div>

          <button type="submit" className="w-full py-3.5 rounded-xl bg-emerald-500 text-black font-black uppercase tracking-widest text-sm hover:bg-emerald-400 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2">
            <ShieldCheck size={18} /> Complete Setup
          </button>
        </form>
      </div>
    </div>
  );
}
