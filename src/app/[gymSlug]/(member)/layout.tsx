import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Activity, LayoutDashboard, QrCode, History, Megaphone } from "lucide-react";

export default async function MemberLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ gymSlug: string }>;
}) {
  const { gymSlug } = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const navItems = [
    { label: "Home", href: `/${gymSlug}`, icon: LayoutDashboard },
    { label: "QR Pass", href: `/${gymSlug}/qr`, icon: QrCode },
    { label: "Visits", href: `/${gymSlug}/attendance`, icon: History },
    { label: "News", href: `/${gymSlug}/announcements`, icon: Megaphone },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0a] pb-24">
      {/* Top Header (Mobile App Style) */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/[0.06] px-5 py-4 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <Activity size={18} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight leading-tight capitalize">{gymSlug.replace(/-/g, ' ')}</h1>
            <p className="text-[11px] text-gray-400 font-medium">Member App</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/${gymSlug}/admin`} className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full ring-1 ring-emerald-500/20 hover:bg-emerald-500/20 transition-all hidden sm:block">
            Admin →
          </Link>
          <UserButton appearance={{ elements: { userButtonAvatarBox: "w-8 h-8 shadow-md ring-1 ring-emerald-500/20" } }} />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-lg mx-auto px-4 pt-6">
        {children}
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-2xl border-t border-white/[0.08] px-6 py-2 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 text-gray-500 hover:text-emerald-400 transition-colors group px-2 py-1"
            >
              <div className="p-1.5 rounded-xl group-hover:bg-emerald-500/10 transition-colors relative">
                <item.icon size={22} className="group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-[10px] font-bold tracking-wide">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
