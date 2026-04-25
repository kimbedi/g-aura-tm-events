"use client";

import { useState, useTransition } from "react";
import { Loader2, RotateCcw, Save, AlertOctagon } from "lucide-react";
import { reactivatePlatform, setDebtLimit } from "@/app/actions/commissions";
import { useRouter } from "next/navigation";

export default function CommissionsControls({
  debtLimit,
  totalDue,
  isLocked,
}: {
  debtLimit: number;
  totalDue: number;
  isLocked: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [limitInput, setLimitInput] = useState<string>(debtLimit.toString());
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  const usagePct = Math.min(100, Math.round((totalDue / Math.max(debtLimit, 1)) * 100));

  function handleSaveLimit() {
    const value = Number(limitInput);
    if (!Number.isFinite(value) || value <= 0) {
      setMessage({ kind: "error", text: "Entre un montant supérieur à 0." });
      return;
    }
    setMessage(null);
    startTransition(async () => {
      const res = await setDebtLimit(value);
      if (res.success) {
        setMessage({ kind: "success", text: `Seuil mis à jour : $${value.toFixed(2)} USD.` });
        router.refresh();
      } else {
        setMessage({ kind: "error", text: res.error || "Erreur inconnue." });
      }
    });
  }

  function handleReactivate() {
    if (!confirm(`Confirmer : marquer toutes les commissions en attente ($${totalDue.toFixed(2)}) comme reçues sur Koho ?\nCela débloque immédiatement la plateforme pour le client.`)) {
      return;
    }
    setMessage(null);
    startTransition(async () => {
      const res = await reactivatePlatform();
      if (res.success) {
        setMessage({ kind: "success", text: `Plateforme réactivée. ${res.paidCount ?? 0} commission(s) marquée(s) payée(s).` });
        router.refresh();
      } else {
        setMessage({ kind: "error", text: res.error || "Erreur inconnue." });
      }
    });
  }

  return (
    <div className="bg-neutral-900 border border-white/5 rounded-3xl p-8 space-y-8">
      <div>
        <h2 className="text-xl font-bold mb-2 flex items-center">
          <AlertOctagon className="w-5 h-5 mr-3 text-yellow-500" />
          Verrouillage automatique
        </h2>
        <p className="text-sm text-neutral-400">
          Quand le solde dû atteint le seuil, le dashboard et le scanner du client sont bloqués.
          Tu reçois ton paiement Koho hors plateforme, puis tu cliques sur <span className="text-white font-semibold">Réactiver</span>.
        </p>
      </div>

      {/* Threshold control */}
      <div>
        <label className="block text-xs font-bold text-neutral-500 uppercase mb-2 tracking-widest">
          Seuil de blocage (USD)
        </label>
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-bold">$</span>
            <input
              type="number"
              min={1}
              step={1}
              value={limitInput}
              onChange={(e) => setLimitInput(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-xl pl-8 pr-4 py-3 text-base font-bold focus:border-yellow-500 outline-none"
            />
          </div>
          <button
            onClick={handleSaveLimit}
            disabled={pending}
            className="flex items-center gap-2 bg-yellow-500 text-black font-bold px-5 py-3 rounded-xl hover:bg-yellow-400 transition-colors disabled:opacity-50"
          >
            {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Enregistrer</span>
          </button>
        </div>

        {/* Progress bar: how close totalDue is to the limit */}
        <div className="mt-4">
          <div className="flex justify-between text-[10px] uppercase font-black tracking-widest text-neutral-500 mb-2">
            <span>Solde dû actuel</span>
            <span className={isLocked ? "text-red-400" : "text-neutral-400"}>
              ${totalDue.toFixed(2)} / ${debtLimit.toFixed(2)} USD ({usagePct}%)
            </span>
          </div>
          <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-700 ${
                usagePct >= 100 ? "bg-red-500" : usagePct >= 75 ? "bg-yellow-500" : "bg-green-500"
              }`}
              style={{ width: `${usagePct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Reactivate */}
      <div className="border-t border-white/5 pt-8">
        <label className="block text-xs font-bold text-neutral-500 uppercase mb-3 tracking-widest">
          Réactivation manuelle
        </label>
        <button
          onClick={handleReactivate}
          disabled={pending || totalDue === 0}
          className={`flex items-center gap-3 w-full md:w-auto px-6 py-4 rounded-xl font-bold transition-colors ${
            totalDue === 0
              ? "bg-neutral-800 text-neutral-500 cursor-not-allowed"
              : "bg-green-500 text-black hover:bg-green-400"
          }`}
        >
          {pending ? <Loader2 className="w-5 h-5 animate-spin" /> : <RotateCcw className="w-5 h-5" />}
          <span>
            {totalDue === 0
              ? "Aucune commission en attente"
              : `Marquer $${totalDue.toFixed(2)} comme reçus & réactiver`}
          </span>
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-sm font-medium ${
            message.kind === "success"
              ? "bg-green-500/10 border border-green-500/30 text-green-400"
              : "bg-red-500/10 border border-red-500/30 text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
