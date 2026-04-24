"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { QrCode, ScanLine, XCircle, CheckCircle2 } from "lucide-react";

export default function ScannerApp() {
  const [scanStatus, setScanStatus] = useState<"idle" | "scanning" | "success" | "invalid">("idle");
  const [ticketData, setTicketData] = useState<any>(null);

  const simulateScan = () => {
    setScanStatus("scanning");
    setTimeout(() => {
      // Simulation: 80% chance of success
      if (Math.random() > 0.2) {
        setTicketData({ type: "VIP", owner: "Jean Dupont", id: "T-987654" });
        setScanStatus("success");
      } else {
        setScanStatus("invalid");
      }
    }, 1500);
  };

  const resetScanner = () => {
    setScanStatus("idle");
    setTicketData(null);
  };

  return (
    <div className="h-[calc(100vh-140px)] md:h-screen w-full bg-black flex flex-col">
      <header className="p-4 flex items-center justify-between border-b border-white/5 bg-neutral-900">
        <h1 className="font-bold flex items-center">
          <QrCode className="w-5 h-5 mr-2 text-yellow-500" />
          Scanner G-AURA
        </h1>
        <div className="px-3 py-1 rounded-full bg-green-500/20 text-green-500 text-xs font-bold uppercase">
          En Ligne
        </div>
      </header>

      {/* Camera Viewport (Simulated) */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-neutral-950">
        {scanStatus === "idle" || scanStatus === "scanning" ? (
          <>
            {/* Fake Camera Feed Background */}
            <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1540039155732-684736822262?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')] bg-cover bg-center blur-sm" />
            
            <div className="relative z-10 w-64 h-64 border-2 border-yellow-500/50 rounded-3xl flex flex-col items-center justify-center">
              {/* Animated Scan Line */}
              <motion.div
                animate={{ top: ["0%", "100%", "0%"] }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="absolute w-full h-0.5 bg-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.8)]"
              />
              <ScanLine className="w-12 h-12 text-yellow-500/50 mb-4" />
              <p className="text-sm font-medium text-white/70">Pointez le QR Code</p>
            </div>
            
            <button 
              onClick={simulateScan}
              className="absolute bottom-10 left-1/2 -translate-x-1/2 px-8 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full font-medium transition-all"
            >
              {scanStatus === "scanning" ? "Analyse..." : "Simuler un Scan"}
            </button>
          </>
        ) : scanStatus === "success" ? (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="z-10 w-full max-w-sm p-6"
          >
            <div className="bg-green-500 rounded-3xl p-8 text-center text-black">
              <CheckCircle2 className="w-20 h-20 mx-auto mb-4" />
              <h2 className="text-3xl font-black mb-2 uppercase">Billet Valide</h2>
              <div className="bg-black/10 rounded-2xl p-4 mt-6">
                <div className="text-sm font-medium opacity-80 mb-1">Détenteur</div>
                <div className="text-xl font-bold mb-4">{ticketData.owner}</div>
                <div className="text-sm font-medium opacity-80 mb-1">Catégorie</div>
                <div className="text-2xl font-black">{ticketData.type}</div>
              </div>
            </div>
            <button 
              onClick={resetScanner}
              className="w-full mt-6 py-4 bg-white text-black font-bold rounded-2xl"
            >
              Scanner le suivant
            </button>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="z-10 w-full max-w-sm p-6"
          >
            <div className="bg-red-500 rounded-3xl p-8 text-center text-white">
              <XCircle className="w-20 h-20 mx-auto mb-4" />
              <h2 className="text-3xl font-black mb-2 uppercase">Billet Invalide</h2>
              <p className="font-medium opacity-90 mt-4">
                Ce billet n'existe pas ou a déjà été scanné.
              </p>
            </div>
            <button 
              onClick={resetScanner}
              className="w-full mt-6 py-4 bg-white text-black font-bold rounded-2xl"
            >
              Réessayer
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
