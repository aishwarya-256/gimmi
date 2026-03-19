import { getMemberDashboard } from "../actions";
import { Megaphone } from "lucide-react";

export default async function MemberAnnouncementsPage(props: { params: Promise<{ gymSlug: string }> }) {
  const { gymSlug } = await props.params;
  const data = await getMemberDashboard(gymSlug);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Announcements</h1>
        <p className="text-gray-500 text-sm mt-1">Latest updates from your gym</p>
      </div>

      {data.announcements.length === 0 ? (
        <div className="text-center py-20 bg-white/[0.03] border border-white/[0.06] rounded-2xl">
          <Megaphone className="w-12 h-12 mx-auto mb-4 text-gray-600" />
          <p className="text-lg font-medium text-gray-400">No announcements yet</p>
          <p className="text-sm text-gray-600 mt-2">Your gym hasn&apos;t posted anything. Check back later!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.announcements.map((a) => (
            <div key={a.id} className="p-6 bg-white/[0.03] border border-white/[0.06] rounded-2xl hover:bg-white/[0.05] transition-all duration-300">
              <h3 className="text-lg font-bold text-white">{a.title}</h3>
              <p className="text-sm text-gray-400 mt-2 leading-relaxed">{a.content}</p>
              <p className="text-[11px] text-gray-600 mt-4">{new Date(a.createdAt).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
