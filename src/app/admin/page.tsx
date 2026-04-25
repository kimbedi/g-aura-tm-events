"use client";

import { motion } from "framer-motion";
import { DollarSign, Ticket, Activity, ChevronRight } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-bold mb-2">Dashboard Financier</h1>
        <p className="text-neutral-400 text-sm">Vue d'ensemble des revenus et de la billetterie.</p>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Revenus (USD)", value: "$10,582.50", icon: DollarSign, color: "text-yellow-500" },
          { label: "Billets Vendus", value: "342", icon: Ticket, color: "text-white" },
          { label: "En attente validation", value: "14", icon: Clock, color: "text-orange-400" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-5 bg-neutral-900 border border-white/5 rounded-2xl flex flex-col"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-neutral-400 text-sm font-medium">{stat.label}</span>
            </div>
            <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
          </motion.div>
        ))}
      </div>



      {/* Activité récente */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Activité Récente</h2>
          <button className="text-sm text-yellow-500 hover:text-yellow-400">Voir tout</button>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-center justify-between p-4 bg-neutral-900 border border-white/5 rounded-2xl">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 font-bold">
                  $
                </div>
                <div>
                  <div className="font-semibold text-sm">Paiement Validé - M-Pesa</div>
                  <div className="text-xs text-neutral-400">Billet VIP • Ref: 9XYZ876</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-sm">+$100.00</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Inline fix for missing icon
function Clock(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}
