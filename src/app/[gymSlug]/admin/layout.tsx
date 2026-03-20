import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Activity, LayoutDashboard, CreditCard, Users, Megaphone, QrCode, Phone, User } from "lucide-react";

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
    select: { name: true }
  });

  if (!gym) {
    redirect("/admin");
  }

  const navItems = [
    { label: "Overview", href: `/${gymSlug}/admin`, icon: LayoutDashboard },
    { label: "Join Requests", href: `/${gymSlug}/admin/requests`, icon: Users },
    { label: "QR Terminal", href: `/${gymSlug}/admin/qr`, icon: QrCode },
    { label: "Plans", href: `/${gymSlug}/admin/plans`, icon: CreditCard },
    { label: "Members", href: `/${gymSlug}/admin/members`, icon: Users },
    { label: "Announcements", href: `/${gymSlug}/admin/announcements`, icon: Megaphone },
    { label: "Attendance", href: `/${gymSlug}/admin/attendance`, icon: QrCode },
    { label: "Trainers", href: `/${gymSlug}/admin/trainers`, icon: User },
    { label: "Contact Info", href: `/${gymSlug}/admin/contact`, icon: Phone },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/[0.06] bg-black/40 backdrop-blur-md flex flex-col fixed top-20 bottom-0 left-0 z-40">
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
        <nav className="flex-1 px-3 py-4 space-y-1">
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
        <div className="px-4 py-4 border-t border-white/[0.06] flex items-center justify-between">
          <Link href="/admin" className="text-xs text-gray-500 hover:text-white transition-colors">
            ← Back to Platform
          </Link>
          <UserButton appearance={{ elements: { userButtonAvatarBox: "w-8 h-8 ring-1 ring-white/10" } }} />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 px-8 py-8">
        {children}
      </main>
    </div>
  );
}
