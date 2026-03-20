import { getAttendanceHistory } from "../actions";
import { History, CheckCircle, XCircle, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function MemberAttendancePage(props: { params: Promise<{ gymSlug: string }> }) {
  const { gymSlug } = await props.params;
  const attendance = await getAttendanceHistory(gymSlug);

  const statusConfig: Record<string, { icon: React.ReactNode; color: string }> = {
    SUCCESS: { icon: <CheckCircle size={14} />, color: "text-emerald-400 bg-emerald-500/10 ring-emerald-500/20" },
    DENIED_EXPIRED: { icon: <XCircle size={14} />, color: "text-red-400 bg-red-500/10 ring-red-500/20" },
    DENIED_COOLDOWN: { icon: <Clock size={14} />, color: "text-amber-400 bg-amber-500/10 ring-amber-500/20" },
    DENIED_INVALID: { icon: <XCircle size={14} />, color: "text-red-400 bg-red-500/10 ring-red-500/20" },
  };

  return (
    <div className="space-y-6">
      <div className="w-full flex justify-start">
        <Link href={`/${gymSlug}`} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-xs font-medium text-gray-400 border border-white/10">
          <ArrowLeft size={14} /> Back
        </Link>
      </div>
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">My Attendance</h1>
        <p className="text-gray-500 text-sm mt-1">{attendance.length} check-ins recorded</p>
      </div>

      {attendance.length === 0 ? (
        <div className="text-center py-20 bg-white/[0.03] border border-white/[0.06] rounded-2xl">
          <History className="w-12 h-12 mx-auto mb-4 text-gray-600" />
          <p className="text-lg font-medium text-gray-400">No check-ins yet</p>
          <p className="text-sm text-gray-600 mt-2">Show your QR pass at the gym to get your first check-in!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {attendance.map((record) => {
            const config = statusConfig[record.status] || statusConfig.DENIED_INVALID;
            return (
              <div key={record.id} className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/[0.06] rounded-xl hover:bg-white/[0.05] transition-all">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ring-1 ${config.color}`}>
                    {config.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {new Date(record.entryTime).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(record.entryTime).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <span className={`text-[11px] font-semibold px-3 py-1 rounded-full ring-1 ${config.color}`}>
                  {record.status.replace("_", " ")}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
