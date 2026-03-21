import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { ShieldCheck, ArrowRight, Eye, AlertTriangle, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";
const prisma = new PrismaClient();

export default function VerificationQueuePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <ShieldCheck className="text-indigo-400" /> Verification Queue
        </h1>
        <p className="text-sm text-gray-500 mt-2">Manage and physical-verify inbound gym owner applications here.</p>
      </div>

      <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="text-xs uppercase bg-black/50 border-b border-white/10 text-gray-500 font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Gym Identity</th>
                <th className="px-6 py-4">Owner Contact</th>
                <th className="px-6 py-4">Submitted Date</th>
                <th className="px-6 py-4">Current Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-transparent">
              <QueueRows />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

async function QueueRows() {
  const verifications = await prisma.gymVerification.findMany({
    orderBy: { createdAt: "desc" },
    include: { gym: { select: { name: true, slug: true } } }
  });

  if (verifications.length === 0) {
    return (
      <tr>
        <td colSpan={5} className="px-6 py-12 text-center text-gray-500 font-medium">
          No verification applications in queue.
        </td>
      </tr>
    );
  }

  return (
    <>
      {verifications.map((v: any) => (
        <tr key={v.id} className="hover:bg-white/5 transition-colors group cursor-default">
          <td className="px-6 py-5">
            <div className="flex flex-col">
              <span className="font-bold text-white text-base">{v.gym.name}</span>
              <span className="text-xs text-indigo-400 font-mono">/{v.gym.slug}</span>
            </div>
          </td>
          <td className="px-6 py-5">
            <div className="flex flex-col">
              <span className="font-semibold text-gray-300">{v.ownerName}</span>
              <span className="text-xs text-gray-500">{v.email}</span>
            </div>
          </td>
          <td className="px-6 py-5 whitespace-nowrap">
            <span className="text-xs font-mono bg-white/5 px-2 py-1 rounded-md text-gray-400">
              {new Date(v.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          </td>
          <td className="px-6 py-5">
            <StatusBadge status={v.status} />
          </td>
          <td className="px-6 py-5 text-right">
            <Link 
              href={`/platform-admin/verifications/${v.id}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 rounded-xl font-bold transition-all text-xs ring-1 ring-indigo-500/20"
            >
              <Eye size={14} /> Inspect
            </Link>
          </td>
        </tr>
      ))}
    </>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: any = {
    APPROVED: { icon: <CheckCircle2 size={12} />, color: "text-emerald-400 bg-emerald-500/10 ring-emerald-500/20" },
    REJECTED: { icon: <AlertTriangle size={12} />, color: "text-red-400 bg-red-500/10 ring-red-500/20" },
    SUSPENDED: { icon: <AlertTriangle size={12} />, color: "text-rose-400 bg-rose-500/10 ring-rose-500/20" },
    SUBMITTED: { icon: <ShieldCheck size={12} />, color: "text-amber-400 bg-amber-500/10 ring-amber-500/20" },
  };

  const style = map[status] || { icon: <ShieldCheck size={12} />, color: "text-indigo-400 bg-indigo-500/10 ring-indigo-500/20" };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase ring-1 ${style.color}`}>
      {style.icon} {status.replace(/_/g, " ")}
    </span>
  );
}
