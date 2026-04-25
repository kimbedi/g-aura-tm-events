import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { logout } from "@/app/actions/auth";
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  Ticket,
  LogOut,
  ArrowRight,
  Calendar,
} from "lucide-react";
import { formatDateTime } from "@/utils/format";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/account");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Count user's tickets to show a quick stat
  const { count: ticketCount } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  const role = profile?.role ?? "user";
  const isStaff = ["super_admin", "admin", "manager", "scanner", "moderator"].includes(role);
  const fullName = profile?.full_name || user.email?.split("@")[0] || "Utilisateur";
  const memberSince = user.created_at;

  return (
    <main className="min-h-screen pt-24 pb-32 px-6">
      <div className="max-w-3xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase mb-2 flex items-center">
            <User className="w-8 h-8 mr-3 text-yellow-500" />
            Mon Compte
          </h1>
          <p className="text-neutral-500 text-sm">Tes informations et tes accès G-Aura.</p>
        </header>

        {/* Identity card */}
        <section className="bg-gradient-to-br from-yellow-500/10 to-neutral-900 border border-yellow-500/20 rounded-3xl p-8 mb-8 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-yellow-500/10 rounded-full blur-3xl" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.3em] mb-2">
                Membre G-Aura
              </div>
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-1">
                {fullName}
              </h2>
              <div className="text-sm text-neutral-400 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Inscrit le {formatDateTime(memberSince)}
              </div>
            </div>
            {isStaff && (
              <div className="bg-yellow-500 text-black text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3" />
                {role.replace("_", " ")}
              </div>
            )}
          </div>
        </section>

        {/* Profile details */}
        <section className="bg-neutral-900 border border-white/5 rounded-3xl p-8 mb-8">
          <h3 className="text-xs font-black text-neutral-500 uppercase tracking-[0.3em] mb-6">
            Informations
          </h3>
          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4 text-yellow-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] uppercase font-black tracking-widest text-neutral-500 mb-0.5">
                  Email
                </div>
                <div className="text-sm font-medium truncate">{user.email}</div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4 text-yellow-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] uppercase font-black tracking-widest text-neutral-500 mb-0.5">
                  Téléphone
                </div>
                <div className="text-sm font-medium truncate">
                  {profile?.phone_number || (
                    <span className="text-neutral-600 italic">Non renseigné</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center shrink-0">
                <Ticket className="w-4 h-4 text-yellow-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] uppercase font-black tracking-widest text-neutral-500 mb-0.5">
                  Commandes passées
                </div>
                <div className="text-sm font-medium">{ticketCount ?? 0}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick actions */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link
            href="/tickets"
            className="group bg-neutral-900 border border-white/5 hover:border-yellow-500/40 rounded-3xl p-6 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <Ticket className="w-6 h-6 text-yellow-500" />
              <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-yellow-500 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="font-black uppercase tracking-tight mb-1">Mes Billets</h3>
            <p className="text-xs text-neutral-500">QR codes pour l'entrée des événements.</p>
          </Link>

          {isStaff && (
            <Link
              href="/admin"
              className="group bg-neutral-900 border border-white/5 hover:border-yellow-500/40 rounded-3xl p-6 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <ShieldCheck className="w-6 h-6 text-yellow-500" />
                <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-yellow-500 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="font-black uppercase tracking-tight mb-1">Dashboard</h3>
              <p className="text-xs text-neutral-500">Espace administrateur.</p>
            </Link>
          )}
        </section>

        {/* Logout */}
        <section className="border-t border-white/5 pt-6">
          <form action={logout}>
            <button
              type="submit"
              className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Se déconnecter
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
