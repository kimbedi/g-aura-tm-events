import { getCommissions } from "@/app/actions/commissions";
import { getPendingOrders, getAdminStats } from "@/app/actions/admin";
import KohoPaymentGuide from "@/components/KohoPaymentGuide";
import { createClient } from "@/utils/supabase/server";
import { DollarSign, Ticket, Clock, ArrowRightLeft, Users, BarChart3, TrendingUp } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user?.id)
    .single();

  const role = profile?.role || "user";
  const isManager = role === "manager";
  
  const isScanner = role === "scanner";
  if (isScanner) {
    redirect("/admin/scanner");
  }

  const [{ totalDue, totalPaid, history }, pendingOrders, stats] = await Promise.all([
    getCommissions(),
    getPendingOrders(),
    getAdminStats(),
  ]);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto pb-24">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">Dashboard</h1>
          <p className="text-neutral-500 text-sm font-medium">Analyse des performances et gestion des accès.</p>
        </div>
        
        {/* Quick Summary Pill - Hide Revenue for Manager */}
        {!isManager && (
          <div className="flex items-center space-x-3 bg-neutral-900 border border-white/5 px-6 py-3 rounded-2xl shadow-xl">
            <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <div className="text-[10px] text-neutral-500 uppercase font-black tracking-widest leading-none mb-1">Chiffre d'Affaires</div>
              <div className="text-lg font-black text-white leading-none">{stats.totalRevenue.toLocaleString()} <span className="text-[10px] text-neutral-400">CDF</span></div>
            </div>
          </div>
        )}
      </header>

      {/* Main Stats Grid - 2 columns for manager, 4 for admin */}
      <div className={`grid grid-cols-1 ${isManager ? 'md:grid-cols-2' : 'md:grid-cols-4'} gap-6 mb-12`}>
        <div className="p-8 bg-neutral-900 border border-white/5 rounded-[2.5rem] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
            <Ticket className="w-24 h-24 text-yellow-500" />
          </div>
          <div className="relative z-10">
            <div className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Billets Vendus</div>
            <div className="text-5xl font-black text-white tracking-tighter mb-2">{stats.totalSold}</div>
            <div className="flex items-center text-[10px] font-bold text-yellow-500 uppercase tracking-widest">
              <Users className="w-3 h-3 mr-1.5" />
              Participants attendus
            </div>
          </div>
        </div>

        <div className="p-8 bg-neutral-900 border border-white/5 rounded-[2.5rem] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
            <BarChart3 className="w-24 h-24 text-blue-500" />
          </div>
          <div className="relative z-10">
            <div className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Taux d'Entrée</div>
            <div className="text-5xl font-black text-white tracking-tighter mb-2">
              {stats.totalSold > 0 ? Math.round((stats.totalScanned / stats.totalSold) * 100) : 0}%
            </div>
            <div className="flex items-center text-[10px] font-bold text-blue-500 uppercase tracking-widest">
              <Clock className="w-3 h-3 mr-1.5" />
              {stats.totalScanned} sur {stats.totalSold} scannés
            </div>
          </div>
        </div>

        {!isManager && (
          <>
            <div className="p-8 bg-neutral-900 border border-white/5 rounded-[2.5rem] relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
                <Clock className="w-24 h-24 text-orange-500" />
              </div>
              <div className="relative z-10">
                <div className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Attente Validation</div>
                <div className="text-5xl font-black text-orange-500 tracking-tighter mb-2">{pendingOrders?.length || 0}</div>
                <Link href="/admin/payments" className="text-[10px] font-bold text-orange-400 hover:text-white uppercase tracking-widest transition-colors">
                  Gérer les paiements →
                </Link>
              </div>
            </div>

            <div className="p-8 bg-neutral-900 border border-white/5 rounded-[2.5rem] relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
                <ArrowRightLeft className="w-24 h-24 text-red-500" />
              </div>
              <div className="relative z-10">
                <div className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Commissions Dues</div>
                <div className={`text-5xl font-black tracking-tighter mb-2 ${totalDue >= 50 ? "text-red-500" : "text-white"}`}>
                  {totalDue.toLocaleString()} <span className="text-sm font-black opacity-50">CDF</span>
                </div>
                <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                  Dette envers la plateforme
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Performance by Event */}
        <div className="bg-neutral-900/50 border border-white/5 rounded-[2.5rem] p-8">
          <h2 className="text-xl font-black uppercase tracking-tighter mb-8">Performance par Événement</h2>
          <div className="space-y-6">
            {stats.eventStats.map((event: any) => (
              <div key={event.id} className="p-6 bg-black/40 border border-white/5 rounded-3xl hover:border-yellow-500/20 transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-black text-white group-hover:text-yellow-500 transition-colors uppercase tracking-tight line-clamp-1">{event.title}</h3>
                  {!isManager && (
                    <div className="text-sm font-black text-white">{event.revenue.toLocaleString()} <span className="text-[10px] opacity-50">CDF</span></div>
                  )}
                </div>
                <div className="flex items-center space-x-6">
                  <div>
                    <div className="text-[9px] text-neutral-500 uppercase font-black tracking-widest mb-1">Vendus</div>
                    <div className="text-lg font-black">{event.sold}</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-neutral-500 uppercase font-black tracking-widest mb-1">Présents</div>
                    <div className="text-lg font-black text-green-500">{event.scanned}</div>
                  </div>
                  <div className="flex-1 pt-2">
                     <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 transition-all duration-1000" 
                          style={{ width: `${event.sold > 0 ? (event.scanned / event.sold) * 100 : 0}%` }}
                        />
                     </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Guide - Hide for Manager */}
        {!isManager && (
          <KohoPaymentGuide amountOwed={totalDue} />
        )}
      </div>
    </div>
  );
}
