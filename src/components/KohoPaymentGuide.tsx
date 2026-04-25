"use client";

import { useState } from "react";
import { Copy, CheckCheck, ExternalLink } from "lucide-react";

const KOHO_DETAILS = {
  beneficiaryName: "G-AURA TM EVENTS",
  bankName: "Peoples Trust Company (KOHO)",
  institution: "621", // À remplacer par ton vrai numéro d'institution Koho
  transit: "00001", // À remplacer par ton vrai numéro de transit Koho
  account: "VOTRE_NUMERO_COMPTE_KOHO", // À remplacer
  country: "Canada",
  currency: "CAD",
};

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-neutral-800 border border-white/5 rounded-xl p-4 flex items-center justify-between">
      <div>
        <div className="text-xs text-neutral-500 uppercase tracking-wider mb-1">{label}</div>
        <div className="font-mono font-bold text-white text-lg">{value}</div>
      </div>
      <button
        onClick={handleCopy}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-bold transition-all ${
          copied ? "bg-green-500/20 text-green-400" : "bg-white/10 hover:bg-white/20 text-neutral-300"
        }`}
      >
        {copied ? <CheckCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        <span>{copied ? "Copié !" : "Copier"}</span>
      </button>
    </div>
  );
}

export default function KohoPaymentGuide({ amountOwed }: { amountOwed: number }) {
  if (amountOwed <= 0) return null;

  const worldRemitUrl = `https://www.worldremit.com/en/send-money-to/canada`;

  return (
    <div className="bg-neutral-900 border border-yellow-500/20 rounded-3xl p-6 md:p-8 mt-8">
      <h2 className="text-xl font-bold text-yellow-500 mb-2">💳 Guide de Paiement</h2>
      <p className="text-neutral-400 text-sm mb-6">
        Utilisez ces informations pour envoyer le montant des commissions via <strong className="text-white">WorldRemit</strong> depuis votre Airtel Money.
      </p>

      {/* Montant à envoyer */}
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-5 mb-6 text-center">
        <div className="text-sm text-yellow-400 font-medium mb-1">Montant à envoyer</div>
        <div className="text-4xl font-black text-white">${amountOwed.toFixed(2)} USD</div>
        <div className="text-xs text-neutral-400 mt-1">Commission plateforme (15%)</div>
      </div>

      {/* Étapes */}
      <div className="space-y-2 mb-6">
        <div className="text-sm font-bold text-neutral-300 mb-3">🪜 Étapes sur WorldRemit :</div>
        {[
          "Ouvrez WorldRemit sur votre téléphone",
          `Sélectionnez : Envoyer vers le Canada • ${amountOwed.toFixed(2)} USD`,
          "Méthode de paiement : Airtel Money",
          "Entrez les coordonnées bancaires ci-dessous",
          "Confirmez et envoyez !",
        ].map((step, i) => (
          <div key={i} className="flex items-start space-x-3 text-sm text-neutral-400">
            <span className="w-6 h-6 rounded-full bg-neutral-700 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
              {i + 1}
            </span>
            <span>{step}</span>
          </div>
        ))}
      </div>

      {/* Champs copiables */}
      <div className="space-y-3 mb-6">
        <div className="text-sm font-bold text-neutral-300 mb-2">📋 Coordonnées bancaires (appuyez pour copier) :</div>
        <CopyField label="Nom du bénéficiaire" value={KOHO_DETAILS.beneficiaryName} />
        <CopyField label="Banque" value={KOHO_DETAILS.bankName} />
        <CopyField label="Numéro d'institution" value={KOHO_DETAILS.institution} />
        <CopyField label="Numéro de transit" value={KOHO_DETAILS.transit} />
        <CopyField label="Numéro de compte" value={KOHO_DETAILS.account} />
        <CopyField label="Pays" value={KOHO_DETAILS.country} />
        <CopyField label="Devise" value={KOHO_DETAILS.currency} />
      </div>

      {/* Bouton WorldRemit */}
      <a
        href={worldRemitUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full flex items-center justify-center space-x-2 bg-yellow-500 hover:bg-yellow-400 text-black font-black py-4 rounded-2xl transition-colors text-lg"
      >
        <ExternalLink className="w-5 h-5" />
        <span>Ouvrir WorldRemit</span>
      </a>

      <p className="text-center text-xs text-neutral-600 mt-4">
        Après le transfert, votre administrateur au Québec marquera la commission comme reçue et le site sera déverrouillé.
      </p>
    </div>
  );
}
