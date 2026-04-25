"use client";

import { useCartStore } from "@/store/cartStore";
import { useState, useEffect } from "react";
import { ArrowLeft, Ticket, CreditCard, Smartphone, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { submitOrder } from "@/app/actions/checkout";

export default function MerchCheckoutPage() {
  const [mounted, setMounted] = useState(false);
  const { items, clearCart } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    
    // In a real app we'd create a specific merch order. For MVP, we reuse submitOrder 
    // but pass dummy eventId to satisfy the schema (or make event_id nullable in schema).
    // For now, we simulate the submission
    setTimeout(() => {
      clearCart();
      setIsSuccess(true);
      setIsSubmitting(false);
    }, 2000);
  };

  if (!mounted) return null;

  if (isSuccess) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-neutral-900 border border-white/10 rounded-3xl p-8 text-center shadow-2xl">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-black" />
          </div>
          <h1 className="text-3xl font-bold mb-4 text-white">Commande Confirmée</h1>
          <p className="text-neutral-400 mb-8">
            Votre paiement est en cours de vérification par notre équipe. Vous recevrez une confirmation de livraison sous peu.
          </p>
          <Link href="/merch">
            <button className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-neutral-200 transition-colors">
              Retour à la boutique
            </button>
          </Link>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-black pt-32 pb-24 px-6 max-w-7xl mx-auto text-center">
        <h1 className="text-3xl font-bold mb-4">Votre panier est vide</h1>
        <Link href="/merch" className="text-yellow-500 hover:text-yellow-400">
          Retourner à la boutique
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-32 pb-24 px-6 max-w-7xl mx-auto">
      <Link href="/merch" className="inline-flex items-center text-neutral-400 hover:text-white mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Retour à la boutique
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Résumé Panier */}
        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <Ticket className="w-6 h-6 mr-3 text-yellow-500" />
            Votre Panier
          </h2>
          <div className="bg-neutral-900 border border-white/5 rounded-3xl p-6 md:p-8 space-y-6">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between border-b border-white/5 pb-4 last:border-0 last:pb-0">
                <div className="flex items-center space-x-4">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-16 h-16 rounded-lg object-cover bg-neutral-800" />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-neutral-800" />
                  )}
                  <div>
                    <div className="font-bold">{item.name}</div>
                    <div className="text-sm text-neutral-400">Qté: {item.quantity}</div>
                  </div>
                </div>
                <div className="font-bold text-lg">${(item.price * item.quantity).toFixed(2)}</div>
              </div>
            ))}
            
            <div className="pt-4 border-t border-white/10 flex justify-between items-center text-xl">
              <span className="font-medium text-neutral-400">Total</span>
              <span className="font-black text-white">${total.toFixed(2)} USD</span>
            </div>
          </div>
        </div>

        {/* Formulaire de paiement M-Pesa / Airtel */}
        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <CreditCard className="w-6 h-6 mr-3 text-yellow-500" />
            Paiement Mobile
          </h2>
          <div className="bg-neutral-900 border border-white/5 rounded-3xl p-6 md:p-8 relative overflow-hidden">
            
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-6 mb-8 text-center">
              <div className="flex justify-center space-x-4 mb-4">
                <Smartphone className="w-8 h-8 text-yellow-500" />
              </div>
              <p className="text-sm text-neutral-300 mb-4">
                Envoyez exactement <span className="font-bold text-white">${total.toFixed(2)}</span> au numéro officiel de la boutique via Airtel Money :
              </p>
              <div className="text-3xl font-mono tracking-wider font-bold mb-6 text-yellow-500">+243 99 300 2546</div>
              
              <form action={handleSubmit}>
                <label className="block text-sm font-medium text-neutral-400 mb-2">
                  Code de référence de la transaction (SMS)
                </label>
                <input
                  type="text"
                  name="refCode"
                  required
                  placeholder="Ex: 8X9Y7Z6W"
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500 transition-colors mb-6"
                />
                
                <label className="block text-sm font-medium text-neutral-400 mb-2 text-left mt-4">
                  Votre Numéro de Téléphone
                </label>
                <input
                  type="text"
                  name="phone"
                  required
                  placeholder="+243..."
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500 transition-colors mb-6"
                />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-neutral-200 transition-colors flex items-center justify-center disabled:opacity-50"
                >
                  {isSubmitting ? "Validation en cours..." : "Soumettre la commande Merch"}
                </button>
              </form>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
