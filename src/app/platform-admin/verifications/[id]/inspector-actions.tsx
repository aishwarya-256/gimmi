"use client";

import { useState } from "react";
import { processVerificationAction } from "../../actions";
import { CheckCircle2, XCircle, ShieldAlert, ArrowRight } from "lucide-react";

export default function InspectorActions({ verificationId, currentState }: { verificationId: string; currentState: string }) {
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");

  async function handleAction(actionType: "APPROVE" | "REJECT" | "SUSPEND" | "ASSIGN") {
    if ((actionType === "REJECT" || actionType === "SUSPEND") && !reason) {
      alert("You must provide a reason for Rejection or Suspension.");
      return;
    }

    if (confirm(`Are you sure you want to ${actionType} this gym?`)) {
      setLoading(true);
      const res = await processVerificationAction(verificationId, { action: actionType, reason });
      if (res.error) alert(res.error);
      setLoading(false);
      setReason("");
    }
  }

  return (
    <div className="space-y-4">
      
      {currentState !== "APPROVED" && (
      <button 
        disabled={loading}
        onClick={() => handleAction("APPROVE")}
        className="w-full py-4 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl font-black tracking-widest uppercase transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.1)] active:scale-95 disabled:opacity-50"
      >
        <CheckCircle2 size={18} /> Approve & Unlock Gym
      </button>
      )}

      {(currentState === "NOT_SUBMITTED" || currentState === "SUBMITTED") && (
      <button 
        disabled={loading}
        onClick={() => handleAction("ASSIGN")}
        className="w-full py-3 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-xl font-bold transition-all text-sm active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        Assign To Me (Under Review)
      </button>
      )}

      {currentState !== "REJECTED" && currentState !== "APPROVED" && (
        <div className="pt-4 border-t border-white/10 mt-4 space-y-3">
          <input 
            type="text" 
            placeholder="Reason for Rejection..."
            value={reason}
            onChange={e => setReason(e.target.value)}
            className="w-full px-4 py-3 bg-black/40 border border-red-500/20 rounded-xl text-white placeholder-red-900/50 focus:outline-none focus:ring-1 focus:ring-red-500 text-sm"
          />
          <button 
            disabled={loading || !reason}
            onClick={() => handleAction("REJECT")}
            className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl font-bold transition-all text-sm active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <XCircle size={16} /> Reject Application
          </button>
        </div>
      )}

      {currentState === "APPROVED" && (
         <div className="pt-4 border-t border-white/10 mt-4 space-y-3">
          <input 
            type="text" 
            placeholder="Suspension Reason..."
            value={reason}
            onChange={e => setReason(e.target.value)}
            className="w-full px-4 py-3 bg-black/40 border border-rose-500/20 rounded-xl text-white placeholder-rose-900/50 focus:outline-none focus:ring-1 focus:ring-rose-500 text-sm"
          />
          <button 
            disabled={loading || !reason}
            onClick={() => handleAction("SUSPEND")}
            className="w-full py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 rounded-xl font-bold transition-all text-sm active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <ShieldAlert size={16} /> Suspend Violating Gym
          </button>
        </div>
      )}

    </div>
  );
}
