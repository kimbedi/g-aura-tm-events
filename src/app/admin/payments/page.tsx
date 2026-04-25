"use client";

import { useEffect, useState } from "react";
import { getPendingOrders } from "@/app/actions/admin";
import { validateOrder, rejectOrder } from "@/app/actions/orders";
import { Check, X, Clock, DollarSign, User, Loader2, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminPaymentsPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      const data = await getPendingOrders();
      setOrders(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleValidate(id: string) {
    if (!confirm("Confirmer la réception du paiement ?")) return;
    setProcessingId(id);
    try {
      await validateOrder(id);
      await loadOrders();
    } catch (e) {
      alert("Erreur lors de la validation");
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject(id: string) {
    if (!confirm("Rejeter cette commande ?")) return;
    setProcessingId(id);
    try {
      await rejectOrder(id);
      await loadOrders();
    } catch (e) {
      alert("Erreur lors du rejet");
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-bold mb-2 tracking-tighter">Paiements à Valider</h1>
        <p className="text-neutral-400 text-sm">Vérifiez les références Mobile Money et générez les tickets.</p>
      </header>

      <div className="bg-neutral-900 border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[10px] uppercase text-neutral-500 font-black tracking-widest">
                <th className="px-6 py-4">Client / Référence</th>
                <th className="px-6 py-4">Détails Commande</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-yellow-500" />
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center text-neutral-500">
                    Aucun paiement en attente.
                  </td>
                </tr>
              ) : orders.map((order) => (
                <tr key={order.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-sm">{order.customer_name}</span>
                      {order.payment_method !== 'cash' && (
                        <span className="text-[10px] text-yellow-500 font-mono mt-1 bg-yellow-500/10 px-2 py-0.5 rounded-full w-fit uppercase">
                          Ref: {order.payment_reference}
                        </span>
                      )}
                      <span className="text-[10px] text-neutral-500 mt-1 italic">{order.customer_phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs">
                      <div className="text-white font-medium">{order.events?.title}</div>
                      <div className="text-neutral-500">{order.quantity}x {order.ticket_categories?.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-white">
                      {order.total_price_usd.toLocaleString()} <span className="text-[10px] text-neutral-500">USD</span>
                    </div>
                    <div className={`text-[10px] uppercase font-black tracking-tighter ${order.payment_method === 'cash' ? 'text-orange-500' : 'text-blue-500'}`}>
                      {order.payment_method}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleValidate(order.id)}
                        disabled={processingId === order.id}
                        className="bg-green-500 hover:bg-green-400 text-black p-2 rounded-xl transition-colors disabled:opacity-50"
                      >
                        {processingId === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={() => handleReject(order.id)}
                        disabled={processingId === order.id}
                        className="bg-neutral-800 hover:bg-red-500 hover:text-white text-neutral-400 p-2 rounded-xl transition-colors disabled:opacity-50"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
