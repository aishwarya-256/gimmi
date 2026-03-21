import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Activity, LayoutDashboard, CreditCard, Users, Megaphone, QrCode, Phone, User, UserX, ClipboardList } from "lucide-react";
import VerificationPortal from "./verification-portal";

export default async function GymAdminLayout({
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

  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  const gym = await prisma.gym.findUnique({
    where: { slug: gymSlug.toLowerCase() },
    // @ts-ignore - IDE Cache Lag
    select: { name: true, id: true, verificationStatus: true, verification: true }
  });

  if (!gym) {
    redirect("/admin");
  }

  // ==== TRUST AND SAFETY: GLOBAL VERIFICATION LOCKOUT ====
  // If the gym has not completed physical verification, aggressively intercept the layout 
  // and funnel the Gym Owner exactly into the Verification Portal UI.
  // @ts-ignore - IDE Cache Lag
  if (gym.verificationStatus !== "APPROVED") {
    return (
      <VerificationPortal 
        gymSlug={gymSlug}
        gymId={gym.id}
        gymName={gym.name}
        // @ts-ignore
        verificationStatus={gym.verificationStatus}
        // @ts-ignore
        verificationRecord={gym.verification}
      />
    );
  }

  const navItems = [
    { label: "Overview", href: `/${gymSlug}/admin`, icon: LayoutDashboard },
    { label: "Join Requests", href: `/${gymSlug}/admin/requests`, icon: Users },
    { label: "Plans", href: `/${gymSlug}/admin/plans`, icon: CreditCard },
    { label: "Members", href: `/${gymSlug}/admin/members`, icon: Users },
    { label: "Inactive", href: `/${gymSlug}/admin/inactive`, icon: UserX },
    { label: "LogBook", href: `/${gymSlug}/admin/check-ins`, icon: ClipboardList },
    { label: "Announcements", href: `/${gymSlug}/admin/announcements`, icon: Megaphone },
    { label: "Live QR", href: `/${gymSlug}/admin/attendance`, icon: QrCode },
    { label: "Trainers", href: `/${gymSlug}/admin/trainers`, icon: User },
    { label: "Contact Info", href: `/${gymSlug}/admin/contact`, icon: Phone },
  ];

  return (
    <div className="flex min-h-screen lg:pb-0 pb-20 pt-16 lg:pt-0">
      
      {/* Mobile Header (hidden on desktop) */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-xl border-b border-white/[0.06] z-50 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Activity size={14} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-sm font-bold text-white truncate max-w-[120px]">{gym.name}</p>
            <p className="text-[10px] text-gray-500">Gym Admin</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-xs font-semibold text-gray-400 hover:text-white transition-colors bg-white/5 px-2 py-1 rounded-md">
            Exit
          </Link>
          <UserButton appearance={{ elements: { userButtonAvatarBox: "w-8 h-8 ring-1 ring-white/10" } }} />
        </div>
      </header>

      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden lg:flex w-64 border-r border-white/[0.06] bg-black/40 backdrop-blur-md flex-col fixed top-0 bottom-0 left-0 z-40">
        {/* Gym Brand */}
        <div className="px-6 py-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Activity size={16} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-sm font-bold text-white truncate max-w-[120px]">{gym.name}</p>
              <p className="text-[11px] text-gray-500">Gym Admin</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/[0.06] transition-all duration-200 group"
            >
              <item.icon size={18} className="text-gray-500 group-hover:text-indigo-400 transition-colors" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Back Link */}
        <div className="px-4 py-4 border-t border-white/[0.06] flex items-center justify-between mt-auto">
          <Link href="/admin" className="text-xs text-gray-500 hover:text-white transition-colors">
            ← Back to Platform
          </Link>
          <UserButton appearance={{ elements: { userButtonAvatarBox: "w-8 h-8 ring-1 ring-white/10" } }} />
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-2xl border-t border-white/[0.08] px-2 py-3 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.5)] overflow-x-auto hide-scrollbar flex items-center gap-2 sm:gap-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center justify-center min-w-[70px] px-2 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 active:bg-white/10 transition-colors shrink-0 group"
          >
            <item.icon size={20} className="mb-1.5 group-hover:scale-110 transition-transform text-gray-500 group-hover:text-indigo-400" />
            <span className="text-[10px] font-semibold">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 w-full max-w-full overflow-x-hidden p-4 sm:p-8">
        {children}
      </main>
    </div>
  );
}
