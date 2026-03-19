import { getGymPlans, createPlanAction, deletePlanAction } from "../actions";
import { CreditCard, Plus, Trash2, Clock, DollarSign } from "lucide-react";
import { revalidatePath } from "next/cache";

export default async function PlansPage(props: { params: Promise<{ gymSlug: string }> }) {
  const { gymSlug } = await props.params;
  const plans = await getGymPlans(gymSlug);

  async function handleCreate(formData: FormData) {
    "use server";
    await createPlanAction(gymSlug, formData);
    revalidatePath(`/${gymSlug}/admin/plans`);
  }

  async function handleDelete(formData: FormData) {
    "use server";
    const planId = formData.get("planId") as string;
    await deletePlanAction(gymSlug, planId);
    revalidatePath(`/${gymSlug}/admin/plans`);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Membership Plans</h1>
        <p className="text-gray-500 text-sm mt-1">Create and manage subscription plans for your members</p>
      </div>

      {/* Create Plan Form */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.12] transition-all duration-300">
        <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-500/10 ring-1 ring-indigo-500/20">
            <Plus size={16} className="text-indigo-400" />
          </div>
          Create New Plan
        </h2>
        <form action={handleCreate} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400">Plan Name</label>
            <input
              type="text"
              name="name"
              placeholder="e.g. Monthly Pro"
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-sm hover:bg-white/[0.07]"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400">Duration (days)</label>
            <input
              type="number"
              name="durationDays"
              placeholder="30"
              required
              min="1"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-sm hover:bg-white/[0.07]"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400">Price (₹)</label>
            <input
              type="number"
              name="price"
              placeholder="999"
              required
              min="0"
              step="0.01"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-sm hover:bg-white/[0.07]"
            />
          </div>
          <div className="sm:col-span-3">
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-400 hover:to-violet-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/15 hover:scale-[1.02] active:scale-[0.98] text-sm"
            >
              Add Plan
            </button>
          </div>
        </form>
      </div>

      {/* Plans List */}
      <div className="space-y-3">
        {plans.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-600" />
            <p className="text-lg font-medium">No plans yet</p>
            <p className="text-sm">Create your first membership plan above.</p>
          </div>
        ) : (
          plans.map((plan) => (
            <div key={plan.id} className="flex items-center justify-between p-5 bg-white/[0.03] border border-white/[0.06] rounded-2xl hover:bg-white/[0.05] transition-all duration-200 group">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-indigo-500/10 ring-1 ring-indigo-500/20">
                  <CreditCard size={20} className="text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{plan.name}</h3>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock size={12} /> {plan.durationDays} days
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <DollarSign size={12} /> ₹{plan.price}
                    </span>
                    <span className="text-xs text-gray-600">{plan._count.members} members</span>
                  </div>
                </div>
              </div>
              <form action={handleDelete}>
                <input type="hidden" name="planId" value={plan.id} />
                <button
                  type="submit"
                  className="p-2 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              </form>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
