"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Ticket, ShieldAlert } from "lucide-react";
import { useState } from "react";

export default function CheckoutPage({ params }: { params: { id: string } }) {
  const [selectedMethod, setSelectedMethod] = useState<string>("mpesa");
  const [refCode, setRefCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulation API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 2000);
  };

  if (isSuccess) {
    return (
      <main className="min-h-screen pt-32 pb-24 px-6 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-neutral-900 border border-white/5 rounded-3xl p-8 text-center"
        >
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
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-32 pb-24 px-6 max-w-4xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tighter mb-8">
        FINALISER <span className="text-yellow-500">L'ACHAT</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Formulaire de paiement */}
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
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl"
            >
              <h4 className="font-bold text-yellow-500 mb-2">Instructions de transfert</h4>
              <p className="text-sm text-neutral-300 mb-4">
                Envoyez exactement <span className="font-bold text-white">100 USD</span> au numéro suivant via {selectedMethod} :
              </p>
              <div className="text-3xl font-mono tracking-wider font-bold mb-6">+243 81 000 0000</div>
              
              <form onSubmit={handleSubmit}>
                <label className="block text-sm font-medium text-neutral-400 mb-2">
                  Code de référence de la transaction (SMS)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 8X9Y7Z6W"
                  value={refCode}
                  onChange={(e) => setRefCode(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500 transition-colors mb-6"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center space-x-2 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-black px-6 py-4 rounded-xl font-bold transition-all"
                >
                  {isSubmitting ? (
                    <span className="animate-pulse">Vérification...</span>
                  ) : (
                    <>
                      <ShieldAlert className="w-5 h-5" />
                      <span>Soumettre pour validation</span>
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          )}

          {selectedMethod === 'cash' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              <button
                onClick={handleSubmit}
                className="w-full flex items-center justify-center space-x-2 bg-white text-black hover:bg-neutral-200 px-6 py-4 rounded-xl font-bold transition-all"
              >
                <Ticket className="w-5 h-5" />
                <span>Réserver mon billet (Paiement sur place)</span>
              </button>
            </motion.div>
          )}
        </div>

        {/* Résumé de la commande */}
        <div className="bg-neutral-900 border border-white/5 rounded-3xl p-8 h-fit">
          <h3 className="text-xl font-bold mb-6">Résumé de la commande</h3>
          <div className="flex justify-between items-start mb-4 pb-4 border-b border-white/10">
            <div>
              <div className="font-medium text-white mb-1">Billet VIP - G-Aura Night</div>
              <div className="text-sm text-neutral-400">1 x Billet</div>
            </div>
            <div className="font-semibold text-white">100 USD</div>
          </div>
          <div className="flex justify-between items-center mb-8">
            <span className="text-neutral-400">Taxes & Frais</span>
            <span className="text-white">0 USD</span>
          </div>
          <div className="flex justify-between items-center text-xl font-bold text-yellow-500">
            <span>Total</span>
            <span>100 USD</span>
          </div>
        </div>
      </div>
    </main>
  );
}
