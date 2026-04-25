"use client";

import { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { motion } from "framer-motion";
import { QrCode, ScanLine, XCircle, CheckCircle2 } from "lucide-react";
import { scanTicket } from "@/app/actions/scanner";

export default function ScannerApp() {
  const [scanStatus, setScanStatus] = useState<"idle" | "scanning" | "success" | "invalid">("idle");
  const [ticketData, setTicketData] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;
    
    if (scanStatus === "idle" || scanStatus === "scanning") {
      scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );
      
      scanner.render(
        (decodedText) => {
          if (scanStatus !== "scanning") {
            handleScan(decodedText);
            scanner?.clear();
          }
        },
        (error) => {
          // Ignorer les erreurs de scan continu
        }
      );
    }

    return () => {
      scanner?.clear().catch(e => console.error("Failed to clear scanner", e));
    };
  }, [scanStatus]);

  const handleScan = async (hashToScan: string) => {
    setScanStatus("scanning");
    
    try {
      const result = await scanTicket(hashToScan);
      
      if (result.success && result.data) {
        setTicketData(result.data);
        setScanStatus("success");
      } else {
        setErrorMessage(result.message || "Erreur de scan");
        setTicketData(result.data || null);
        setScanStatus("invalid");
      }
    } catch (error) {
      setErrorMessage("Erreur réseau. Réessayez.");
      setScanStatus("invalid");
    }
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

      {/* Camera Viewport */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-neutral-950">
        {(scanStatus === "idle" || scanStatus === "scanning") ? (
          <div className="w-full h-full flex items-center justify-center">
            <div id="reader" className="w-full max-w-sm overflow-hidden rounded-3xl border-2 border-yellow-500/50" />
          </div>
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
                {errorMessage || "Ce billet n'existe pas ou a déjà été scanné."}
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
