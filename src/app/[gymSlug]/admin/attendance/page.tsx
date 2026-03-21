"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Printer, QrCode, MapPin } from "lucide-react";
import QRCode from "react-qr-code";
import { getDailyAttendance, getGymIdBySlug, generateDynamicQrPass } from "../actions";
import { getPusherClient } from "@/lib/pusher-client";

type AttendanceRecord = {
  id: string;
  isSuccess: boolean;
  denialReason?: string | null;
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
    let intervalId: NodeJS.Timeout;

    params.then(async (p) => {
      setGymSlug(p.gymSlug);
      const [data, id, token] = await Promise.all([
        getDailyAttendance(p.gymSlug),
        getGymIdBySlug(p.gymSlug),
        generateDynamicQrPass(p.gymSlug)
      ]);
      setAttendances(data as unknown as AttendanceRecord[]);
      if (id) setGymId(id);
      if (token) setQrSecret(token);

      // Rotate Token Automatically every 30 seconds
      intervalId = setInterval(async () => {
        setIsRotating(true);
        const newToken = await generateDynamicQrPass(p.gymSlug);
        setQrSecret(newToken);
        setIsRotating(false);
      }, 30000);
    });
    setOrigin(window.location.origin);

    return () => clearInterval(intervalId);
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
        isSuccess: true,
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

  const checkInUrl = `${origin}/${gymSlug}/check-in?t=${qrSecret}`;

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Live Terminal QR</h1>
        <p className="text-emerald-500 font-bold text-sm mt-1 flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          Secure Cryptographic Auto-Rotation Active
        </p>
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
            Members simply open their native phone camera, scan this code, and their attendance is instantly verified and logged. This code rotates automatically.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <div className="px-6 py-3 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold rounded-xl flex items-center justify-center gap-2">
              <QrCode size={18} />
              {isRotating ? "Refreshing pass..." : "Pass Active (30s)"}
            </div>
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
                    record.isSuccess ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 
                    'bg-red-500/20 text-red-400 border border-red-500/20'
                  }`}>
                    {record.isSuccess ? 'SUCCESS' : (record.denialReason || 'DENIED')}
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
