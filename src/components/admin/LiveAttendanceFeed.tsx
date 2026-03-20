"use client";

import { useEffect, useState } from "react";
import { pusherClient } from "@/lib/pusher-client";
import { User, Clock, CheckCircle2, Zap } from "lucide-react";

interface EntryLog {
  userName: string;
  userEmail: string;
  planName: string;
  timestamp: string;
}

export default function LiveAttendanceFeed({ gymId }: { gymId: string }) {
  const [logs, setLogs] = useState<EntryLog[]>([]);

  useEffect(() => {
    const channel = pusherClient.subscribe(`gym-${gymId}`);
    
    channel.bind("entry-log", (data: EntryLog) => {
      setLogs((prev) => [data, ...prev].slice(0, 10)); // Keep last 10
    });

    return () => {
      pusherClient.unsubscribe(`gym-${gymId}`);
    };
  }, [gymId]);

  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-[2rem] p-6 relative overflow-hidden h-full flex flex-col">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-[40px] -z-10"></div>
      
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Zap size={18} className="text-emerald-400" />
          Live Entry Feed
        </h2>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500/60">Live Monitoring</span>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
            <Clock size={24} className="text-gray-600" />
          </div>
          <p className="text-sm text-gray-500 max-w-[180px]">Waiting for members to scan in at the desk...</p>
        </div>
      ) : (
        <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
          {logs.map((log, i) => (
            <div 
              key={`${log.timestamp}-${i}`} 
              className="group p-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl flex items-center justify-between animate-in slide-in-from-top duration-500 transition-all hover:bg-white/[0.05]"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm">
                  {log.userName.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">{log.userName}</h4>
                  <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{log.planName}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1.5 text-emerald-500 text-[10px] font-black uppercase tracking-widest mb-1">
                  <CheckCircle2 size={10} />
                  Entry Allowed
                </div>
                <p className="text-[10px] text-gray-600 font-mono">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
