import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Building2, Plus, ArrowRight, Zap, Users, BarChart3, ShieldCheck } from "lucide-react";
import { createGymAction } from "./actions";

export default async function PlatformAdminDashboard() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="flex flex-col items-center min-h-screen relative overflow-hidden">

      {/* Ambient Background Orbs */}
      <div className="absolute top-10 left-1/3 w-[600px] h-[400px] bg-indigo-600/15 rounded-full blur-[150px] -z-10 animate-pulse"></div>
      <div className="absolute bottom-20 right-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[130px] -z-10"></div>
      <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] bg-fuchsia-600/8 rounded-full blur-[100px] -z-10"></div>

      {/* Header Section */}
      <div className="w-full max-w-6xl px-6 pt-16 pb-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="h-12 w-12 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/25">
            <Building2 size={24} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight">Platform Admin</h1>
            <p className="text-gray-400 text-sm mt-1">Manage your gym effortlessly</p>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="w-full max-w-6xl px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard icon={<Building2 className="w-5 h-5" />} label="Active Gyms" value="0" color="indigo" />
        <StatCard icon={<Users className="w-5 h-5" />} label="Total Members" value="0" color="emerald" />
        <StatCard icon={<BarChart3 className="w-5 h-5" />} label="Check-ins Today" value="0" color="amber" />
        <StatCard icon={<ShieldCheck className="w-5 h-5" />} label="Platform Health" value="100%" color="violet" />
      </div>

      {/* Main Content Grid */}
      <div className="w-full max-w-6xl px-6 grid grid-cols-1 lg:grid-cols-5 gap-6 pb-16">

        {/* Create Gym Card — Takes 3 columns */}
        <div className="lg:col-span-3 bg-white/[0.03] backdrop-blur-sm rounded-3xl border border-white/[0.08] p-8 relative overflow-hidden group hover:border-white/[0.15] transition-all duration-500">
          {/* Subtle glow on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          
          <div className="relative z-10">
            <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-500/10 ring-1 ring-indigo-500/20">
                <Plus size={18} className="text-indigo-400" />
              </div>
              Onboard a New Gym
            </h2>
            <p className="text-gray-500 text-sm mb-8">Register a new gym on the Gimmi platform</p>
            
            <form action={createGymAction} className="space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="name" className="text-sm font-semibold text-gray-300">Gym Name</label>
                <input 
                  type="text" 
                  name="name" 
                  id="name"
                  placeholder="e.g. Iron Forge Elite"
                  required 
                  className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:border-transparent transition-all hover:bg-white/[0.07]"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="slug" className="text-sm font-semibold text-gray-300">Your Gym&apos;s Web Address</label>
                <p className="text-xs text-gray-500">Choose a short, unique name — this will be your gym&apos;s link on Gimmi</p>
                <div className="flex bg-white/5 border border-white/10 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 transition-all hover:bg-white/[0.07]">
                  <span className="px-4 py-3.5 bg-white/5 text-gray-500 border-r border-white/10 text-sm flex items-center font-mono">
                    gimmi.app/
                  </span>
                  <input 
                    type="text" 
                    name="slug" 
                    id="slug"
                    placeholder="iron-forge"
                    required 
                    className="w-full px-4 py-3.5 bg-transparent focus:outline-none text-white placeholder-gray-600 font-mono"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-400 hover:to-violet-400 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98] group/btn"
              >
                Create
                <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </form>
          </div>
        </div>

        {/* Quick Actions Panel — Takes 2 columns */}
        <div className="lg:col-span-2 space-y-4">
          <ActionCard 
            icon={<Zap className="w-5 h-5 text-amber-400" />}
            title="Quick Setup Guide"
            desc="Create your first gym, add plans, and invite members in under 5 minutes."
          />
          <ActionCard 
            icon={<Users className="w-5 h-5 text-emerald-400" />}
            title="Member Management"
            desc="View, approve, and manage all member subscriptions across your gyms."
          />
          <ActionCard 
            icon={<ShieldCheck className="w-5 h-5 text-indigo-400" />}
            title="Security & Moderation"
            desc="Monitor abuse reports, moderate content, and manage platform-level controls."
          />
        </div>

      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  const colorMap: Record<string, string> = {
    indigo: "from-indigo-500/20 to-indigo-500/5 ring-indigo-500/20 text-indigo-400",
    emerald: "from-emerald-500/20 to-emerald-500/5 ring-emerald-500/20 text-emerald-400",
    amber: "from-amber-500/20 to-amber-500/5 ring-amber-500/20 text-amber-400",
    violet: "from-violet-500/20 to-violet-500/5 ring-violet-500/20 text-violet-400",
  };
  const cls = colorMap[color] || colorMap.indigo;

  return (
    <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-all duration-300 hover:-translate-y-1 group">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-xl bg-gradient-to-br ${cls} ring-1`}>{icon}</div>
      </div>
      <p className="text-3xl font-black text-white tracking-tight">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
}

function ActionCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-all duration-300 group cursor-pointer hover:border-white/[0.12] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="relative z-10 flex items-start gap-4">
        <div className="p-2.5 rounded-xl bg-white/5 ring-1 ring-white/10 group-hover:scale-110 transition-transform duration-300">{icon}</div>
        <div>
          <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
            {title}
            <ArrowRight size={14} className="text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
        </div>
      </div>
    </div>
  );
}
