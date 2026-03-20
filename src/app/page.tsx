import { ArrowRight, Activity, Users, Camera, ShieldCheck, ChevronRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { SignUpButton, Show } from "@clerk/nextjs";

export default function LandingPage() {

  return (
    <div className="flex flex-col items-center w-full min-h-screen overflow-x-hidden">
      
      {/* Hero Section */}
      <section className="relative w-full max-w-7xl mx-auto px-6 pt-32 pb-40 flex flex-col items-center text-center">
        {/* Glowing Ambient Background Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute top-40 left-1/4 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-fuchsia-600/10 rounded-full blur-[120px]"></div>
        </div>

        {/* Top Product Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 text-gray-300 text-sm font-medium mb-8 backdrop-blur-md hover:bg-white/[0.08] transition-all cursor-pointer group shadow-2xl">
          <Sparkles className="w-4 h-4 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
          <span>Introducing Gimmi OS 2.0</span>
          <ChevronRight className="w-4 h-4 text-gray-500 group-hover:translate-x-1 transition-transform" />
        </div>
        
        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter text-white leading-[1.1] sm:leading-[1.05] max-w-5xl px-2 break-words">
          The fitness platform <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400">
            built for the future.
          </span>
        </h1>
        
        <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mt-6 md:mt-8 leading-relaxed font-light px-4">
          Manage memberships, engage private communities with 24-hr stories, and secure entry via cryptographic QR passes. The ultimate Gym OS is here.
        </p>
        
        {/* CTAs */}
        <div className="flex flex-col sm:flex-row shadow-[0_0_40px_rgba(255,255,255,0.05)] items-center gap-3 sm:gap-5 mt-10 md:mt-12 bg-white/[0.03] p-2 rounded-3xl sm:rounded-full border border-white/10 w-full sm:w-auto">
          <Show when="signed-in">
            <Link href="/customer" className="w-full sm:w-auto justify-center px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-2xl sm:rounded-full hover:scale-105 transition-all flex items-center gap-2 group shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              Open Customer App <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Show>
          <Show when="signed-out">
            <SignUpButton mode="modal" forceRedirectUrl="/customer">
              <button className="w-full sm:w-auto justify-center px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-2xl sm:rounded-full hover:scale-105 transition-all flex items-center gap-2 group shadow-[0_0_20px_rgba(16,185,129,0.2)] cursor-pointer">
                Member Sign Up <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </SignUpButton>
          </Show>
          <Link href="/admin" className="w-full sm:w-auto justify-center px-8 py-4 bg-transparent text-gray-300 font-bold rounded-2xl sm:rounded-full hover:bg-white/5 transition-all flex items-center gap-2">
            Gym Owner Login
          </Link>
        </div>

        {/* Dashboard Preview Wireframe Mockup (Linear Aesthetic) */}
        <div className="mt-16 md:mt-24 w-full max-w-5xl relative group perspective-1000 hidden sm:block">
          <div className="absolute inset-x-0 -bottom-32 h-64 bg-gradient-to-t from-[#0a0a0a] to-transparent z-10"></div>
          <div className="w-full h-[500px] border border-white/10 rounded-2xl bg-[#0f0f11] shadow-2xl overflow-hidden relative transform group-hover:-translate-y-2 transition-transform duration-700">
            {/* Fake OS Header */}
            <div className="h-12 border-b border-white/10 flex items-center px-4 gap-2 bg-[#0a0a0a]">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
              <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
            </div>
            {/* Fake Dashboard Content Grid */}
            <div className="p-8 flex gap-8 h-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]">
              {/* Sidebar */}
              <div className="w-64 space-y-5 border-r border-white/5 pr-6">
                <div className="h-8 w-32 bg-white/10 rounded-lg"></div>
                <div className="space-y-3 mt-8">
                  <div className="h-4 w-full bg-indigo-500/20 rounded-md"></div>
                  <div className="h-4 w-5/6 bg-white/5 rounded-md"></div>
                  <div className="h-4 w-4/6 bg-white/5 rounded-md"></div>
                </div>
              </div>
              {/* Main Area */}
              <div className="flex-1 space-y-6">
                 <div className="flex gap-4">
                   <div className="h-32 flex-1 bg-gradient-to-br from-indigo-500/10 to-violet-500/5 rounded-2xl border border-white/10 relative overflow-hidden">
                     <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-violet-500"></div>
                   </div>
                   <div className="h-32 flex-1 bg-white/[0.02] rounded-2xl border border-white/5"></div>
                   <div className="h-32 flex-1 bg-white/[0.02] rounded-2xl border border-white/5"></div>
                 </div>
                 <div className="h-64 w-full bg-white/[0.02] rounded-2xl border border-white/5 flex items-center justify-center">
                    <div className="w-16 h-1 bg-white/10 rounded-full animate-pulse"></div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Features Grid */}
      <section id="features" className="w-full max-w-7xl mx-auto px-6 py-32 grid grid-cols-1 md:grid-cols-2 gap-8 relative">
        <div className="col-span-1 md:col-span-2 text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">Everything you need. <span className="text-white/30">Nothing you don&apos;t.</span></h2>
        </div>

        <FeatureCard 
          icon={<Users className="w-8 h-8 text-emerald-400" />}
          title="Private Community"
          desc="Exclusive spaces for your active members to chat, post, and engage securely without distractions."
        />
        <FeatureCard 
          icon={<Camera className="w-8 h-8 text-rose-400" />}
          title="24hr Member Stories"
          desc="Photo-only disappearing stories focused purely on fitness, keeping authenticity high and toxicity low."
        />
        <FeatureCard 
          icon={<Activity className="w-8 h-8 text-amber-400" />}
          title="Secure QR Entry"
          desc="Dynamic, cryptographic QR passes verify active memberships instantly to eliminate shared-pass fraud."
        />
        <FeatureCard 
          icon={<ShieldCheck className="w-8 h-8 text-indigo-400" />}
          title="Tenant Isolation"
          desc="Enterprise-grade architecture. Your data is strictly partitioned and never leaks to other gyms."
        />
      </section>

    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-8 pb-10 rounded-3xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-all duration-500 hover:-translate-y-2 group relative overflow-hidden backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
      <div className="mb-8 p-4 rounded-2xl bg-white/5 inline-block group-hover:scale-110 group-hover:bg-white/10 transition-all duration-500 ring-1 ring-white/10 shadow-2xl">{icon}</div>
      <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">{title}</h3>
      <p className="text-gray-400 leading-relaxed text-lg">{desc}</p>
    </div>
  );
}
