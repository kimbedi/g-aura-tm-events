"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Smartphone, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CheckoutClient({ event }: { event: any }) {
  const [phone, setPhone] = useState("");
  const [paymentState, setPaymentState] = useState<"idle" | "awaiting_pin" | "success" | "error">("idle");
  const router = useRouter();

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;

    // 1. Simuler l'appel à l'API de l'Agrégateur (ex: Maxicash)
    setPaymentState("awaiting_pin");

    // 2. Simuler l'attente que le client valide sur son téléphone (Pop-up Airtel)
    setTimeout(() => {
      // 3. Simuler la réception du Webhook "SUCCESS" et la redirection vers le billet
      setPaymentState("success");
      
      // Après 2 secondes de succès, on l'envoie vers son faux billet (en réalité on redirige vers /tickets/[vrai_hash])
      setTimeout(() => {
        router.push(`/tickets/test-auto-hash`);
      }, 2000);
      
    }, 4000);
  };

  if (paymentState === "success") {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-green-500 rounded-3xl p-8 text-center text-black flex flex-col items-center justify-center h-full min-h-[400px]"
      >
        <CheckCircle2 className="w-20 h-20 mb-6" />
        <h2 className="text-3xl font-black uppercase mb-4">Paiement Réussi !</h2>
        <p className="font-medium text-lg opacity-90">
          Votre billet numérique a été généré avec succès.
        </p>
        <p className="text-sm mt-4 opacity-75">Redirection vers le billet...</p>
      </motion.div>
    );
  }

  if (paymentState === "awaiting_pin") {
    return (
      <div className="bg-neutral-900 border border-white/5 rounded-3xl p-8 text-center flex flex-col items-center justify-center h-full min-h-[400px]">
        <Loader2 className="w-16 h-16 text-yellow-500 animate-spin mb-6" />
        <h2 className="text-2xl font-bold mb-4">Vérifiez votre téléphone</h2>
        <p className="text-neutral-400">
          Un pop-up Airtel Money a été envoyé au <span className="text-white font-bold">{phone}</span>.<br/>
          Veuillez entrer votre code PIN pour autoriser le prélèvement de ${event.price_usd}.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-neutral-900 border border-white/5 rounded-3xl p-6 md:p-8">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <Smartphone className="w-6 h-6 mr-3 text-yellow-500" />
        Airtel Money (Paiement Direct)
      </h2>
      
      <p className="text-neutral-400 mb-8">
        Entrez votre numéro Airtel Money. Un pop-up s'affichera directement sur votre téléphone pour valider l'achat. Zéro transfert manuel nécessaire !
      </p>

      <form onSubmit={handlePayment}>
        <label className="block text-sm font-medium text-neutral-400 mb-2">
          Numéro Airtel Money
        </label>
        <div className="flex mb-6">
          <div className="bg-neutral-800 border border-white/10 border-r-0 rounded-l-xl px-4 py-3 text-neutral-400 font-bold flex items-center">
            +243
          </div>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="99 300 2546"
            className="w-full bg-black border border-white/10 rounded-r-xl px-4 py-3 text-white font-bold tracking-wider focus:outline-none focus:border-yellow-500 transition-colors"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-yellow-500 text-black font-black py-4 rounded-xl hover:bg-yellow-400 transition-colors text-lg uppercase tracking-wide"
        >
          Payer ${event.price_usd}
        </button>
      </form>
    </div>
  );
}
