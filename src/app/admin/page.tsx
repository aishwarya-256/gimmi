import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { Building2, Plus, ArrowRight, Zap, Users, BarChart3, ShieldCheck, Trash2 } from "lucide-react";
import { createGymAction, deleteGymAction } from "./actions";
import { PrismaClient } from "@prisma/client";
import Link from "next/link";

const prisma = new PrismaClient();

export default async function PlatformAdminDashboard() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Fetch gyms where the current user is an OWNER or MANAGER
  const memberships = await prisma.gymMember.findMany({
    where: { userId, role: { in: ["OWNER", "MANAGER"] } },
    include: { gym: true }
  });

  const myGyms = memberships.map(m => m.gym);

  return (
    <div className="flex flex-col items-center min-h-screen relative overflow-hidden pb-24">

      {/* Ambient Background Orbs */}
      <div className="absolute top-10 left-1/3 w-[600px] h-[400px] bg-indigo-600/15 rounded-full blur-[150px] -z-10 animate-pulse"></div>
      <div className="absolute bottom-20 right-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[130px] -z-10"></div>
      <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] bg-fuchsia-600/8 rounded-full blur-[100px] -z-10"></div>

      {/* Header Section */}
      <div className="w-full max-w-6xl px-6 pt-16 pb-8 flex items-center justify-between">
        <div className="flex items-center gap-4 mb-2">
          <div className="h-12 w-12 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/25">
            <Building2 size={24} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight">Platform Admin</h1>
            <p className="text-gray-400 text-sm mt-1">Manage your gym effortlessly</p>
          </div>
        </div>
        <UserButton appearance={{ elements: { userButtonAvatarBox: "w-10 h-10 shadow-xl ring-2 ring-white/10" } }} />
      </div>

      {/* Quick Stats Grid */}
      <div className="w-full max-w-6xl px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard icon={<Building2 className="w-5 h-5" />} label="Your Gyms" value={myGyms.length.toString()} color="indigo" />
        <StatCard icon={<Users className="w-5 h-5" />} label="Total Members" value="--" color="emerald" />
        <StatCard icon={<BarChart3 className="w-5 h-5" />} label="Check-ins Today" value="--" color="amber" />
        <StatCard icon={<ShieldCheck className="w-5 h-5" />} label="Platform Health" value="100%" color="violet" />
      </div>

      <div className="w-full max-w-6xl px-6 grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Left Column (Gyms List + Create Form) */}
        <div className="lg:col-span-3 space-y-6">

          {/* My Gyms List */}
          <div className="bg-white/[0.03] backdrop-blur-sm rounded-3xl border border-white/[0.08] p-8 relative overflow-hidden">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Building2 size={20} className="text-indigo-400" />
              Your Gyms
            </h2>
            
            {myGyms.length === 0 ? (
              <div className="text-center py-8 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-gray-400 text-sm">You haven&apos;t created any gyms yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myGyms.map(gym => (
                  <div key={gym.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 rounded-2xl transition-all group">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-bold text-lg truncate">{gym.name}</h3>
                      <p className="text-gray-500 text-sm font-mono mt-1 truncate">gimmi.app/{gym.slug}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Link 
                        href={`/${gym.slug}/admin`}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 rounded-xl font-semibold transition-all text-sm ring-1 ring-indigo-500/20 flex-1 sm:flex-none"
                      >
                        Dashboard
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </Link>
                      
                      <form action={deleteGymAction}>
                        <input type="hidden" name="gymId" value={gym.id} />
                        <button 
                          type="submit"
                          className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl transition-all ring-1 ring-red-500/20"
                          title="Delete Gym"
                        >
                          <Trash2 size={16} />
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Create Gym Card */}
          <div className="bg-white/[0.03] backdrop-blur-sm rounded-3xl border border-white/[0.08] p-8 relative overflow-hidden group hover:border-white/[0.15] transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            
            <div className="relative z-10">
              <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-500/10 ring-1 ring-indigo-500/20">
                  <Plus size={18} className="text-indigo-400" />
                </div>
                Onboard a New Gym
              </h2>
              <p className="text-gray-500 text-sm mb-8">Register another gym on the Gimmi platform</p>
              
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

        </div>

        {/* Quick Actions Panel — Takes 2 columns */}
        <div className="lg:col-span-2 space-y-4">
          <ActionCard 
            icon={<Zap className="w-5 h-5 text-amber-400" />}
            title="Quick Setup Guide"
            desc="Create your first gym, add plans, and invite members in under 5 minutes."
            href="/admin/guide"
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

function ActionCard({ icon, title, desc, href }: { icon: React.ReactNode; title: string; desc: string; href?: string }) {
  const content = (
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

  return href ? <Link href={href} className="block">{content}</Link> : content;
}
