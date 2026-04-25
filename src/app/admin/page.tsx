import { getCommissions } from "@/app/actions/commissions";
import { getPendingOrders } from "@/app/actions/admin";
import KohoPaymentGuide from "@/components/KohoPaymentGuide";
import { DollarSign, Ticket, Clock, ArrowRightLeft } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
  const [{ totalDue, totalPaid, history }, pendingOrders] = await Promise.all([
    getCommissions(),
    getPendingOrders(),
  ]);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-neutral-400 text-sm">Vue d'ensemble des revenus et de la billetterie.</p>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div className="p-5 bg-neutral-900 border border-white/5 rounded-2xl">
          <div className="text-neutral-400 text-sm font-medium mb-3 flex items-center">
            <DollarSign className="w-4 h-4 mr-2 text-yellow-500" />
            Net Vendeur (85%)
          </div>
          <div className="text-3xl font-bold text-yellow-500">${totalPaid.toFixed(2)}</div>
          <div className="text-xs text-neutral-500 mt-1">Total reçu confirmé</div>
        </div>
        <div className="p-5 bg-neutral-900 border border-white/5 rounded-2xl">
          <div className="text-neutral-400 text-sm font-medium mb-3 flex items-center">
            <Clock className="w-4 h-4 mr-2 text-orange-400" />
            En attente validation
          </div>
          <div className="text-3xl font-bold text-orange-400">{pendingOrders?.length || 0}</div>
          <Link href="/admin/payments" className="text-xs text-yellow-500 hover:text-yellow-400 mt-1 block">Valider maintenant →</Link>
        </div>
        <div className="p-5 bg-neutral-900 border border-white/5 rounded-2xl">
          <div className="text-neutral-400 text-sm font-medium mb-3 flex items-center">
            <ArrowRightLeft className="w-4 h-4 mr-2 text-neutral-400" />
            Commission Plateforme due
          </div>
          <div className={`text-3xl font-bold ${totalDue >= 50 ? "text-red-400" : "text-neutral-300"}`}>${totalDue.toFixed(2)}</div>
          <div className="text-xs text-neutral-500 mt-1">À reverser au développeur</div>
        </div>
      </div>

      {/* Guide de paiement Koho (visible uniquement si dette > 0) */}
      <KohoPaymentGuide amountOwed={totalDue} />
    </div>
  );
}


