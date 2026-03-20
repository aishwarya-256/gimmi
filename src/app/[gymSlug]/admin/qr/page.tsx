"use client";

import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { QrCode, RefreshCw, ShieldCheck } from "lucide-react";
import { generateGymEntryTokenAction } from "../actions";

export default function AdminQrPage({ params }: { params: { gymSlug: string } }) {
  const [token, setToken] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);

  const refreshToken = async () => {
    try {
      const newToken = await generateGymEntryTokenAction(params.gymSlug);
      setToken(newToken);
      setTimeLeft(30);
    } catch (err) {
      console.error("Failed to generate token:", err);
    }
  };

  useEffect(() => {
    refreshToken();
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          refreshToken();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-8 animate-in zoom-in duration-500">
      <div className="text-center">
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center justify-center gap-3">
          <QrCode className="text-emerald-400" size={32} />
          Gym Entry Terminal
        </h1>
        <p className="text-gray-500 mt-2 max-w-sm mx-auto">Display this QR code at your front desk. Members must scan this to record their attendance.</p>
      </div>

      <div className="relative p-8 rounded-[3rem] bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl shadow-2xl">
        <div className="absolute inset-0 bg-emerald-500/5 rounded-[3rem] blur-2xl animate-pulse"></div>
        
        <div className="relative z-10 p-6 bg-white rounded-[2rem] shadow-inner">
          {token ? (
            <QRCode value={token} size={256} className="w-full h-full" />
          ) : (
            <div className="w-64 h-64 flex items-center justify-center">
              <RefreshCw className="w-12 h-12 text-gray-200 animate-spin" />
            </div>
          )}
        </div>

        <div className="mt-8 flex items-center justify-between gap-4 px-2">
          <div className="flex items-center gap-2 text-emerald-400">
            <ShieldCheck size={18} />
            <span className="text-xs font-bold uppercase tracking-wider">Secure Access</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></div>
            <span className="text-xs font-bold font-mono text-gray-400 uppercase tracking-widest">Rotates in {timeLeft}s</span>
          </div>
        </div>
      </div>

      <button 
        onClick={refreshToken}
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all text-xs font-bold tracking-widest uppercase"
      >
        <RefreshCw size={14} /> Force Refresh
      </button>
    </div>
  );
}
