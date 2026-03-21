"use client";

import { useEffect, useState } from "react";
import { getInactiveMembersAction } from "./actions";
import { AlertCircle, UserX, Clock, ArrowRight } from "lucide-react";

type InactiveMember = {
  id: string;
  name: string;
  email: string;
  planName: string;
  inactiveDays: number;
  lastVisitDate: Date | null;
};

export default function InactiveMembersPage({ params }: { params: Promise<{ gymSlug: string }> }) {
  const [members, setMembers] = useState<InactiveMember[]>([]);
  const [filtered, setFiltered] = useState<InactiveMember[]>([]);
  const [filterDays, setFilterDays] = useState<number>(7);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then(async (p) => {
      const data = await getInactiveMembersAction(p.gymSlug);
      setMembers(data);
      setFiltered(data);
      setLoading(false);
    });
  }, [params]);

  useEffect(() => {
    setFiltered(members.filter(m => m.inactiveDays >= filterDays));
  }, [filterDays, members]);

  if (loading) {
    return <div className="p-8 text-center text-gray-500 animate-pulse">Loading inactive members...</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <UserX className="text-rose-500" /> At-Risk Members
        </h1>
        <p className="text-gray-400 text-sm mt-1 max-w-xl">
          These active members have not checked in recently. Reach out to them to prevent churn and improve retention.
        </p>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {[7, 14, 30].map(days => (
          <button
            key={days}
            onClick={() => setFilterDays(days)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
              filterDays === days 
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' 
                : 'bg-white/[0.03] border-white/10 text-gray-400 hover:bg-white/10'
            }`}
          >
            {days}+ Days Missing
          </button>
        ))}
      </div>

      <div className="bg-white/[0.03] border border-white/[0.06] rounded-3xl overflow-hidden shadow-2xl">
        {filtered.length === 0 ? (
          <div className="p-12 pl-12 flex flex-col items-center justify-center text-gray-500 text-center">
            <CheckCircle className="w-12 h-12 mb-4 text-emerald-500/50" />
            <p className="text-lg font-bold text-white">Great job!</p>
            <p className="text-sm mt-1">No members have been missing for {filterDays}+ days.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/40 border-b border-white/10 text-[10px] uppercase tracking-widest text-gray-500">
                  <th className="px-6 py-4 font-bold">Member</th>
                  <th className="px-6 py-4 font-bold hidden md:table-cell">Plan</th>
                  <th className="px-6 py-4 font-bold">Inactivity</th>
                  <th className="px-6 py-4 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map(member => (
                  <tr key={member.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white text-sm">{member.name}</div>
                      <div className="text-xs text-gray-500">{member.email}</div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-md text-xs font-medium text-gray-300">
                        {member.planName}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <AlertCircle size={14} className={member.inactiveDays >= 30 ? "text-rose-500" : member.inactiveDays >= 14 ? "text-amber-500" : "text-yellow-500"} />
                        <span className="font-bold text-sm text-white">{member.inactiveDays} Days</span>
                      </div>
                      <div className="text-[10px] text-gray-500 mt-0.5">
                        Last: {member.lastVisitDate ? new Date(member.lastVisitDate).toLocaleDateString() : 'Never'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <a href={`mailto:${member.email}`} className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-95">
                        Email Member <ArrowRight size={14} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper icon
function CheckCircle(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
