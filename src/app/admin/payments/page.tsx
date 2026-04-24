"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, XCircle, Search, Clock } from "lucide-react";

// Données fictives simulant les achats en attente
const DUMMY_PENDING = [
  { id: "1", customer: "Jean Dupont", method: "M-Pesa", ref: "9X7Y6Z5", amount: "100 USD", time: "Il y a 5 min", ticket: "VIP" },
  { id: "2", customer: "Sarah K.", method: "Airtel Money", ref: "A1B2C3D", amount: "50 USD", time: "Il y a 12 min", ticket: "Standard" },
  { id: "3", customer: "Marc L.", method: "Orange Money", ref: "O-987654", amount: "100 USD", time: "Il y a 25 min", ticket: "VIP" },
];

export default function PaymentsValidationPage() {
  const [payments, setPayments] = useState(DUMMY_PENDING);

  const handleValidate = (id: string) => {
    // Animation out
    setPayments(payments.filter(p => p.id !== id));
    // Ici, une requête API générera le billet et enverra l'email
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
        <AnimatePresence>
          {payments.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 text-neutral-500">
              Aucun paiement en attente. Beau travail !
            </motion.div>
          )}
          {payments.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, height: 0, marginBottom: 0 }}
              className="bg-neutral-900 border border-white/5 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="bg-yellow-500/20 text-yellow-500 text-xs font-bold px-2 py-1 rounded uppercase">
                    {p.method}
                  </span>
                  <span className="text-sm text-neutral-400">{p.time}</span>
                </div>
                <div className="text-lg font-bold text-white mb-1">
                  Réf: <span className="font-mono text-yellow-500">{p.ref}</span>
                </div>
                <div className="text-sm text-neutral-300">
                  {p.customer} a envoyé <span className="font-bold">{p.amount}</span> pour 1x Billet {p.ticket}
                </div>
              </div>

              <div className="flex w-full md:w-auto items-center space-x-3 pt-4 md:pt-0 border-t border-white/5 md:border-t-0">
                <button 
                  onClick={() => handleValidate(p.id)}
                  className="flex-1 md:flex-none flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 text-black px-6 py-3 rounded-xl font-bold transition-colors"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>Valider</span>
                </button>
                <button className="flex items-center justify-center w-12 h-12 bg-neutral-800 hover:bg-red-500/20 hover:text-red-500 text-neutral-400 rounded-xl transition-colors">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
