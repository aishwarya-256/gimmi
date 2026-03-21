import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, MapPin, Map, Mail, Phone, Calendar, CheckCircle2, AlertTriangle, ShieldAlert } from "lucide-react";
// @ts-ignore - Next.js TS Cache Lag
import InspectorActions from "./inspector-actions"; // Client component

const prisma = new PrismaClient();

export default async function VerificationInspectorPage(props: { params: Promise<{ id: string }> }) {
  const verificationId = (await props.params).id;

  // @ts-ignore - IDE Cache Lag
  const verification = await prisma.gymVerification.findUnique({
    where: { id: verificationId },
    include: {
      gym: true,
      auditLogs: { orderBy: { createdAt: "desc" } }
    }
  });

  if (!verification) redirect("/platform-admin/verifications");

  return (
    <div className="space-y-6">
      <Link href="/platform-admin/verifications" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-400 transition-colors border border-white/10 mb-2">
        <ArrowLeft size={14} /> Back to Queue
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Identity Data */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-8 relative overflow-hidden shadow-2xl">
            <h1 className="text-3xl font-black tracking-tight text-white mb-6">Identity Profile</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <DataBlock icon={<User />} label="Owner Real Name" value={verification.ownerName} />
              <DataBlock icon={<Mail />} label="Business Email" value={verification.email} />
              <DataBlock icon={<Phone />} label="Phone Number" value={verification.phone} />
              <DataBlock icon={<Calendar />} label="Submission Date" value={new Date(verification.createdAt).toLocaleString()} />
            </div>

            <hr className="border-white/10 my-8" />

            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><MapPin className="text-indigo-400" /> Location Identity</h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-black/40 border border-white/5 rounded-2xl">
                <p className="font-mono text-sm text-gray-300">{verification.address}</p>
              </div>
              
              {verification.latitude && verification.longitude ? (
                <a 
                  href={`https://maps.google.com/?q=${verification.latitude},${verification.longitude}`} 
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-4 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 rounded-xl font-bold transition-all"
                >
                  <Map size={18} /> Open Exact GPS Coordinates in Maps
                </a>
              ) : (
                <div className="p-4 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-xl text-sm font-semibold flex items-center gap-2">
                  <AlertTriangle size={16} /> GPS coordinates were not provided.
                </div>
              )}
            </div>
            
            <hr className="border-white/10 my-8" />
            
            <h2 className="text-xl font-bold text-white mb-6">Evidence Documents</h2>
            {Array.isArray(verification.documents) && verification.documents[0] ? (
               <a href={verification.documents[0] as string} target="_blank" className="text-indigo-400 underline font-semibold">View External Evidence Folder</a>
            ) : (
              <p className="text-gray-500 italic">No external documents provided.</p>
            )}

          </div>

          <div className="bg-black/40 border border-white/10 rounded-3xl p-8 shadow-2xl">
            <h2 className="text-xl font-black text-white tracking-tight mb-4">Internal Audit Log</h2>
            <div className="space-y-3">
              {verification.auditLogs.map((log: any) => (
                <div key={log.id} className="flex flex-col gap-1 p-4 bg-white/5 rounded-xl border border-white/5">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-indigo-400">{log.oldStatus || "NEW"} → {log.newStatus}</span>
                    <span className="text-[10px] text-gray-500 font-mono">{new Date(log.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-gray-300">{log.reason}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Execution Terminal */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-indigo-950/20 border border-indigo-500/20 rounded-3xl p-6 shadow-2xl backdrop-blur-3xl">
            <div className="flex items-center gap-3 mb-6">
              <ShieldAlert className="text-indigo-400" size={24} />
              <h2 className="text-xl font-black text-white">Execution Terminal</h2>
            </div>
            
            <div className="px-4 py-3 bg-white/5 rounded-xl border border-white/10 mb-8 flex justify-between items-center text-sm">
               <span className="text-gray-400 font-semibold">Current State</span>
               <span className="font-black text-indigo-400">{verification.status.replace(/_/g, " ")}</span>
            </div>

            <InspectorActions verificationId={verification.id} currentState={verification.status} />

          </div>
        </div>

      </div>
    </div>
  );
}

function DataBlock({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex gap-4">
      <div className="w-10 h-10 shrink-0 rounded-xl bg-white/5 text-gray-400 flex items-center justify-center ring-1 ring-white/10">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">{label}</p>
        <p className="text-base font-medium text-white break-all">{value || "—"}</p>
      </div>
    </div>
  );
}
