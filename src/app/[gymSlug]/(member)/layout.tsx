import { auth } from "@clerk/nextjs/server";
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
    { label: "Dashboard", href: `/${gymSlug}`, icon: LayoutDashboard },
    { label: "QR Pass", href: `/${gymSlug}/qr`, icon: QrCode },
    { label: "My Attendance", href: `/${gymSlug}/attendance`, icon: History },
    { label: "Announcements", href: `/${gymSlug}/announcements`, icon: Megaphone },
  ];

  return (
    <div className="flex min-h-screen">

      {/* Sidebar */}
      <aside className="w-64 border-r border-white/[0.06] bg-black/40 backdrop-blur-md flex flex-col fixed top-20 bottom-0 left-0 z-40">
        <div className="px-6 py-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Activity size={16} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-sm font-bold text-white truncate">{gymSlug}</p>
              <p className="text-[11px] text-gray-500">Member Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/[0.06] transition-all duration-200 group"
            >
              <item.icon size={18} className="text-gray-500 group-hover:text-emerald-400 transition-colors" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-white/[0.06]">
          <Link href={`/${gymSlug}/admin`} className="text-xs text-gray-600 hover:text-white transition-colors">
            Admin Panel →
          </Link>
        </div>
      </aside>

      <main className="flex-1 ml-64 px-8 py-8">
        {children}
      </main>
    </div>
  );
}
