import { getGymDashboardData } from "./actions";
import { Building2, Users, CreditCard, QrCode, Megaphone } from "lucide-react";

export default async function GymAdminOverview(props: { params: Promise<{ gymSlug: string }> }) {
  const { gymSlug } = await props.params;
  const data = await getGymDashboardData(gymSlug);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">{data.gym.name}</h1>
        <p className="text-gray-500 text-sm mt-1">Dashboard overview for your gym</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users className="w-5 h-5" />} label="Members" value={data.memberCount.toString()} color="emerald" />
        <StatCard icon={<CreditCard className="w-5 h-5" />} label="Plans" value={data.planCount.toString()} color="indigo" />
        <StatCard icon={<QrCode className="w-5 h-5" />} label="Check-ins Today" value={data.todayAttendance.toString()} color="amber" />
        <StatCard icon={<Building2 className="w-5 h-5" />} label="Status" value={data.gym.isActive ? "Active" : "Inactive"} color="violet" />
      </div>

      {/* Recent Announcements */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Megaphone size={18} className="text-indigo-400" />
          Recent Announcements
        </h2>
        {data.announcements.length === 0 ? (
          <p className="text-gray-500 text-sm">No announcements yet. Post one from the Announcements page.</p>
        ) : (
          <div className="space-y-3">
            {data.announcements.map((a) => (
              <div key={a.id} className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl">
                <h3 className="text-sm font-semibold text-white">{a.title}</h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{a.content}</p>
                <p className="text-[11px] text-gray-600 mt-2">{new Date(a.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
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
    <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-xl bg-gradient-to-br ${cls} ring-1`}>{icon}</div>
      </div>
      <p className="text-3xl font-black text-white tracking-tight">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
}
