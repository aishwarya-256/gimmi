import { SignIn } from "@clerk/nextjs";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TrainerSignInPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] -z-10 animate-pulse"></div>
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[100px] -z-10"></div>

      {/* Header */}
      <header className="px-6 py-6 max-w-5xl mx-auto w-full flex items-center justify-between z-10">
        <Link href="/" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors text-white ring-1 ring-white/10">
          <ArrowLeft size={18} />
        </Link>
        <div className="px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-xs font-semibold tracking-wider text-gray-400 uppercase">
          Trainer Portal
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-md mx-auto px-6 flex flex-col items-center justify-center -mt-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black tracking-tight mb-2">Trainer Access</h1>
          <p className="text-sm text-gray-400">Sign in with your Google account to manage your profile and requests.</p>
        </div>

        <div className="w-full bg-white/[0.03] backdrop-blur-xl p-6 rounded-3xl border border-white/[0.08] shadow-2xl">
          <SignIn 
            routing="hash" 
            forceRedirectUrl="/trainer/register"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "bg-transparent shadow-none p-0 w-full",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton: "bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl py-3 px-4 transition-all w-full",
                socialButtonsBlockButtonText: "text-white font-medium text-sm",
                socialButtonsBlockButtonArrow: "text-white",
                dividerRow: "hidden",
                formButtonPrimary: "bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-400 hover:to-violet-400 text-white font-bold py-3 px-4 rounded-xl transition-all w-full mt-4",
                formFieldInput: "bg-white/5 border border-white/10 rounded-xl text-white px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-gray-500",
                formFieldLabel: "text-gray-300 font-medium text-sm mb-1.5",
                footerActionText: "text-gray-400",
                footerActionLink: "text-indigo-400 hover:text-indigo-300",
                formFieldSuccessText: "text-emerald-400",
                formFieldErrorText: "text-red-400",
                identityPreviewText: "text-white",
                identityPreviewEditButtonIcon: "text-indigo-400",
              }
            }}
          />
        </div>
      </main>
    </div>
  );
}
