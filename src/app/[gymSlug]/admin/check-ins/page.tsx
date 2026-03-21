import { getAttendanceSheet } from "../actions";
import { ClipboardList, CheckCircle, XCircle } from "lucide-react";

export default async function CheckInsLogPage(props: { params: Promise<{ gymSlug: string }> }) {
  const { gymSlug } = await props.params;

  // Utilize the holistic Master Query Join
  const attendances = await getAttendanceSheet(gymSlug);

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <ClipboardList className="text-indigo-400" size={32} />
          Master LogBook
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Complete historical view of all member check-ins, linked to plan duration and tenure cohort.
        </p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-white/[0.03] text-gray-400 uppercase tracking-wider text-xs border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold">Name</th>
                <th className="px-6 py-4 font-bold">Date & Time</th>
                <th className="px-6 py-4 font-bold">Plan Name</th>
                <th className="px-6 py-4 font-bold">Plan Duration</th>
                <th className="px-6 py-4 font-bold">Tenure Cohort</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {attendances.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No check-ins recorded yet.
                  </td>
                </tr>
              ) : (
                attendances.map((record) => (
                  <tr key={record.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      {record.isSuccess ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold ring-1 ring-emerald-500/20">
                          <CheckCircle size={14} /> Entry
                        </span>
                      ) : (
                        <div className="flex flex-col gap-1 items-start">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-bold ring-1 ring-red-500/20">
                            <XCircle size={14} /> Denied
                          </span>
                          <span className="text-[10px] text-red-300/80 uppercase tracking-widest">{record.denialReason}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-white whitespace-nowrap">
                      {record.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                      <div>{new Date(record.entryTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                      <div className="text-xs">{new Date(record.entryTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td className="px-6 py-4 uppercase font-bold text-indigo-300">
                      {record.planName}
                    </td>
                    <td className="px-6 py-4">
                      {record.planDuration ? (
                        <span className="text-gray-300 font-medium bg-white/5 py-1 px-3 rounded-lg border border-white/10">{record.planDuration} Days</span>
                      ) : (
                        <span className="text-gray-600">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {record.memberType === "Old Member" ? (
                        <span className="text-amber-400 text-xs px-2 py-1 bg-amber-500/10 rounded border border-amber-500/20 font-bold uppercase tracking-wider">Old Member</span>
                      ) : record.memberType === "New Member" ? (
                        <span className="text-blue-400 text-xs px-2 py-1 bg-blue-500/10 rounded border border-blue-500/20 font-bold uppercase tracking-wider">New Member</span>
                      ) : (
                        <span className="text-gray-500 text-xs">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
