import { checkPlatformLockStatus } from "@/app/actions/commissions";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import AdminLayoutClient from "./AdminLayoutClient";
import { Lock, AlertOctagon } from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Not logged in → redirect to login
  if (!user) {
    redirect("/login");
  }

  // 2. Check role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  const allowedRoles = ["admin", "manager", "scanner", "super_admin", "moderator"];
  if (!profile || !allowedRoles.includes(profile.role)) {
    redirect("/my-tickets"); // Regular users can't access admin
  }

  // 3. Check commission debt lock
  const { isLocked, amountOwed } = await checkPlatformLockStatus();

  if (isLocked) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 pt-20">
        <div className="max-w-md w-full bg-red-950/50 border border-red-500/50 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-red-600 animate-pulse" />
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-3xl font-black uppercase mb-4 text-red-500 flex items-center justify-center">
            <AlertOctagon className="w-8 h-8 mr-2" />
            Système Suspendu
          </h1>
          <p className="font-medium text-lg text-neutral-300 mb-6">
            L'accès à l'administration et au scanner de billets est temporairement verrouillé.
          </p>
          <div className="bg-black/50 border border-white/10 rounded-2xl p-4 mb-8">
            <p className="text-sm text-neutral-400 mb-1">Commissions en attente (15%)</p>
            <p className="text-3xl font-bold text-white">${amountOwed.toFixed(2)} USD</p>
          </div>
          <p className="text-sm text-neutral-500">
            Veuillez régler le solde des commissions dues au Super Administrateur (compte Koho) pour réactiver automatiquement la plateforme.
          </p>
        </div>
      </div>
    );
  }

  // 4. All good → show admin layout with pt-16 for navbar
  return (
    <div className="pt-16">
      <AdminLayoutClient role={profile.role} userName={profile.full_name}>{children}</AdminLayoutClient>
    </div>
  );
}
