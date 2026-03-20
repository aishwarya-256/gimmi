"use client";

import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { ArrowLeft, Camera, ShieldCheck, Loader2, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { verifyGymEntryAction } from "../actions";

export default function ScanGymPage({ params }: { params: { gymSlug: string } }) {
  const [scanning, setScanning] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const router = useRouter();

  const handleScan = async (detectedCodes: any[]) => {
    if (detectedCodes.length === 0 || loading || !scanning) return;
    
    const token = detectedCodes[0].rawValue;
    setScanning(false);
    setLoading(true);

    try {
      const response = await verifyGymEntryAction(params.gymSlug, token);
      setResult(response);
      if (response.success) {
        // Redirect after 2 seconds
        setTimeout(() => router.push(`/${params.gymSlug}`), 2000);
      }
    } catch (err) {
      setResult({ success: false, message: "Server connection failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col p-6 space-y-8 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <Link href={`/${params.gymSlug}`} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
          <ShieldCheck size={14} />
          Secure Entry
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black tracking-tight">Scan Gym QR</h1>
          <p className="text-gray-500 text-sm max-w-xs mx-auto">Point your camera at the dynamic QR code displayed at the gym front desk.</p>
        </div>

        <div className="relative w-full max-w-sm aspect-square rounded-[3rem] overflow-hidden border border-white/10 bg-white/5 shadow-2xl">
          {scanning ? (
            <Scanner 
              onScan={handleScan}
              onError={(err) => console.error(err)}
              allowMultiple={false}
              styles={{ container: { width: "100%", height: "100%" } }}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm space-y-4">
              {loading ? (
                <>
                  <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                  <p className="text-sm font-bold tracking-widest uppercase text-emerald-400">Verifying Pass...</p>
                </>
              ) : result?.success ? (
                <>
                  <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center animate-in zoom-in duration-500">
                    <CheckCircle2 size={48} className="text-black" />
                  </div>
                  <p className="text-xl font-bold text-white">Entry Allowed!</p>
                  <p className="text-emerald-400 text-sm font-medium">{result.message}</p>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center animate-in zoom-in duration-500">
                    <XCircle size={48} className="text-white" />
                  </div>
                  <p className="text-xl font-bold text-white">Access Denied</p>
                  <p className="text-red-400 text-sm font-medium max-w-[200px] text-center">{result?.message || "Invalid Scan"}</p>
                  <button 
                    onClick={() => { setScanning(true); setResult(null); }}
                    className="mt-4 px-6 py-2 rounded-xl bg-white/10 border border-white/10 text-sm font-bold hover:bg-white/20 transition-all font-mono tracking-tighter"
                  >
                    Try Again
                  </button>
                </>
              )}
            </div>
          )}
          
          {/* Decorative Corner Borders */}
          <div className="absolute top-8 left-8 w-8 h-8 border-t-4 border-l-4 border-emerald-500 rounded-tl-xl pointer-events-none"></div>
          <div className="absolute top-8 right-8 w-8 h-8 border-t-4 border-r-4 border-emerald-500 rounded-tr-xl pointer-events-none"></div>
          <div className="absolute bottom-8 left-8 w-8 h-8 border-b-4 border-l-4 border-emerald-500 rounded-bl-xl pointer-events-none"></div>
          <div className="absolute bottom-8 right-8 w-8 h-8 border-b-4 border-r-4 border-emerald-500 rounded-br-xl pointer-events-none"></div>
        </div>

        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center gap-3 text-gray-600">
            <Camera size={18} />
            <span className="text-xs font-bold uppercase tracking-[0.2em]">Scanner Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
