"use client";

import { useState } from "react";
import { Smartphone, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { submitOrder } from "@/app/actions/checkout";

export default function CheckoutClient({ event }: { event: any }) {
  const [selectedMethod, setSelectedMethod] = useState<string>("airtel");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    formData.append("eventId", event.id);
    formData.append("paymentMethod", selectedMethod);
    formData.append("amount", event.price_usd.toString());
    
    // Server action to save order
    await submitOrder(formData);
    
    setIsSuccess(true);
    setIsSubmitting(false);
  };

  if (isSuccess) {
    return (
      <div className="bg-neutral-900 border border-white/5 rounded-3xl p-8 text-center flex flex-col items-center justify-center h-full min-h-[400px]">
        <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold mb-4">Paiement en cours de validation</h2>
        <p className="text-neutral-400 mb-8">
          Nous avons bien reçu votre référence. Un administrateur va vérifier la transaction d'ici quelques minutes. Votre billet numérique vous sera envoyé immédiatement après.
        </p>
        <button className="w-full py-3 bg-white text-black font-semibold rounded-xl hover:bg-neutral-200 transition-colors">
          Voir mes commandes
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-bold mb-4">1. Choisissez votre méthode de paiement</h3>
        <div className="grid grid-cols-2 gap-4">
          {['mpesa', 'airtel', 'orange', 'cash'].map((method) => (
            <button
              key={method}
              onClick={() => setSelectedMethod(method)}
              className={`p-4 rounded-xl border ${selectedMethod === method ? 'border-yellow-500 bg-yellow-500/10' : 'border-white/10 bg-neutral-900 hover:bg-neutral-800'} transition-all text-left flex flex-col`}
            >
              <span className="font-semibold capitalize">{method === 'mpesa' ? 'M-Pesa' : method === 'airtel' ? 'Airtel Money' : method === 'orange' ? 'Orange Money' : 'Cash à l\'entrée'}</span>
              <span className="text-xs text-neutral-400 mt-1">
                {method === 'cash' ? 'Payez sur place' : 'Paiement mobile'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {selectedMethod !== 'cash' && (
        <div className="p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl">
          <h4 className="font-bold text-yellow-500 mb-2">Instructions de transfert</h4>
          <p className="text-sm text-neutral-300 mb-4">
            Envoyez exactement <span className="font-bold text-white">${event.price_usd} USD</span> au numéro suivant via {selectedMethod} :
          </p>
          <div className="text-3xl font-mono tracking-wider font-bold mb-6">+243 99 300 2546</div>
          
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
            
            <label className="block text-sm font-medium text-neutral-400 mb-2 mt-4">
              Votre Nom complet
            </label>
            <input
              type="text"
              name="customerName"
              required
              placeholder="Jean Dupont"
              className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500 transition-colors mb-6"
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-neutral-200 transition-colors flex items-center justify-center disabled:opacity-50"
            >
              {isSubmitting ? "Validation en cours..." : "Confirmer mon paiement"}
            </button>
          </form>
        </div>
      )}

      {selectedMethod === 'cash' && (
        <form action={handleSubmit} className="p-6 bg-neutral-900 border border-white/10 rounded-2xl">
          <h4 className="font-bold text-white mb-4">Réservation pour paiement sur place</h4>
          
          <label className="block text-sm font-medium text-neutral-400 mb-2">
            Votre Nom complet
          </label>
          <input
            type="text"
            name="customerName"
            required
            placeholder="Jean Dupont"
            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500 transition-colors mb-6"
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-neutral-200 transition-colors flex items-center justify-center disabled:opacity-50"
          >
            {isSubmitting ? "Réservation en cours..." : "Confirmer ma réservation"}
          </button>
        </form>
      )}
    </div>
  );
}
