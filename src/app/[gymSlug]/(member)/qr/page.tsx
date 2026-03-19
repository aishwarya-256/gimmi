"use client";

import { useState, useEffect, useCallback, use } from "react";
import { generateQRToken } from "../actions";
import QRCode from "react-qr-code";
import { QrCode, RefreshCw, ShieldCheck, Clock } from "lucide-react";

export default function QRPassPage({ params }: { params: Promise<{ gymSlug: string }> }) {
  const { gymSlug } = use(params);
  const [token, setToken] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState(30);
  const [loading, setLoading] = useState(true);

  const fetchToken = useCallback(async () => {
    if (!gymSlug) return;
    setLoading(true);
    try {
      const newToken = await generateQRToken(gymSlug);
      setToken(newToken);
      setTimeLeft(30);
    } catch (err) {
      console.error("Failed to generate QR token", err);
    }
    setLoading(false);
  }, [gymSlug]);

  // Handle periodic refresh and countdown
  useEffect(() => {
    if (!gymSlug) return;

    let isMounted = true;

    const initFetch = async () => {
      if (isMounted) {
        setLoading(true);
        try {
          const newToken = await generateQRToken(gymSlug);
          if (isMounted) {
            setToken(newToken);
            setTimeLeft(30);
          }
        } catch (err) {
          console.error("Failed to generate QR token", err);
        }
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initFetch();

    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          initFetch();
          return 30; // optimistically reset time
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [gymSlug]);

  return (
    <div className="space-y-8 flex flex-col items-center">
      <div className="text-center">
        <h1 className="text-3xl font-black text-white tracking-tight">Your QR Pass</h1>
        <p className="text-gray-500 text-sm mt-2">Show this QR code at the entrance for instant check-in</p>
      </div>

      {/* QR Code Card */}
      <div className="relative group">
        {/* Glow Effect */}
        <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-emerald-500/20 rounded-[2rem] blur-xl opacity-50 group-hover:opacity-80 transition-opacity duration-700"></div>

        <div className="relative bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] rounded-3xl p-8 flex flex-col items-center gap-6 hover:border-white/[0.15] transition-all duration-500">
          {loading ? (
            <div className="w-64 h-64 flex items-center justify-center">
              <RefreshCw size={32} className="text-gray-500 animate-spin" />
            </div>
          ) : token ? (
            <div className="bg-white p-5 rounded-2xl shadow-2xl">
              <QRCode value={token} size={240} level="H" />
            </div>
          ) : (
            <div className="w-64 h-64 flex items-center justify-center bg-white/5 rounded-2xl">
              <QrCode size={48} className="text-gray-600" />
            </div>
          )}

          {/* Timer */}
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ring-1 ${
              timeLeft > 10 
                ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20" 
                : "bg-red-500/10 text-red-400 ring-red-500/20 animate-pulse"
            }`}>
              <Clock size={14} />
              Refreshes in {timeLeft}s
            </div>
            <button
              onClick={fetchToken}
              className="p-2.5 rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10 transition-all hover:scale-105 active:scale-95"
            >
              <RefreshCw size={16} className="text-gray-400" />
            </button>
          </div>

          {/* Security Badge */}
          <div className="flex items-center gap-2 text-[11px] text-gray-600">
            <ShieldCheck size={12} className="text-emerald-500" />
            Cryptographically signed · Expires every 30 seconds
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="max-w-md space-y-3 mt-4">
        <InfoStep step="1" text="Open this page on your phone at the gym entrance" />
        <InfoStep step="2" text="Show the QR code to the staff at the desk" />
        <InfoStep step="3" text="They scan it and you're checked in instantly" />
      </div>
    </div>
  );
}

function InfoStep({ step, text }: { step: string; text: string }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl">
      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 ring-1 ring-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-bold shrink-0">
        {step}
      </div>
      <p className="text-sm text-gray-400">{text}</p>
    </div>
  );
}
