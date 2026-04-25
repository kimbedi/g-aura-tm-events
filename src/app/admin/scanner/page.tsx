"use client";

import { useState } from "react";
import { scanTicket } from "@/app/actions/scanner";
import { QrCode, CheckCircle2, XCircle, Loader2, User, Ticket, ShieldCheck, Smartphone, DollarSign } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ScannerPage() {
  const [qrInput, setQrInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  async function handleScan(e: React.FormEvent) {
    e.preventDefault();
    if (!qrInput) return;

    setLoading(true);
    setResult(null);
    setShowSuccess(false);
    try {
      const data = await scanTicket(qrInput);
      setResult(data);
      setQrInput("");
    } catch (err: any) {
      setResult({ success: false, message: err.message });
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm() {
    setLoading(true);
    try {
      const { confirmEntry } = await import("@/app/actions/scanner");
      await confirmEntry(result.ticketId);
      setResult(null);
      setShowSuccess(true);
      // Reset success after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (e) {
      alert("Erreur validation");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 max-w-md mx-auto relative">
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-green-500 flex flex-col items-center justify-center text-black p-10"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 12 }}
            >
              <CheckCircle2 className="w-40 h-40 mb-8" />
            </motion.div>
            <h2 className="text-5xl font-black text-center uppercase tracking-tighter leading-none">
              Entrée <br/> Validée !
            </h2>
            <p className="mt-6 font-bold text-lg opacity-80 italic">Suivant {"->"}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-yellow-500/10 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-yellow-500/20">
          <QrCode className="w-10 h-10 text-yellow-500" />
        </div>
        <h1 className="text-3xl font-black tracking-tighter uppercase">Scanner d'entrée</h1>
        <p className="text-neutral-500 text-sm mt-2 font-medium">Contrôlez la validité des accès G-Aura.</p>
      </div>

      <div className="w-full bg-neutral-900 border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent" />
        
        <form onSubmit={handleScan} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-4 text-center">Entrez le code du billet</label>
            <input 
              type="text" 
              value={qrInput}
              onChange={(e) => setQrInput(e.target.value)}
              placeholder="Ex: 550e8400-e29b..."
              className="w-full bg-black border border-white/10 rounded-2xl px-6 py-5 text-center text-lg font-mono focus:border-yellow-500 outline-none transition-all placeholder:text-neutral-800"
              autoFocus
            />
          </div>

          <button 
            type="submit" 
            disabled={loading || !qrInput}
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black py-5 rounded-2xl transition-all flex items-center justify-center space-x-3 disabled:opacity-30 active:scale-95"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
              <>
                <ShieldCheck className="w-6 h-6" />
                <span>Valider l'Accès</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Result Display */}
      <AnimatePresence>
        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mt-8 w-full p-8 rounded-[2.5rem] border flex flex-col items-center text-center shadow-2xl ${
              !result.success ? 'bg-red-500/10 border-red-500/20' : 
              result.paymentMethod === 'cash' ? 'bg-orange-500/10 border-orange-500/30' : 
              'bg-blue-500/10 border-blue-500/30'
            }`}
          >
            {result.success ? (
              <>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${
                   result.paymentMethod === 'cash' ? 'bg-orange-500 text-white' : 'bg-blue-500 text-white'
                }`}>
                  {result.paymentMethod === 'cash' ? <DollarSign className="w-10 h-10" /> : <Smartphone className="w-10 h-10" />}
                </div>

                <h2 className={`text-2xl font-black uppercase mb-2 ${
                  result.paymentMethod === 'cash' ? 'text-orange-500' : 'text-blue-400'
                }`}>
                  {result.paymentMethod === 'cash' ? "Paiement Cash" : "Paiement Mobile"}
                </h2>

                <div className="space-y-4 mt-4 w-full">
                  <div className="bg-white/5 p-4 rounded-2xl">
                    <div className="text-[10px] text-neutral-500 uppercase font-black mb-1">Détenteur</div>
                    <div className="text-white font-bold text-lg">{result.owner}</div>
                  </div>

                  {result.paymentMethod !== 'cash' ? (
                    <div className="bg-blue-500/20 p-4 rounded-2xl border border-blue-500/30">
                      <div className="text-[10px] text-blue-300 uppercase font-black mb-1">Code SMS à vérifier</div>
                      <div className="text-blue-400 font-mono text-2xl font-black tracking-widest">{result.paymentRef || "---"}</div>
                    </div>
                  ) : (
                    <div className="bg-orange-500/20 p-4 rounded-2xl border border-orange-500/30">
                      <div className="text-[10px] text-orange-300 uppercase font-black mb-1">Montant à encaisser</div>
                      <div className="text-orange-500 font-black text-3xl tracking-tighter">${result.amount?.toFixed(2)}</div>
                    </div>
                  )}
                </div>

                <button 
                  onClick={handleConfirm}
                  disabled={loading}
                  className={`w-full mt-8 py-5 rounded-2xl font-black uppercase tracking-widest transition-all active:scale-95 ${
                    result.paymentMethod === 'cash' ? 'bg-orange-500 text-white' : 'bg-blue-500 text-white'
                  }`}
                >
                  {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : "Confirmer et Laisser Passer"}
                </button>
              </>
            ) : (
              <>
                <XCircle className="w-16 h-16 text-red-500 mb-4" />
                <h2 className="text-2xl font-black text-red-500 uppercase mb-2">{result.message}</h2>
                <div className="text-neutral-400 text-sm font-medium">{result.owner || "Billet inconnu"}</div>
                {result.scannedAt && (
                  <div className="mt-4 text-[10px] text-red-500/50 uppercase font-bold">
                    Déjà scanné le {new Date(result.scannedAt).toLocaleString('fr-FR')}
                  </div>
                )}
              </>
            )}
            
            <button 
              onClick={() => setResult(null)}
              className="mt-8 text-neutral-500 text-[10px] font-black hover:text-white uppercase tracking-widest"
            >
              Annuler / Retour
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


