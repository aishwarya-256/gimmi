import { getGymDashboardData, createAnnouncementAction, deleteAnnouncementAction } from "../actions";
import { Megaphone, Plus, Trash2 } from "lucide-react";
import { revalidatePath } from "next/cache";

export default async function AnnouncementsPage(props: { params: Promise<{ gymSlug: string }> }) {
  const { gymSlug } = await props.params;
  const data = await getGymDashboardData(gymSlug);

  async function handleCreate(formData: FormData) {
    "use server";
    await createAnnouncementAction(gymSlug, formData);
    revalidatePath(`/${gymSlug}/admin/announcements`);
  }

  async function handleDelete(formData: FormData) {
    "use server";
    const announcementId = formData.get("announcementId") as string;
    await deleteAnnouncementAction(gymSlug, announcementId);
    revalidatePath(`/${gymSlug}/admin/announcements`);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Announcements</h1>
        <p className="text-gray-500 text-sm mt-1">Post messages to your gym members</p>
      </div>

      {/* Create Announcement */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.12] transition-all duration-300">
        <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-500/10 ring-1 ring-indigo-500/20">
            <Plus size={16} className="text-indigo-400" />
          </div>
          New Announcement
        </h2>
        <form action={handleCreate} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400">Title</label>
            <input
              type="text"
              name="title"
              placeholder="e.g. New Year Special Offer!"
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-sm hover:bg-white/[0.07]"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400">Message</label>
            <textarea
              name="content"
              placeholder="Write your announcement here..."
              required
              rows={4}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-sm resize-none hover:bg-white/[0.07]"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-400 hover:to-violet-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/15 hover:scale-[1.02] active:scale-[0.98] text-sm"
          >
            Post Announcement
          </button>
        </form>
      </div>

      {/* Announcements List */}
      <div className="space-y-3">
        {data.announcements.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Megaphone className="w-12 h-12 mx-auto mb-4 text-gray-600" />
            <p className="text-lg font-medium">No announcements yet</p>
            <p className="text-sm">Post your first announcement above.</p>
          </div>
        ) : (
          data.announcements.map((a) => (
            <div key={a.id} className="flex items-start justify-between p-5 bg-white/[0.03] border border-white/[0.06] rounded-2xl hover:bg-white/[0.05] transition-all duration-200 group">
              <div className="flex-1">
                <h3 className="text-base font-bold text-white">{a.title}</h3>
                <p className="text-sm text-gray-400 mt-1.5 leading-relaxed">{a.content}</p>
                <p className="text-[11px] text-gray-600 mt-3">{new Date(a.createdAt).toLocaleDateString()}</p>
              </div>
              <form action={handleDelete}>
                <input type="hidden" name="announcementId" value={a.id} />
                <button
                  type="submit"
                  className="p-2 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              </form>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
