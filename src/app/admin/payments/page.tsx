
import { ShieldCheck, XCircle, Search, Clock } from "lucide-react";
import { getPendingOrders, validateOrder } from "@/app/actions/admin";
import { revalidatePath } from "next/cache";

export default async function PaymentsValidationPage() {
  const pendingOrders = await getPendingOrders();

  const handleValidate = async (formData: FormData) => {
    "use server";
    const id = formData.get("orderId") as string;
    await validateOrder(id);
    revalidatePath("/admin/payments");
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center">
          <Clock className="w-6 h-6 mr-3 text-yellow-500" />
          Validation des Paiements
        </h1>
        <p className="text-neutral-400 text-sm">
          Vérifiez ces numéros de référence sur vos téléphones (M-Pesa, Airtel) et validez pour émettre les billets.
        </p>
      </header>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
        <input 
          type="text" 
          placeholder="Rechercher une référence de transaction..." 
          className="w-full bg-neutral-900 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-yellow-500"
        />
      </div>

      <div className="space-y-4">
          {(!pendingOrders || pendingOrders.length === 0) && (
            <div className="text-center py-20 text-neutral-500">
              Aucun paiement en attente. Beau travail !
            </div>
          )}
          {pendingOrders && pendingOrders.map((p: any) => (
            <div
              key={p.id}
              className="bg-neutral-900 border border-white/5 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="bg-yellow-500/20 text-yellow-500 text-xs font-bold px-2 py-1 rounded uppercase">
                    {p.payment_method}
                  </span>
                  <span className="text-sm text-neutral-400">
                    {new Date(p.created_at).toLocaleString('fr-FR')}
                  </span>
                </div>
                <div className="text-lg font-bold text-white mb-1">
                  Réf: <span className="font-mono text-yellow-500">{p.payment_reference || "N/A"}</span>
                </div>
                <div className="text-sm text-neutral-300">
                  {p.customer_name} a envoyé <span className="font-bold">{p.total_price_usd} USD</span> pour {p.events?.title}
                </div>
              </div>

              <div className="flex w-full md:w-auto items-center space-x-3 pt-4 md:pt-0 border-t border-white/5 md:border-t-0">
                <form action={handleValidate} className="flex-1 md:flex-none">
                  <input type="hidden" name="orderId" value={p.id} />
                  <button 
                    type="submit"
                    className="w-full flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 text-black px-6 py-3 rounded-xl font-bold transition-colors"
                  >
                    <ShieldCheck className="w-5 h-5" />
                    <span>Valider</span>
                  </button>
                </form>
                <button className="flex items-center justify-center w-12 h-12 bg-neutral-800 hover:bg-red-500/20 hover:text-red-500 text-neutral-400 rounded-xl transition-colors">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
