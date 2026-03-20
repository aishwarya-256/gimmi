import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-4 overflow-hidden relative">
      <div className="absolute top-10 right-1/4 w-[500px] h-[500px] bg-emerald-600/15 rounded-full blur-[120px] -z-10 animate-pulse"></div>
      <div className="absolute bottom-10 left-1/4 w-[400px] h-[400px] bg-teal-600/10 rounded-full blur-[100px] -z-10"></div>
      
      <SignUp 
        appearance={{ 
          elements: { 
            card: "bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl",
            headerTitle: "text-white",
            headerSubtitle: "text-gray-400",
            socialButtonsBlockButtonText: "text-white font-semibold",
            dividerText: "text-gray-500",
            formFieldLabel: "text-gray-300",
            formFieldInput: "bg-black/50 border-white/10 text-white",
            footerActionText: "text-gray-400",
            footerActionLink: "text-emerald-400 hover:text-emerald-300"
          } 
        }} 
      />
    </div>
  );
}
