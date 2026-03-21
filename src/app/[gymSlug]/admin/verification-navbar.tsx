import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function NavBar({ gymName, gymSlug }: { gymName: string, gymSlug: string }) {
  return (
    <nav className="w-full flex items-center justify-between px-6 py-4 bg-black/80 backdrop-blur-2xl border-b border-white/[0.06] sticky top-0 z-50 shadow-2xl">
      <div className="flex items-center gap-4">
        <Link href="/admin" className="text-gray-400 hover:text-white transition-colors p-2.5 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10"><ArrowLeft size={18} /></Link>
        <div className="hidden sm:block">
          <h2 className="text-sm font-bold text-white tracking-widest uppercase">{gymName}</h2>
          <p className="text-[10px] text-indigo-400 font-bold tracking-widest uppercase flex items-center gap-1"><ShieldCheck size={10} /> Secure Onboarding Portal</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-xs text-gray-500 hidden sm:block">Need help? support@gimmi.app</span>
        <UserButton appearance={{ elements: { userButtonAvatarBox: "w-9 h-9 shadow-xl ring-2 ring-indigo-500/30" } }} />
      </div>
    </nav>
  );
}
