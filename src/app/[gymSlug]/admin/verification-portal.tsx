"use client";

import { useState } from "react";
import { submitGymVerification } from "./verification-actions";
import { MapPin, UploadCloud, ShieldAlert, CheckCircle2, AlertTriangle, FileText, ArrowRight, XCircle } from "lucide-react";
import NavBar from "./verification-navbar"; // We'll make a tiny navbar

export default function VerificationPortal({ 
  gymSlug, gymId, gymName, verificationStatus, verificationRecord 
}: { 
  gymSlug: string; 
  gymId: string; 
  gymName: string; 
  verificationStatus: string;
  verificationRecord: any;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const fd = new FormData(e.target as HTMLFormElement);
    const result = await submitGymVerification(gymId, gymSlug, fd);
    
    if (result?.error) {
      setError(result.error);
    }
    setLoading(false);
  }

  const isFormState = verificationStatus === "NOT_SUBMITTED" || verificationStatus === "REJECTED" || verificationStatus === "REVERIFICATION_REQUIRED";

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center">
      <NavBar gymName={gymName} gymSlug={gymSlug} />

      <main className="flex-1 w-full max-w-4xl px-6 py-12">
        {verificationStatus === "REJECTED" && (
          <div className="mb-8 p-6 bg-red-500/10 border border-red-500/20 rounded-2xl animate-in fade-in slide-in-from-top-4">
            <h3 className="text-xl font-bold text-red-500 flex items-center gap-2 mb-2">
              <XCircle /> Application Rejected
            </h3>
            <p className="text-red-400 font-medium">Reason: {verificationRecord?.rejectionReason || "No reason provided."}</p>
            <p className="text-sm text-gray-400 mt-2">Please correct the information below and resubmit your application.</p>
          </div>
        )}

        {verificationStatus === "SUSPENDED" && (
          <div className="mb-8 p-6 bg-red-500/10 border border-red-500/20 rounded-2xl animate-in fade-in slide-in-from-top-4">
            <h3 className="text-xl font-bold text-red-500 flex items-center gap-2 mb-2">
              <ShieldAlert /> Account Suspended
            </h3>
            <p className="text-red-400 font-medium">Reason: {verificationRecord?.suspensionReason || "Violations detected."}</p>
            <p className="text-sm text-gray-400 mt-2">Your gym operational access has been permanently suspended. Contact support.</p>
          </div>
        )}

        {!isFormState && verificationStatus !== "SUSPENDED" && (
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-8 lg:p-12 text-center animate-in fade-in zoom-in-95 duration-500 shadow-2xl relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
            
            <ShieldAlert size={64} className="text-indigo-400 mx-auto mb-6" />
            <h1 className="text-3xl lg:text-5xl font-black text-white tracking-tight mb-4">Application Under Review</h1>
            <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
              Your gym operations are locked while our Trust & Safety team physically verifies your location.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-2xl mx-auto mt-12 relative">
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/10 -z-10 hidden sm:block"></div>
              
              <Step 
                title="Submitted" 
                active={true} 
                done={true} 
              />
              <Step 
                title="Pending Visit" 
                active={["PENDING_VISIT", "VISIT_ASSIGNED", "UNDER_REVIEW"].includes(verificationStatus)} 
                done={["VISIT_ASSIGNED", "UNDER_REVIEW"].includes(verificationStatus)} 
              />
              <Step 
                title="Final Review" 
                active={verificationStatus === "UNDER_REVIEW"} 
                done={false} 
              />
            </div>
            
            <div className="mt-12 inline-block px-6 py-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 font-medium text-sm">
              Current Status: <span className="font-bold">{verificationStatus.replace(/_/g, " ")}</span>
            </div>
          </div>
        )}

        {isFormState && (
          <form onSubmit={handleSubmit} className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-8 lg:p-12 shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="mb-10">
              <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                <ShieldAlert className="text-indigo-400" /> Trust & Safety Verification
              </h1>
              <p className="text-gray-400 mt-2">We legally verify all gym locations before allowing operational access to protect our users.</p>
            </div>

            {error && <div className="p-4 bg-red-500/10 text-red-400 rounded-xl mb-6 text-sm font-semibold border border-red-500/20">{error}</div>}

            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="Owner Full Legal Name" name="ownerName" placeholder="John Doe" required defaultValue={verificationRecord?.ownerName} />
                <InputField label="Phone Number" name="phone" placeholder="+1 (555) 000-0000" type="tel" required defaultValue={verificationRecord?.phone} />
                <InputField label="Business Email" name="email" placeholder="owner@gym.com" type="email" required defaultValue={verificationRecord?.email} />
              </div>

              <hr className="border-white/10" />

              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2"><MapPin size={20} className="text-indigo-400" /> Physical Location</h3>
                <InputField label="Full Address" name="address" placeholder="123 Fitness Blvd, NY 10001" required defaultValue={verificationRecord?.address} />
                <div className="grid grid-cols-2 gap-6">
                  <InputField label="Latitude (Optional)" name="latitude" placeholder="40.7128" type="number" step="any" defaultValue={verificationRecord?.latitude} />
                  <InputField label="Longitude (Optional)" name="longitude" placeholder="-74.0060" type="number" step="any" defaultValue={verificationRecord?.longitude} />
                </div>
              </div>

              <hr className="border-white/10" />

              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2"><FileText size={20} className="text-indigo-400" /> Identity Evidence</h3>
                <p className="text-sm text-gray-500 mb-4">You can upload photos directly or link to Google Drive/Dropbox evidence folders.</p>
                <InputField label="Photos/Docs Link (e.g. Google Drive URL)" name="docsLink" placeholder="https://drive.google.com/..." />
              </div>

              <button disabled={loading} type="submit" className="w-full py-4 mt-8 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-400 hover:to-violet-400 text-white font-bold rounded-xl transition-all shadow-xl shadow-indigo-500/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 text-lg">
                {loading ? "Submitting securely..." : "Submit for Physical Verification"} <ArrowRight size={20} />
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}

function InputField({ label, name, type = "text", placeholder, required, step, defaultValue }: any) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-gray-300">{label}</label>
      <input 
        name={name} 
        type={type} 
        placeholder={placeholder} 
        required={required}
        step={step}
        defaultValue={defaultValue || ""}
        className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
      />
    </div>
  );
}

function Step({ title, active, done }: { title: string, active: boolean, done: boolean }) {
  return (
    <div className="flex flex-col items-center gap-3 relative z-10 bg-[#0a0a0a] px-4">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${done ? 'bg-indigo-500 border-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]' : active ? 'bg-black border-indigo-500 text-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'bg-black border-white/20 text-gray-600'}`}>
        {done ? <CheckCircle2 size={18} /> : <div className="w-2.5 h-2.5 rounded-full bg-current"></div>}
      </div>
      <span className={`text-sm font-bold ${active || done ? 'text-white' : 'text-gray-600'}`}>{title}</span>
    </div>
  );
}
