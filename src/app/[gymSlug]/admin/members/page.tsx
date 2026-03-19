import { getGymMembers } from "../actions";
import { Users, Crown, Shield, User, UserCheck } from "lucide-react";

export default async function MembersPage(props: { params: Promise<{ gymSlug: string }> }) {
  const { gymSlug } = await props.params;
  const members = await getGymMembers(gymSlug);

  const roleIcons: Record<string, React.ReactNode> = {
    OWNER: <Crown size={14} className="text-amber-400" />,
    MANAGER: <Shield size={14} className="text-indigo-400" />,
    STAFF: <UserCheck size={14} className="text-emerald-400" />,
    MEMBER: <User size={14} className="text-gray-400" />,
  };

  const statusColors: Record<string, string> = {
    ACTIVE: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20",
    EXPIRED: "bg-red-500/10 text-red-400 ring-red-500/20",
    SUSPENDED: "bg-amber-500/10 text-amber-400 ring-amber-500/20",
    CANCELLED: "bg-gray-500/10 text-gray-400 ring-gray-500/20",
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Members</h1>
          <p className="text-gray-500 text-sm mt-1">{members.length} registered members</p>
        </div>
      </div>

      {/* Members Table */}
      {members.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-4 text-gray-600" />
          <p className="text-lg font-medium">No members yet</p>
          <p className="text-sm">Members will appear here when they join your gym.</p>
        </div>
      ) : (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Member</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id} className="border-b border-white/[0.03] hover:bg-white/[0.03] transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-semibold text-white">{member.user.name}</p>
                      <p className="text-xs text-gray-500">{member.user.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-gray-300">
                      {roleIcons[member.role]}
                      {member.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-gray-400">{member.plan?.name || "—"}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ring-1 ${statusColors[member.status] || statusColors.CANCELLED}`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    {new Date(member.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
