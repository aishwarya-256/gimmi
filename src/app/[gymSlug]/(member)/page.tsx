import { getMemberDashboard } from "./actions";
import { CreditCard, CalendarCheck, Activity, Megaphone, Phone, MessageCircle, Mail, MapPin, Building2, ShieldCheck, Camera } from "lucide-react";
import Link from "next/link";

export default async function MemberDashboard(props: { params: Promise<{ gymSlug: string }> }) {
  const { gymSlug } = await props.params;
  const data = await getMemberDashboard(gymSlug);

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-white/[0.06] p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -z-10"></div>
        <h1 className="text-3xl font-black text-white tracking-tight">Welcome back 👋</h1>
        <p className="text-gray-400 mt-2">Here&apos;s your membership overview at <span className="text-emerald-400 font-semibold">{data.gym.name}</span></p>
      </div>

      {/* Scan QR Entry Button — only for active members */}
      {data.membership.status === "ACTIVE" && (
        <Link
          href={`/${gymSlug}/scan`}
          className="group relative flex items-center gap-5 p-6 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/5 border border-emerald-500/20 hover:border-emerald-400/50 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          <div className="relative z-10 w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform duration-300">
            <Camera size={24} className="text-black" />
          </div>
          <div className="relative z-10 flex-1">
            <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">Scan Gym QR</h3>
            <p className="text-xs text-gray-500 mt-0.5">Point your camera at the desk QR code to check in</p>
          </div>
          <div className="relative z-10 text-emerald-500/50 group-hover:text-emerald-400 transition-colors text-2xl font-light">→</div>
        </Link>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/20">
              <CreditCard size={18} className="text-emerald-400" />
            </div>
          </div>
          <p className="text-sm text-gray-500">Plan</p>
          <p className="text-xl font-bold text-white mt-1">{data.membership.plan?.name || "No plan"}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 ring-1 ring-indigo-500/20">
              <CalendarCheck size={18} className="text-indigo-400" />
            </div>
          </div>
          <p className="text-sm text-gray-500">Total Visits</p>
          <p className="text-xl font-bold text-white mt-1">{data.totalVisits}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-violet-500/10 ring-1 ring-violet-500/20">
              <Activity size={18} className="text-violet-400" />
            </div>
          </div>
          <p className="text-sm text-gray-500">Status</p>
          <p className={`text-xl font-bold mt-1 ${data.membership.status === "ACTIVE" ? "text-emerald-400" : "text-red-400"}`}>
            {data.membership.status}
          </p>
        </div>
      </div>

      {/* Contact Info (Only for active members) */}
      {(data.gym.ownerPhone || data.gym.ownerEmail || data.gym.ownerWhatsApp || data.gym.address) && (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[50px] -z-10"></div>
          
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Building2 size={18} className="text-indigo-400" />
            Gym Contact Info
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.gym.ownerPhone && (
              <a href={`tel:${data.gym.ownerPhone}`} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 group">
                <div className="p-2 rounded-lg bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
                  <Phone size={16} className="text-emerald-400" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Phone</p>
                  <p className="text-sm text-gray-300 font-medium">{data.gym.ownerPhone}</p>
                </div>
              </a>
            )}
            
            {data.gym.ownerWhatsApp && (
              <a href={`https://wa.me/${data.gym.ownerWhatsApp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 group">
                <div className="p-2 rounded-lg bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
                  <MessageCircle size={16} className="text-emerald-500" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">WhatsApp</p>
                  <p className="text-sm text-gray-300 font-medium">{data.gym.ownerWhatsApp}</p>
                </div>
              </a>
            )}
            
            {data.gym.ownerEmail && (
              <a href={`mailto:${data.gym.ownerEmail}`} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 group">
                <div className="p-2 rounded-lg bg-indigo-500/10 group-hover:bg-indigo-500/20 transition-colors">
                  <Mail size={16} className="text-indigo-400" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Email</p>
                  <p className="text-sm text-gray-300 font-medium truncate max-w-[150px]">{data.gym.ownerEmail}</p>
                </div>
              </a>
            )}
            
            {data.gym.address && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 sm:col-span-2 group">
                <div className="p-2 rounded-lg bg-rose-500/10 group-hover:bg-rose-500/20 transition-colors mt-0.5">
                  <MapPin size={16} className="text-rose-400" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Address</p>
                  <p className="text-sm text-gray-300 font-medium">{data.gym.address}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Announcements */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Megaphone size={18} className="text-emerald-400" />
          Gym Announcements
        </h2>
        {data.announcements.length === 0 ? (
          <p className="text-gray-500 text-sm">No announcements from your gym yet.</p>
        ) : (
          <div className="space-y-3">
            {data.announcements.map((a: any) => (
              <div key={a.id} className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl hover:bg-white/[0.04] transition-all">
                <h3 className="text-sm font-semibold text-white">{a.title}</h3>
                <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{a.content}</p>
                <p className="text-[11px] text-gray-600 mt-2">{new Date(a.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
