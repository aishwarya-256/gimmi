"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Clock, ShieldAlert, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { verifyGymEntryAction } from "../(member)/actions";

export default function CheckInGate({ gymSlug, token, gymName }: { gymSlug: string, token: string, gymName: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "denied" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleEntry = async () => {
    setStatus("loading");
    try {
      const res = await verifyGymEntryAction(gymSlug, token, "external");
      if (res.success) {
        setStatus("success");
        setMessage(res.message);
      } else {
        setStatus("denied");
        setMessage(res.message);
      }
    } catch {
      setStatus("error");
      setMessage("Failed to contact the check-in server.");
    }
  };

  if (status === "idle" || status === "loading") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 bg-gradient-to-t from-indigo-900/40 to-transparent relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[150px] -z-10"></div>
        
        <h1 className="text-4xl font-black text-white tracking-tight text-center mb-3">
          Check Into {gymName}
        </h1>
        <p className="text-lg text-gray-400 text-center max-w-sm mb-12">
          You scanned a secure cryptographic entry pass. Tap below to securely verify your membership and unlock the door.
        </p>

        <button 
          onClick={handleEntry}
          disabled={status === "loading"}
          className="w-full max-w-sm py-4 rounded-2xl bg-white text-black font-black text-lg transition-all text-center ring-1 ring-white/10 hover:bg-gray-200 flex items-center justify-center gap-2 hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          {status === "loading" ? <Loader2 className="animate-spin" size={24} /> : "Verify & Enter"}
          {status !== "loading" && <ArrowRight size={20} />}
        </button>
      </div>
    );
  }

  return (
    <StatusView 
      status={status} 
      message={message} 
      actionLink={`/${gymSlug}`}
      actionText="Return to Dashboard"
    />
  );
}

function StatusView({ status, message, subtext, actionLink, actionText }: { 
  status: "success" | "denied" | "cooldown" | "error"; 
  message: string; 
  subtext?: string;
  actionLink?: string;
  actionText?: string;
}) {
  const ui = {
    success: { icon: <CheckCircle2 size={80} />, color: "text-emerald-400", bg: "from-emerald-900/40", ring: "ring-emerald-500/50", glow: "bg-emerald-500/20" },
    denied: { icon: <XCircle size={80} />, color: "text-red-400", bg: "from-red-900/40", ring: "ring-red-500/50", glow: "bg-red-500/20" },
    cooldown: { icon: <Clock size={80} />, color: "text-amber-400", bg: "from-amber-900/40", ring: "ring-amber-500/50", glow: "bg-amber-500/20" },
    error: { icon: <ShieldAlert size={80} />, color: "text-rose-400", bg: "from-rose-900/40", ring: "ring-rose-500/50", glow: "bg-rose-500/20" },
  }[status];

  return (
    <div className={`min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 bg-gradient-to-t ${ui.bg} to-transparent relative overflow-hidden`}>
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] ${ui.glow} rounded-full blur-[150px] -z-10`}></div>
      
      <div className={`w-32 h-32 rounded-full border-4 border-[#0a0a0a] bg-black ${ui.color} ring-1 ${ui.ring} flex items-center justify-center shadow-2xl mb-8 animate-bounce-slow`}>
        {ui.icon}
      </div>

      <h1 className="text-4xl font-black text-white tracking-tight text-center mb-3">
        {status === "success" ? "Access Granted" : "Access Denied"}
      </h1>
      
      <p className="text-lg text-gray-400 text-center max-w-sm mb-12">
        {message}
      </p>

      {actionLink && actionText ? (
        <Link href={actionLink} className="w-full max-w-sm py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all text-center ring-1 ring-white/10 backdrop-blur-md">
          {actionText}
        </Link>
      ) : (
        <Link href="/customer" className="w-full max-w-sm py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all text-center border border-white/5">
          Go Home
        </Link>
      )}
    </div>
  );
}
