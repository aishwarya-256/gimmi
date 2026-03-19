"use client";

import { useState, useRef, useEffect } from "react";
import { CheckCircle, XCircle, Clock, AlertTriangle, Camera } from "lucide-react";

type ScanResult = {
  status: string;
  message: string;
  memberName?: string;
  memberRole?: string;
  entryTime?: string;
  lastEntry?: string;
};

export default function QRScannerPage() {
  const [manualToken, setManualToken] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [scanning, setScanning] = useState(false);
  const [history, setHistory] = useState<ScanResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Use params if needed in the future, e.g., const { gymSlug } = use(params);

  // Auto-focus the input for barcode scanner hardware
  useEffect(() => {
    inputRef.current?.focus();
  }, [result]);

  async function verifyToken(token: string) {
    if (!token.trim()) return;
    setScanning(true);
    setResult(null);

    try {
      const res = await fetch("/api/verify-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      setResult(data);
      setHistory((prev) => [data, ...prev].slice(0, 20));
    } catch {
      setResult({ status: "DENIED_INVALID", message: "Network error — could not verify." });
    }

    setManualToken("");
    setScanning(false);
  }

  const statusUI: Record<string, { icon: React.ReactNode; bg: string; border: string; text: string }> = {
    SUCCESS: {
      icon: <CheckCircle size={48} />,
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      text: "text-emerald-400",
    },
    DENIED_EXPIRED: {
      icon: <XCircle size={48} />,
      bg: "bg-red-500/10",
      border: "border-red-500/30",
      text: "text-red-400",
    },
    DENIED_COOLDOWN: {
      icon: <Clock size={48} />,
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      text: "text-amber-400",
    },
    DENIED_INVALID: {
      icon: <AlertTriangle size={48} />,
      bg: "bg-red-500/10",
      border: "border-red-500/30",
      text: "text-red-400",
    },
  };

  const currentUI = result ? statusUI[result.status] || statusUI.DENIED_INVALID : null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">QR Scanner</h1>
        <p className="text-gray-500 text-sm mt-1">Scan member QR codes to record attendance</p>
      </div>

      {/* Scanner Input Area */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent -z-10"></div>

        {/* Result Display */}
        {result && currentUI ? (
          <div className={`mb-8 p-8 rounded-2xl ${currentUI.bg} border ${currentUI.border} transition-all animate-in`}>
            <div className={`${currentUI.text} mb-4 flex justify-center`}>{currentUI.icon}</div>
            <p className={`text-2xl font-black ${currentUI.text}`}>{result.memberName || "Unknown"}</p>
            <p className="text-sm text-gray-400 mt-2">{result.message}</p>
            {result.memberRole && (
              <p className="text-xs text-gray-500 mt-1">Role: {result.memberRole}</p>
            )}
          </div>
        ) : (
          <div className="mb-8 p-12">
            <Camera size={64} className="mx-auto text-gray-700 mb-4" />
            <p className="text-gray-500">Waiting for QR scan...</p>
            <p className="text-xs text-gray-600 mt-2">Paste or scan a member&apos;s QR code below</p>
          </div>
        )}

        {/* Manual Input / Hardware Scanner Capture */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            verifyToken(manualToken);
          }}
          className="flex gap-3 max-w-xl mx-auto"
        >
          <input
            ref={inputRef}
            type="text"
            value={manualToken}
            onChange={(e) => setManualToken(e.target.value)}
            placeholder="Paste QR token here or use scanner..."
            className="flex-1 px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-sm font-mono"
          />
          <button
            type="submit"
            disabled={scanning}
            className="px-6 py-3.5 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-400 hover:to-violet-400 text-white font-bold rounded-xl transition-all text-sm disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
          >
            {scanning ? "Verifying..." : "Verify"}
          </button>
        </form>
      </div>

      {/* Recent Scans History */}
      {history.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-white">Recent Scans</h2>
          {history.map((scan, i) => {
            const ui = statusUI[scan.status] || statusUI.DENIED_INVALID;
            return (
              <div key={i} className={`flex items-center gap-4 p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl`}>
                <div className={`p-2 rounded-lg ${ui.bg} ${ui.text}`}>
                  {scan.status === "SUCCESS" ? <CheckCircle size={16} /> : <XCircle size={16} />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{scan.memberName || "Unknown"}</p>
                  <p className="text-xs text-gray-500">{scan.message}</p>
                </div>
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${ui.bg} ${ui.text} ring-1 ${ui.border}`}>
                  {scan.status.replace(/_/g, " ")}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
