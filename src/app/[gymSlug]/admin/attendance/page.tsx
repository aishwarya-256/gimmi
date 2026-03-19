"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Printer, QrCode, MapPin } from "lucide-react";
import QRCode from "react-qr-code";

type ScanResult = {
  id: string;
  status: string;
  method: string;
  entryTime: string;
  user: {
    firstName: string;
    lastName: string;
    emailAddresses: { emailAddress: string }[];
  } | null;
};

export default function QRScannerPage({ params }: { params: Promise<{ gymSlug: string }> }) {
  const [gymSlug, setGymSlug] = useState("");
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    params.then((p) => setGymSlug(p.gymSlug));
    setOrigin(window.location.origin);
  }, [params]);

  const checkInUrl = `${origin}/${gymSlug}/check-in`;

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Wall QR Poster</h1>
        <p className="text-gray-500 text-sm mt-1">Print this static QR code and place it at your front desk or wall.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Printable Poster Section */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-8 flex flex-col items-center text-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -z-10 group-hover:bg-indigo-500/20 transition-all duration-700"></div>
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-8">
            <QrCode size={14} /> Official Gimmi Check-In
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-2xl ring-4 ring-white/10 mb-8 transform group-hover:scale-105 transition-transform duration-500">
            {gymSlug && origin ? (
              <QRCode 
                value={checkInUrl}
                size={220}
                level="H"
                fgColor="#0a0a0a"
                bgColor="#ffffff"
              />
            ) : (
              <div className="w-[220px] h-[220px] bg-gray-100 rounded-xl animate-pulse flex items-center justify-center">
                <QrCode className="text-gray-300 w-12 h-12" />
              </div>
            )}
          </div>

          <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Scan to Enter</h2>
          <p className="text-gray-400 text-sm max-w-xs leading-relaxed mb-8">
            Members simply open their native phone camera, scan this code, and their attendance is instantly verified and logged.
          </p>

          <button 
            onClick={() => window.print()}
            className="w-full sm:w-auto px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:scale-105 active:scale-95"
          >
            <Printer size={18} />
            Print Desk Poster
          </button>
        </div>

        {/* Live Attendance Instructions / Feed Placeholder */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-8 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] -z-10"></div>
          
          <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.04] mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-emerald-500/10 rounded-xl">
                <MapPin className="text-emerald-400" size={24} />
              </div>
              <div>
                <h3 className="text-white font-bold">100% Contactless</h3>
                <p className="text-xs text-gray-500">No hardware scanners needed.</p>
              </div>
            </div>
            <ul className="space-y-3 text-sm text-gray-400 ml-1">
              <li className="flex items-start gap-2">
                <CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" /> 
                Members scan the poster with their personal iPhone or Android camera.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" /> 
                They click the link, and their active subscription is securely verified.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" /> 
                A big green checkmark pops up on their screen showing "Access Granted".
              </li>
            </ul>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 opacity-60 grayscale blur-[1px]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-600 rounded-full"></div>
              <div>
                <h4 className="text-sm font-bold text-white">Alex Johnson</h4>
                <p className="text-xs text-gray-400">Checked in just now</p>
              </div>
            </div>
            <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg">
              SUCCESS
            </div>
          </div>
          <p className="text-center text-xs text-indigo-400 font-semibold tracking-widest uppercase mt-4">
            Live Check-in Feed Active
          </p>
        </div>

      </div>
    </div>
  );
}
