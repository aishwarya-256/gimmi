import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Building2, CreditCard, Users, QrCode } from "lucide-react";

export default async function QuickSetupGuide() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const steps = [
    {
      title: "Create Your First Gym",
      desc: "Go to the Platform Admin dashboard and use the 'Onboard a New Gym' form. Pick a memorable web address (slug) for your gym's link.",
      icon: <Building2 className="w-5 h-5 text-indigo-400" />,
      color: "indigo"
    },
    {
      title: "Set Up Membership Plans",
      desc: "Open your new Gym's Dashboard and navigate to the Plans tab. Create standard packages like 'Monthly Pro' or 'Annual Elite' with pricing logic.",
      icon: <CreditCard className="w-5 h-5 text-emerald-400" />,
      color: "emerald"
    },
    {
      title: "Invite Your Members",
      desc: "Share your unique gym link (gimmi.app/your-slug) with your customers. They will sign up with their Google account and be added to your member list.",
      icon: <Users className="w-5 h-5 text-amber-400" />,
      color: "amber"
    },
    {
      title: "Start Scanning QR Passes",
      desc: "Keep the Attendance scanner open on a staff iPad or phone. Members will pull up their auto-refreshing QR code, and you just scan to log their visit!",
      icon: <QrCode className="w-5 h-5 text-violet-400" />,
      color: "violet"
    }
  ];

  return (
    <div className="flex flex-col items-center min-h-screen relative overflow-hidden py-16">
      {/* Ambient Background Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[150px] -z-10"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-600/10 rounded-full blur-[130px] -z-10"></div>

      <div className="w-full max-w-3xl px-6">
        <Link 
          href="/admin" 
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-white mb-8 transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl ring-1 ring-white/10"
        >
          <ArrowLeft size={16} />
          Back to Admin
        </Link>

        <h1 className="text-4xl font-black text-white tracking-tight mb-3">Quick Setup Guide</h1>
        <p className="text-lg text-gray-400 mb-12">Follow these 4 simple steps to launch your gym on the Gimmi platform today.</p>

        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-7 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
          {steps.map((step, idx) => (
            <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              
              {/* Timeline Center Point */}
              <div className="flex items-center justify-center w-14 h-14 rounded-full border-4 border-[#0a0a0a] bg-black ring-1 ring-white/10 text-white shadow-xl z-20 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                {step.icon}
              </div>

              {/* Card */}
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-6 bg-white/[0.03] backdrop-blur-sm rounded-3xl border border-white/[0.08] group-hover:border-white/[0.15] group-hover:bg-white/[0.05] transition-all duration-300">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-black bg-${step.color}-500/20 text-${step.color}-400 ring-1 ring-${step.color}-500/30`}>
                    0{idx + 1}
                  </span>
                  <h3 className="text-lg font-bold text-white">{step.title}</h3>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed pl-9">
                  {step.desc}
                </p>
              </div>

            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link 
            href="/admin"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-400 hover:to-violet-400 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:-translate-y-1"
          >
            I&apos;m Ready — Let&apos;s Build
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}
