import { PrismaClient } from "@prisma/client";
import { BadgeCheck, Dumbbell, MapPin, Pickaxe, Search, User } from "lucide-react";
import Link from "next/link";

const prisma = new PrismaClient();

export default async function TrainersDirectoryPage() {
  const trainers = await prisma.trainer.findMany({
    where: { isVerified: true },
    include: { verifiedByGym: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[150px] -z-10 animate-pulse"></div>
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-teal-600/10 rounded-full blur-[120px] -z-10"></div>

      {/* Header */}
      <header className="px-6 py-8 md:py-12 max-w-6xl mx-auto w-full text-center relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium text-gray-400 mb-8 border border-white/10">
          ← Back to Gimmi
        </Link>
        <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)] ring-1 ring-white/20">
          <Dumbbell className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
          Find Your Perfect Trainer
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-10">
          Browse our directory of verified fitness professionals. Find specialists in powerlifting, crossfit, bodybuilding, and general fitness.
        </p>
        
        {/* Search/Filter Bar (Visual only for now) */}
        <div className="max-w-xl mx-auto relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none focus:border-transparent transition-all shadow-xl backdrop-blur-sm"
            placeholder="Search by name, specialization, or gym..."
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 pb-24 relative z-10">
        
        {trainers.length === 0 ? (
          <div className="text-center py-20 bg-white/[0.02] border border-white/[0.05] rounded-3xl">
            <User className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-300 mb-2">No Trainers Found</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              There are currently no verified trainers listed on the platform. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trainers.map(trainer => (
              <Link key={trainer.id} href={`/trainer/${trainer.id}`} className="group relative bg-white/[0.03] border border-white/[0.06] rounded-3xl p-6 transition-all duration-300 hover:bg-white/[0.05] hover:border-emerald-500/30 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] hover:-translate-y-1 overflow-hidden flex flex-col h-full">
                {/* Accent glow on hover */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/0 rounded-full blur-[40px] transition-colors duration-500 group-hover:bg-emerald-500/20 -z-10"></div>
                
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-xl font-black text-white shrink-0 shadow-lg shadow-emerald-500/20 ring-2 ring-white/10">
                    {trainer.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white truncate flex items-center gap-1.5">
                      {trainer.name}
                      <BadgeCheck size={16} className="text-emerald-400 shrink-0" />
                    </h3>
                    <p className="text-sm text-emerald-400 font-medium truncate">Professional Trainer</p>
                  </div>
                </div>
                
                <div className="space-y-3 mb-6 flex-1">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <MapPin size={14} className="text-gray-500" />
                    <span className="truncate">{trainer.gymName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Pickaxe size={14} className="text-amber-500/70" />
                    <span className="truncate">{trainer.specialization || "General Fitness"}</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-white/5 flex items-center justify-between text-sm">
                  {trainer.verifiedByGym ? (
                    <span className="text-gray-500 text-xs italic truncate max-w-[150px]">
                      Verified by <span className="font-semibold">{trainer.verifiedByGym.name}</span>
                    </span>
                  ) : (
                    <span className="text-gray-600 text-xs italic">Independent</span>
                  )}
                  <span className="font-bold text-white group-hover:text-emerald-400 transition-colors flex items-center gap-1">
                    View Profile →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
