import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { Activity, ArrowRight, MapPin, Search } from "lucide-react";

const prisma = new PrismaClient();

export default async function CustomerPanel() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Fetch all active memberships for this user
  const memberships = await prisma.gymMember.findMany({
    where: { 
      userId,
      status: "ACTIVE" 
    },
    include: { gym: true },
    orderBy: { createdAt: "desc" }
  });

  // Fetch ALL gyms on the platform to show in "Discover"
  const allGyms = await prisma.gym.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    take: 10
  });

  const memberGymIds = new Set(memberships.map(m => m.gymId));
  const discoverGyms = allGyms.filter(g => !memberGymIds.has(g.id));

  return (
    <div className="flex-1 w-full pb-24 text-white">

      {/* Main Content Area */}
      <main className="w-full max-w-lg mx-auto px-5 pt-10 space-y-12">
        
        {/* Page Title */}
        <div className="mb-2">
          <h1 className="text-3xl font-black tracking-tight">My Gyms</h1>
          <p className="text-sm text-gray-500 font-medium tracking-wide mt-1">Gimmi Customer Portal</p>
        </div>

        {/* Active Memberships Section */}
        <section>
          <h2 className="text-xs font-bold text-gray-400 mb-4 px-1 uppercase tracking-widest">Active Subscriptions</h2>
          
          {memberships.length === 0 ? (
            <div className="text-center py-10 bg-white/[0.02] border border-white/[0.05] rounded-3xl">
              <Activity className="w-10 h-10 mx-auto mb-3 text-gray-600" />
              <p className="font-bold text-gray-300">No Memberships Yet</p>
              <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                Explore gyms below and grab a membership to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {memberships.map((membership) => (
                <Link 
                  key={membership.id} 
                  href={`/${membership.gym.slug}`}
                  className="block p-5 rounded-3xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.08] hover:border-emerald-500/30 transition-all duration-300 group relative overflow-hidden shadow-lg"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/5 group-hover:to-transparent transition-all duration-500"></div>
                  
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-300">
                        <Activity size={20} strokeWidth={2.5} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors capitalize">{membership.gym.name}</h3>
                        <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1.5 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                          Active Membership
                        </p>
                      </div>
                    </div>
                    
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-emerald-500/20 group-hover:text-emerald-400 transition-all text-gray-500">
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Discover Gyms Section */}
        <section>
          <h2 className="text-xs font-bold text-gray-400 mb-4 px-1 uppercase tracking-widest flex items-center gap-2">
            <Search size={14} className="text-gray-500" />
            Discover Gyms
          </h2>

          {discoverGyms.length === 0 ? (
            <p className="text-sm text-gray-500 px-1 py-4">No new gyms available on the platform right now.</p>
          ) : (
            <div className="space-y-3">
              {discoverGyms.map(gym => (
                <Link 
                  key={gym.id} 
                  href={`/${gym.slug}/join`}
                  className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-500 group-hover:text-white transition-colors">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <h3 className="text-white font-bold capitalize">{gym.name}</h3>
                      <p className="text-[11px] text-gray-500 mt-0.5">gimmi.app/{gym.slug}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-white bg-white/10 px-3 py-1.5 rounded-lg group-hover:bg-white/20 transition-all">
                    View Plans
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Quick Actions */}
        <div className="pt-2 border-t border-white/[0.06]">
          <Link href="/admin" className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-indigo-500/10 text-indigo-400 text-sm font-semibold hover:bg-indigo-500/20 transition-all ring-1 ring-indigo-500/20">
            Switch to Gym Owner Panel
          </Link>
        </div>

      </main>
    </div>
  );
}
