import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { Phone, Mail, MessageCircle, MapPin, Save, Building2 } from "lucide-react";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

async function updateGymContactAction(formData: FormData) {
  "use server";
  
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  
  const gymSlug = formData.get("gymSlug") as string;
  const ownerPhone = formData.get("ownerPhone") as string;
  const ownerEmail = formData.get("ownerEmail") as string;
  const ownerWhatsApp = formData.get("ownerWhatsApp") as string;
  const address = formData.get("address") as string;
  
  // Verify admin
  const gym = await prisma.gym.findUnique({
    where: { slug: gymSlug },
    include: {
      members: { where: { userId, role: { in: ["OWNER", "MANAGER"] } } }
    }
  });
  
  if (!gym || gym.members.length === 0) {
    throw new Error("Access denied");
  }
  
  await prisma.gym.update({
    where: { id: gym.id },
    data: {
      ownerPhone: ownerPhone || null,
      ownerEmail: ownerEmail || null,
      ownerWhatsApp: ownerWhatsApp || null,
      address: address || null,
    }
  });
  
  revalidatePath(`/${gymSlug}/admin/contact`);
}

export default async function GymContactPage(props: { params: Promise<{ gymSlug: string }> }) {
  const { gymSlug } = await props.params;
  const { userId } = await auth();
  
  if (!userId) return null;
  
  const gym = await prisma.gym.findUnique({
    where: { slug: gymSlug },
    include: {
      members: { where: { userId, role: { in: ["OWNER", "MANAGER"] } } }
    }
  });
  
  if (!gym || gym.members.length === 0) return <div>Access denied</div>;

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <Building2 className="text-indigo-400" />
          Gym Contact Info
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          This information will be visible to your active members so they can reach you directly.
        </p>
      </div>

      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 relative overflow-hidden">
        <form action={updateGymContactAction} className="space-y-6">
          <input type="hidden" name="gymSlug" value={gymSlug} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="ownerPhone" className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                <Phone size={16} className="text-emerald-400" />
                Phone Number
              </label>
              <input 
                type="tel" 
                id="ownerPhone" 
                name="ownerPhone"
                defaultValue={gym.ownerPhone || ""}
                placeholder="+1 (555) 000-0000"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:border-transparent transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="ownerWhatsApp" className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                <MessageCircle size={16} className="text-emerald-500" />
                WhatsApp Number
              </label>
              <input 
                type="tel" 
                id="ownerWhatsApp" 
                name="ownerWhatsApp"
                defaultValue={gym.ownerWhatsApp || ""}
                placeholder="+1 (555) 000-0000"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:border-transparent transition-all"
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="ownerEmail" className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                <Mail size={16} className="text-indigo-400" />
                Owner/Support Email
              </label>
              <input 
                type="email" 
                id="ownerEmail" 
                name="ownerEmail"
                defaultValue={gym.ownerEmail || ""}
                placeholder="support@ironforge.com"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:border-transparent transition-all"
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="address" className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                <MapPin size={16} className="text-rose-400" />
                Gym Physical Address
              </label>
              <textarea 
                id="address" 
                name="address"
                rows={3}
                defaultValue={gym.address || ""}
                placeholder="123 Fitness Blvd, Suite 100..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:border-transparent transition-all resize-none"
              ></textarea>
            </div>
          </div>
          
          <button 
            type="submit"
            className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-400 hover:to-violet-400 text-white font-bold transition-all duration-300 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30"
          >
            <Save size={18} />
            Save Contact Information
          </button>
        </form>
      </div>
    </div>
  );
}
