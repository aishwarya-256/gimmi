"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Printer, QrCode, MapPin } from "lucide-react";
import QRCode from "react-qr-code";
import { getDailyAttendance, getGymIdBySlug, getGymQrSecret, rotateGymQrSecretAction } from "../actions";
import { getPusherClient } from "@/lib/pusher-client";

type AttendanceRecord = {
  id: string;
  status: string;
  entryTime: Date | string;
  user: {
    name: string;
    email: string;
  };
};

export default function QRScannerPage({ params }: { params: Promise<{ gymSlug: string }> }) {
  const [gymSlug, setGymSlug] = useState("");
  const [gymId, setGymId] = useState("");
  const [qrSecret, setQrSecret] = useState("");
  const [isRotating, setIsRotating] = useState(false);
  const [origin, setOrigin] = useState("");
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    params.then(async (p) => {
      setGymSlug(p.gymSlug);
      const [data, id, secret] = await Promise.all([
        getDailyAttendance(p.gymSlug),
        getGymIdBySlug(p.gymSlug),
        getGymQrSecret(p.gymSlug)
      ]);
      setAttendances(data as AttendanceRecord[]);
      if (id) setGymId(id);
      if (secret) setQrSecret(secret);
    });
    setOrigin(window.location.origin);
  }, [params]);

  // --- Pusher real-time subscription ---
  useEffect(() => {
    if (!gymId) return;

    const client = getPusherClient();
    if (!client) return;

    const channel = client.subscribe(`gym-${gymId}`);

    channel.bind("entry-log", (data: { userName: string; userEmail: string; planName: string; timestamp: string }) => {
      const newRecord: AttendanceRecord = {
        id: `live-${Date.now()}`,
        status: "SUCCESS",
        entryTime: data.timestamp,
        user: {
          name: data.userName,
          email: data.userEmail || "",
        },
      };
      setAttendances((prev) => [newRecord, ...prev]);
    });

    return () => {
      channel.unbind_all();
      client.unsubscribe(`gym-${gymId}`);
    };
  }, [gymId]);

  const handleRotate = async () => {
    if (confirm("Are you sure? Old desk posters will stop working immediately.")) {
      setIsRotating(true);
      const newSecret = await rotateGymQrSecretAction(gymSlug);
      setQrSecret(newSecret);
      setIsRotating(false);
    }
  };

  const checkInUrl = `${origin}/${gymSlug}/check-in?t=${qrSecret}`;

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Wall QR Poster</h1>
        <p className="text-gray-500 text-sm mt-1">Print this static QR code and place it at your front desk or wall.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Printable Poster Section */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -z-10 group-hover:bg-indigo-500/20 transition-all duration-700"></div>
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-6 sm:mb-8">
            <QrCode size={14} /> Official Gimmi Check-In
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-3xl shadow-2xl ring-4 ring-white/10 mb-6 sm:mb-8 transform group-hover:scale-105 transition-transform duration-500">
            {gymSlug && origin ? (
              <QRCode 
                value={checkInUrl}
                size={200}
                level="H"
                fgColor="#0a0a0a"
                bgColor="#ffffff"
              />
            ) : (
              <div className="w-[200px] h-[200px] bg-gray-100 rounded-xl animate-pulse flex items-center justify-center">
                <QrCode className="text-gray-300 w-12 h-12" />
              </div>
            )}
          </div>

          <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Scan to Enter</h2>
          <p className="text-gray-400 text-sm max-w-xs leading-relaxed mb-6 sm:mb-8">
            Members simply open their native phone camera, scan this code, and their attendance is instantly verified and logged.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <button 
              onClick={() => window.print()}
              className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:scale-105 active:scale-95"
            >
              <Printer size={18} />
              Print Desk Poster
            </button>
            <button 
              onClick={handleRotate}
              disabled={isRotating}
              className="px-6 py-3 bg-red-500/10 text-red-500 border border-red-500/20 font-bold rounded-xl hover:bg-red-500/20 transition-all flex items-center justify-center gap-2 hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <QrCode size={18} />
              {isRotating ? "Rotating..." : "Rotate QR"}
            </button>
          </div>
        </div>

        {/* Daily Attendance Sheet — LIVE via Pusher */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-6 sm:p-8 flex flex-col relative overflow-hidden max-h-[600px] h-[600px]">
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] -z-10"></div>
          
          <div className="flex items-center justify-between mb-6 shrink-0">
            <h3 className="text-xl font-bold text-white">Daily Attendance Sheet</h3>
            <span className="px-3 py-1 bg-white/5 text-gray-400 text-xs rounded-full">{attendances.length} today</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {attendances.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 text-sm">
                <QrCode className="mb-2 opacity-30" size={32} />
                No one has checked in today yet.
              </div>
            ) : (
              attendances.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors cursor-default animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-full flex items-center justify-center text-white font-bold opacity-90 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                      {record.user.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{record.user.name}</h4>
                      <p className="text-xs text-gray-400">{new Date(record.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 text-xs font-bold rounded-lg ${
                    record.status === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 
                    'bg-red-500/20 text-red-400 border border-red-500/20'
                  }`}>
                    {record.status}
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="pt-4 mt-2 shrink-0 border-t border-white/5">
            <p className="text-center text-xs text-emerald-400 font-semibold tracking-widest uppercase opacity-80 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Feed Active {gymId ? "• Connected" : "• Connecting..."}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
