import { getCommissions } from "@/app/actions/commissions";
import { DollarSign, Landmark, ArrowRightLeft, ShieldCheck } from "lucide-react";
import KohoPaymentGuide from "@/components/KohoPaymentGuide";

export default async function SuperAdminDashboard() {
  const { totalDue, totalPaid, history } = await getCommissions();

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <ShieldCheck className="w-8 h-8 mr-3 text-yellow-500" />
              G-AURA <span className="text-yellow-500 ml-2">SUPER ADMIN</span>
            </h1>
            <p className="text-neutral-400">Ledger de la Plateforme & Reversements Québec (Compte Koho)</p>
          </div>
          <div className="px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-full text-sm font-bold">
            Split 15% Actif
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Box 1: Pending (Due to Koho) */}
          <div className="bg-gradient-to-br from-yellow-500/20 to-neutral-900 border border-yellow-500/30 rounded-3xl p-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-yellow-500" />
              </div>
              <h2 className="text-lg font-medium text-neutral-300">Solde à recevoir (Koho)</h2>
            </div>
            <div className="text-5xl font-black text-white mb-2">${totalDue.toFixed(2)}</div>
            <p className="text-sm text-neutral-400">Ce montant est actuellement sur le compte Airtel/M-Pesa du client et vous est dû.</p>
            <button className="mt-6 w-full py-4 bg-yellow-500 text-black font-bold rounded-xl hover:bg-yellow-400 transition-colors">
              Générer la facture de reversement
            </button>
          </div>

          {/* Box 2: Paid (Sent to Koho) */}
          <div className="bg-neutral-900 border border-white/5 rounded-3xl p-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                <Landmark className="w-5 h-5 text-neutral-400" />
              </div>
              <h2 className="text-lg font-medium text-neutral-400">Total reversé historiquement</h2>
            </div>
            <div className="text-4xl font-black text-neutral-500 mb-2">${totalPaid.toFixed(2)}</div>
            <p className="text-sm text-neutral-500">Fonds déjà reçus avec succès sur le compte Koho au Québec.</p>
          </div>
        </div>

        {/* Historique du Ledger */}
        <div className="bg-neutral-900 border border-white/5 rounded-3xl p-8">
          <h2 className="text-xl font-bold mb-6 flex items-center">
            <ArrowRightLeft className="w-5 h-5 mr-3 text-neutral-400" />
            Historique des Transactions (Ledger)
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-neutral-500 text-sm">
                  <th className="pb-4 font-medium">Date</th>
                  <th className="pb-4 font-medium">ID Commande</th>
                  <th className="pb-4 font-medium">Brut (100%)</th>
                  <th className="pb-4 font-medium">Net Client (85%)</th>
                  <th className="pb-4 font-medium text-yellow-500">Commission (15%)</th>
                  <th className="pb-4 font-medium text-right">Statut Reversement</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {(!history || history.length === 0) && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-neutral-500">
                      Aucune transaction complétée pour le moment.
                    </td>
                  </tr>
                )}
                {history?.map((item: any) => (
                  <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 text-neutral-300">{new Date(item.created_at).toLocaleDateString()}</td>
                    <td className="py-4 font-mono text-xs text-neutral-500">{item.order_id.substring(0,8)}...</td>
                    <td className="py-4 font-bold text-neutral-400">${item.gross_amount_usd}</td>
                    <td className="py-4 font-bold text-neutral-300">${item.net_amount_usd}</td>
                    <td className="py-4 font-black text-yellow-500">+${item.commission_amount_usd}</td>
                    <td className="py-4 text-right">
                      {item.payout_status === 'pending' ? (
                        <span className="bg-orange-500/20 text-orange-500 px-3 py-1 rounded-full text-xs font-bold uppercase">En attente</span>
                      ) : (
                        <span className="bg-green-500/20 text-green-500 px-3 py-1 rounded-full text-xs font-bold uppercase">Payé</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Guide de paiement pour le partenaire Kinshasa */}
        <KohoPaymentGuide amountOwed={totalDue} />
      </div>
    </div>
  );
}
