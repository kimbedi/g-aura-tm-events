"use client";

import { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { motion } from "framer-motion";
import { QrCode, XCircle, CheckCircle2, MessageSquare, Banknote } from "lucide-react";
import { getTicketInfo, approveAndScanTicket } from "@/app/actions/scanner";

export default function ScannerApp() {
  const [scanStatus, setScanStatus] = useState<"idle" | "scanning" | "success" | "invalid" | "verify_sms" | "collect_cash">("idle");
  const [ticketData, setTicketData] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

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
      const result = await getTicketInfo(hashToScan);
      
      if (!result.success || !result.ticket) {
        setErrorMessage(result.message || "Billet introuvable");
        setScanStatus("invalid");
        return;
      }

      const ticket = result.ticket;
      setTicketData(ticket);

      if (ticket.status === "scanned") {
        setErrorMessage(`Déjà scanné le ${new Date(ticket.scanned_at).toLocaleString('fr-FR')}`);
        setScanStatus("invalid");
        return;
      }

      if (ticket.status === "pending_validation") {
        if (ticket.orders.payment_method === "cash") {
          setScanStatus("collect_cash");
        } else {
          setScanStatus("verify_sms");
        }
      } else if (ticket.status === "available") {
        // Technically shouldn't happen with our new flow, but just in case
        await handleApprove(ticket.id, ticket.orders.id);
      }

    } catch (error) {
      setErrorMessage("Erreur réseau. Réessayez.");
      setScanStatus("invalid");
    }
  };

  const handleApprove = async (ticketId: string, orderId: string) => {
    setIsProcessing(true);
    const result = await approveAndScanTicket(ticketId, orderId);
    setIsProcessing(false);
    
    if (result.success) {
      setScanStatus("success");
    } else {
      setErrorMessage(result.message || "Erreur lors de l'approbation");
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
          Scanner Porte
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
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="z-10 w-full max-w-sm p-6">
            <div className="bg-green-500 rounded-3xl p-8 text-center text-black">
              <CheckCircle2 className="w-20 h-20 mx-auto mb-4" />
              <h2 className="text-3xl font-black mb-2 uppercase">Approuvé</h2>
              <div className="bg-black/10 rounded-2xl p-4 mt-6">
                <div className="text-sm font-medium opacity-80 mb-1">Détenteur</div>
                <div className="text-xl font-bold mb-4">{ticketData?.owner_name}</div>
                <div className="text-sm font-medium opacity-80 mb-1">Événement</div>
                <div className="text-xl font-black">{ticketData?.events?.title}</div>
              </div>
            </div>
            <button onClick={resetScanner} className="w-full mt-6 py-4 bg-white text-black font-bold rounded-2xl">
              Scanner le suivant
            </button>
          </motion.div>
        ) : scanStatus === "verify_sms" ? (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="z-10 w-full max-w-sm p-6">
            <div className="bg-blue-600 rounded-3xl p-8 text-center text-white">
              <MessageSquare className="w-20 h-20 mx-auto mb-4" />
              <h2 className="text-2xl font-black mb-2 uppercase">Vérifier SMS</h2>
              <p className="font-medium opacity-90 mt-2 mb-6">Confirmez que vous avez bien reçu ce transfert :</p>
              <div className="bg-black/20 rounded-2xl p-4 mb-6">
                <div className="text-sm font-medium opacity-80 mb-1">Code Réf SMS</div>
                <div className="text-3xl font-mono text-yellow-400 font-bold">{ticketData?.orders?.payment_reference || "AUCUN"}</div>
              </div>
              <div className="flex space-x-3">
                <button onClick={resetScanner} className="flex-1 py-4 bg-white/10 border border-white/20 text-white font-bold rounded-xl hover:bg-white/20">Refuser</button>
                <button onClick={() => handleApprove(ticketData.id, ticketData.orders.id)} disabled={isProcessing} className="flex-1 py-4 bg-white text-blue-900 font-bold rounded-xl disabled:opacity-50">Approuver</button>
              </div>
            </div>
          </motion.div>
        ) : scanStatus === "collect_cash" ? (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="z-10 w-full max-w-sm p-6">
            <div className="bg-orange-500 rounded-3xl p-8 text-center text-white">
              <Banknote className="w-20 h-20 mx-auto mb-4 text-white" />
              <h2 className="text-2xl font-black mb-2 uppercase">Récolter Cash</h2>
              <p className="font-medium opacity-90 mt-2 mb-6">Demandez l'argent liquide au client avant d'approuver :</p>
              <div className="bg-black/20 rounded-2xl p-4 mb-6">
                <div className="text-sm font-medium opacity-80 mb-1">Montant à payer</div>
                <div className="text-4xl font-black text-white">{ticketData?.events?.price_usd} USD</div>
              </div>
              <div className="flex space-x-3">
                <button onClick={resetScanner} className="flex-1 py-4 bg-white/10 border border-white/20 text-white font-bold rounded-xl hover:bg-white/20">Annuler</button>
                <button onClick={() => handleApprove(ticketData.id, ticketData.orders.id)} disabled={isProcessing} className="flex-1 py-4 bg-white text-orange-900 font-bold rounded-xl disabled:opacity-50">Argent Reçu</button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="z-10 w-full max-w-sm p-6">
            <div className="bg-red-600 rounded-3xl p-8 text-center text-white shadow-2xl shadow-red-900/50 border-4 border-red-400">
              <XCircle className="w-20 h-20 mx-auto mb-4" />
              <h2 className="text-3xl font-black mb-2 uppercase">Billet Invalide</h2>
              <p className="font-bold text-lg mt-4 px-2">
                {errorMessage || "Fraude détectée ou billet inexistant."}
              </p>
            </div>
            <button onClick={resetScanner} className="w-full mt-6 py-4 bg-white text-black font-bold rounded-2xl hover:bg-neutral-200 transition-colors">
              Réessayer
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
