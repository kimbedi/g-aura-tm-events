"use client";

import { useState } from "react";
import { Smartphone, CheckCircle2, Loader2, ArrowRight, Calendar, Clock, MapPin } from "lucide-react";
import { submitOrder } from "@/app/actions/checkout";
import { formatNumber } from "@/utils/format";

export default function CheckoutClient({ event, userProfile }: { event: any, userProfile: any }) {
  // Sort categories by price ascending
  const sortedCategories = [...(event.ticket_categories || [])].sort((a, b) => a.price_usd - b.price_usd);
  
  const [selectedCategory, setSelectedCategory] = useState<any>(sortedCategories[0] || null);
  const [selectedMethod, setSelectedMethod] = useState<string>("mobile");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const priceUSD = selectedCategory ? formatNumber(selectedCategory.price_usd) : "0";

  const handleSubmit = async (formData: FormData) => {
    if (!selectedCategory) return alert("Veuillez choisir une catégorie");
    
    setIsSubmitting(true);
    formData.append("eventId", event.id);
    formData.append("categoryId", selectedCategory.id);
    formData.append("paymentMethod", selectedMethod);
    formData.append("amountCdf", selectedCategory.price_usd.toString());
    
    const result = await submitOrder(formData);
    
    if (result.success && result.qrHash) {
      window.location.href = `/tickets/${result.qrHash}`;
    } else {
      setIsSubmitting(false);
      alert(result.error || "Une erreur est survenue.");
    }
  };

  // La vue de succès est maintenant le billet lui-même (Redirection)
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
      {/* Colonne de GAUCHE : L'Événement & Choix du Billet */}
      <div className="relative group flex flex-col">
        <div className="flex-1 relative bg-neutral-900 border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col">
          {/* Image (Flyer Adaptatif) */}
          <div className="relative bg-neutral-800 border-b border-white/5">
            {event.image_url ? (
              <img src={event.image_url} alt={event.title} className="w-full h-auto block max-h-[400px] object-contain" />
            ) : (
              <div className="aspect-video w-full flex items-center justify-center text-neutral-600 text-xs uppercase tracking-widest font-black">Flyer Indisponible</div>
            )}
          </div>

          <div className="p-8 flex-1 flex flex-col">
            {/* Titre et Infos de base */}
            <div className="mb-8">
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4 leading-none">
                {event.title}
              </h2>
              
              <div className="flex flex-wrap gap-y-3 gap-x-6 text-neutral-400">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-yellow-500" />
                  <span className="text-xs font-bold uppercase tracking-tight">
                    {new Date(event.date_time).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-yellow-500" />
                  <span className="text-xs font-bold uppercase tracking-tight">
                    {new Date(event.date_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-yellow-500" />
                  <span className="text-xs font-bold uppercase tracking-tight line-clamp-1">{event.location}</span>
                </div>
              </div>
            </div>

            {/* Sélecteur de Billets Esthétique */}
            <div className="mb-8">
              <label className="block text-[10px] text-neutral-500 uppercase font-black tracking-[0.2em] mb-4">Sélectionnez votre type de billet</label>
              <div className="grid grid-cols-2 gap-3">
                {sortedCategories.map((cat: any) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat)}
                    className={`relative p-4 rounded-2xl border text-left transition-all duration-300 ${
                      selectedCategory?.id === cat.id 
                      ? 'border-yellow-500 bg-yellow-500/10' 
                      : 'border-white/5 bg-black/40 hover:bg-neutral-800'
                    }`}
                  >
                    <span className={`block text-xs font-black uppercase tracking-widest mb-1 ${selectedCategory?.id === cat.id ? 'text-yellow-500' : 'text-neutral-500'}`}>
                      {cat.name}
                    </span>
                    <span className="block text-xl font-black text-white">
                      {formatNumber(cat.price_usd)} <span className="text-[10px] text-neutral-500">USD</span>
                    </span>
                    {selectedCategory?.id === cat.id && (
                      <div className="absolute top-3 right-3">
                        <CheckCircle2 className="w-4 h-4 text-yellow-500" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Total Section (Sticky Bottom of card) */}
            <div className="mt-auto pt-6 border-t border-dashed border-white/10 flex justify-between items-center">
              <div>
                <span className="block text-[9px] text-neutral-500 uppercase font-black tracking-widest mb-1">Prix total du billet</span>
                <div className="flex items-baseline space-x-1">
                  <span className="text-4xl font-black text-yellow-500 tracking-tighter">{priceUSD}</span>
                  <span className="text-sm font-bold text-yellow-500">USD</span>
                </div>
              </div>
              <div className="bg-white/5 px-4 py-2 rounded-full border border-white/5">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">1 Personne</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Colonne de DROITE : Paiement (Ajusté) */}
      <div className="space-y-6">
        <div className="bg-neutral-900 border border-white/10 p-6 rounded-[2rem] shadow-xl">
          <h3 className="text-[10px] font-black mb-5 uppercase tracking-[0.2em] text-neutral-500">Mode de Paiement</h3>
          
          <div className="grid grid-cols-1 gap-3 mb-6">
            <button
              onClick={() => setSelectedMethod('mobile')}
              className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${selectedMethod === 'mobile' ? 'border-yellow-500 bg-yellow-500/10' : 'border-white/5 bg-black/40 hover:bg-neutral-800'}`}
            >
              <div className="flex items-center space-x-3">
                <Smartphone className={`w-5 h-5 ${selectedMethod === 'mobile' ? 'text-yellow-500' : 'text-neutral-500'}`} />
                <div className="text-left">
                  <span className={`block text-base font-black uppercase tracking-tight ${selectedMethod === 'mobile' ? 'text-white' : 'text-neutral-400'}`}>Paiement Mobile</span>
                  <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wide">M-Pesa, Airtel, Orange</span>
                </div>
              </div>
            </button>

            <button
              onClick={() => setSelectedMethod('cash')}
              className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${selectedMethod === 'cash' ? 'border-yellow-500 bg-yellow-500/10' : 'border-white/5 bg-black/40 hover:bg-neutral-800'}`}
            >
              <div className="flex items-center space-x-3">
                <CheckCircle2 className={`w-5 h-5 ${selectedMethod === 'cash' ? 'text-white' : 'text-neutral-500'}`} />
                <div className="text-left">
                  <span className={`block text-base font-black uppercase tracking-tight ${selectedMethod === 'cash' ? 'text-white' : 'text-neutral-400'}`}>Paiement en Argent</span>
                  <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wide">Régler cash sur place</span>
                </div>
              </div>
            </button>
          </div>

          {selectedMethod === 'mobile' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-3 duration-400">
              <div className="bg-black/60 p-5 rounded-2xl border border-white/5 text-center">
                <span className="block text-[9px] text-neutral-500 font-black uppercase tracking-widest mb-1">Transfert au numéro</span>
                <span className="text-2xl font-mono font-black text-white tracking-tighter">+243 837 264 005</span>
              </div>
              
              <form action={handleSubmit} className="space-y-3">
                <input
                  type="text"
                  name="refCode"
                  required
                  placeholder="RÉFÉRENCE SMS"
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3.5 text-xs font-bold text-white focus:outline-none focus:border-yellow-500 placeholder:text-neutral-700"
                />
                <input
                  type="text"
                  name="customerName"
                  required
                  defaultValue={userProfile?.full_name || ""}
                  placeholder="VOTRE NOM COMPLET"
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3.5 text-xs font-bold text-white focus:outline-none focus:border-yellow-500 placeholder:text-neutral-700"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-yellow-500 text-black font-black py-4 rounded-xl text-xs hover:bg-yellow-400 transition-all shadow-lg active:scale-[0.98] uppercase tracking-widest"
                >
                  {isSubmitting ? "Validation..." : "Confirmer"}
                </button>
              </form>
            </div>
          )}

          {selectedMethod === 'cash' && (
            <form action={handleSubmit} className="space-y-4 animate-in fade-in slide-in-from-top-3 duration-400">
              <input
                type="text"
                name="customerName"
                required
                defaultValue={userProfile?.full_name || ""}
                placeholder="VOTRE NOM COMPLET"
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3.5 text-xs font-bold text-white focus:outline-none focus:border-yellow-500 placeholder:text-neutral-700"
              />
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <p className="text-[10px] text-neutral-500 text-center leading-tight">
                  Réglez <span className="text-white font-black">{priceUSD} USD</span> cash à l'entrée.
                </p>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-white text-black font-black py-4 rounded-xl text-xs hover:bg-neutral-200 transition-all active:scale-[0.98] uppercase tracking-widest"
              >
                {isSubmitting ? "Réservation..." : "Réserver"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
