import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { checkTrainerRegistration, registerTrainerAction } from "../actions";
import { ShieldCheck, Dumbbell, User, Pickaxe, MapPin } from "lucide-react";

export default async function TrainerRegistrationPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/trainer/sign-in");
  }

  const gyms = await checkTrainerRegistration();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col relative overflow-hidden pb-32">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] -z-10 animate-pulse"></div>
      <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-teal-600/10 rounded-full blur-[100px] -z-10"></div>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-6 py-12 flex flex-col items-center">
        
        {/* Header */}
        <div className="text-center mb-10 w-full">
          <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)] ring-1 ring-white/20">
            <Dumbbell className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-2">Create Trainer Profile</h1>
          <p className="text-gray-400">Join Gimmi to connect with clients and manage your verified status.</p>
        </div>

        {/* Registration Form */}
        <div className="w-full bg-white/[0.03] backdrop-blur-xl p-8 rounded-3xl border border-white/[0.08] shadow-2xl relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent opacity-50 rounded-3xl pointer-events-none"></div>
          
          <form action={registerTrainerAction} className="space-y-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="gymName" className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                  <MapPin size={16} className="text-emerald-400" />
                  Your Primary Gym
                </label>
                <input 
                  type="text" 
                  id="gymName" 
                  name="gymName"
                  placeholder="e.g. Iron Forge Elite"
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:ring-2 focus:ring-emerald-500 focus:outline-none focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label htmlFor="gymId" className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-500" />
                  Request Official Verification (Optional)
                </label>
                <p className="text-xs text-gray-500 mb-2">If your gym uses Gimmi, select it below to get a verified badge.</p>
                <select 
                  id="gymId" 
                  name="gymId"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none focus:border-transparent transition-all appearance-none"
                >
                  <option value="" className="bg-neutral-900 text-gray-500">None / My gym isn't on Gimmi yet</option>
                  {gyms.map(gym => (
                    <option key={gym.id} value={gym.id} className="bg-neutral-900 text-white">
                      {gym.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                  <User size={16} className="text-indigo-400" />
                  Contact Phone
                </label>
                <input 
                  type="tel" 
                  id="phone" 
                  name="phone"
                  placeholder="+1 (555) 000-0000"
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:ring-2 focus:ring-emerald-500 focus:outline-none focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="specialization" className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                  <Pickaxe size={16} className="text-amber-400" />
                  Specialization
                </label>
                <input 
                  type="text" 
                  id="specialization" 
                  name="specialization"
                  placeholder="e.g. Powerlifting, CrossFit"
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:ring-2 focus:ring-emerald-500 focus:outline-none focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label htmlFor="bio" className="text-sm font-semibold text-gray-300">
                  Short Bio
                </label>
                <textarea 
                  id="bio" 
                  name="bio"
                  rows={3}
                  placeholder="Tell clients about your experience and training style..."
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:ring-2 focus:ring-emerald-500 focus:outline-none focus:border-transparent transition-all resize-none"
                ></textarea>
              </div>

            </div>
            
            <button 
              type="submit"
              className="w-full py-4 mt-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold transition-all duration-300 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 text-lg"
            >
              Complete Profile Setup
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
