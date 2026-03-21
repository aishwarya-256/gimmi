import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Activity, Users, Settings } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

const prisma = new PrismaClient();

export default async function PlatformAdminLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { platformRole: true }
  });

  if (user?.platformRole !== "SUPER_ADMIN") {
    // Aggressively bounce unauthorized users back to their customer view
    redirect("/customer");
  }

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white overflow-hidden">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-black/50 border-r border-white/10 flex flex-col relative z-20">
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
            <ShieldCheck size={18} />
          </div>
          <span className="font-black tracking-widest text-sm uppercase">Trust & Safety</span>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
          <Link href="/platform-admin" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors text-sm font-bold">
            <Activity size={18} /> Platform Health
          </Link>
          <Link href="/platform-admin/verifications" className="flex items-center gap-3 px-4 py-3 rounded-xl text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 text-sm font-bold shadow-[0_0_15px_rgba(99,102,241,0.1)]">
            <ShieldCheck size={18} /> Verification Queue
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors text-sm font-bold opacity-50 cursor-not-allowed">
            <Users size={18} /> Identity Audits
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors text-sm font-bold opacity-50 cursor-not-allowed">
            <Settings size={18} /> Moderation Settings
          </Link>
        </nav>

        <div className="p-4 border-t border-white/10 flex items-center gap-3">
          <UserButton appearance={{ elements: { userButtonAvatarBox: "w-10 h-10 ring-2 ring-indigo-500/50" } }} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate">Super Admin</p>
            <p className="text-[10px] text-gray-500 tracking-wider">Level 4 Clearance</p>
          </div>
        </div>
      </aside>

      {/* Main Sandbox */}
      <main className="flex-1 relative overflow-y-auto w-full h-full flex flex-col">
        {/* Top Header */}
        <header className="h-16 border-b border-white/10 flex items-center px-8 bg-black/20 backdrop-blur-md sticky top-0 z-10 shrink-0">
          <span className="text-xs font-mono text-indigo-400">SECURE TERMINAL: ACTIVE</span>
        </header>

        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[150px] -z-10 pointer-events-none"></div>

        <div className="p-8 w-full max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
