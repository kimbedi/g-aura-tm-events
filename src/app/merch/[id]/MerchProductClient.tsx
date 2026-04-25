"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Check, Info, Smartphone, Banknote, ShieldCheck, ArrowLeft, Loader2, Star } from "lucide-react";
import Link from "next/link";
import { submitMerchOrder } from "@/app/actions/merch";
import { formatNumber } from "@/utils/format";

export default function MerchProductClient({ product }: { product: any }) {
  const [selectedVariant, setSelectedVariant] = useState<any>(product.merch_variants?.[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [step, setStep] = useState<'selection' | 'checkout' | 'success'>('selection');
  const [paymentMethod, setPaymentMethod] = useState<'mobile_money' | 'cash'>('mobile_money');
  const [loading, setLoading] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [refCode, setRefCode] = useState("");

  async function handleOrder(e: React.FormEvent) {
    e.preventDefault();
    if (paymentMethod === 'mobile_money' && !refCode) {
      alert("Veuillez entrer la référence SMS de votre paiement.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("productId", product.id);
    formData.append("variantId", selectedVariant.id);
    formData.append("quantity", quantity.toString());
    formData.append("customerName", name);
    formData.append("customerPhone", phone);
    formData.append("paymentMethod", paymentMethod);
    formData.append("refCode", refCode);
    formData.append("totalPrice", (product.base_price_usd * quantity).toString());

    try {
      const result = await submitMerchOrder(formData);
      if (result.success) {
        setStep('success');
      } else {
        alert(result.error);
      }
    } catch (e) {
      alert("Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  if (step === 'success') {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(34,197,94,0.3)]">
            <Check className="w-12 h-12 text-black" />
          </div>
          <h1 className="text-5xl font-black tracking-tighter uppercase mb-4">Commande Reçue !</h1>
          <p className="text-neutral-400 mb-12 max-w-md mx-auto">
            Merci pour votre achat. Votre commande est en cours de traitement. Un agent G-Aura vous contactera pour organiser le retrait.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
             <Link href="/merch" className="w-full sm:w-auto bg-neutral-900 text-white px-8 py-4 rounded-full font-black uppercase tracking-widest hover:bg-neutral-800 transition-all">
              Boutique
            </Link>
            <Link href="/" className="w-full sm:w-auto bg-yellow-500 text-black px-8 py-4 rounded-full font-black uppercase tracking-widest hover:bg-yellow-400 transition-all shadow-xl">
              Accueil
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
      {/* Left: Product Images */}
      <div className="space-y-4 sticky top-32">
        <div className="aspect-[4/5] bg-neutral-900 rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl">
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
        </div>
        <div className="flex space-x-4">
           <div className="w-24 h-24 bg-neutral-900 rounded-2xl border-2 border-yellow-500 overflow-hidden cursor-pointer">
              <img src={product.image_url} className="w-full h-full object-cover" />
           </div>
           {/* Placeholders for more images if any */}
        </div>
      </div>

      {/* Right: Product Details & Order Flow */}
      <div className="flex flex-col">
        <Link href="/merch" className="flex items-center text-neutral-500 hover:text-white transition-colors mb-8 text-sm font-black uppercase tracking-widest">
          <ArrowLeft className="w-4 h-4 mr-2" /> Retour boutique
        </Link>

        <div className="inline-flex items-center space-x-2 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 rounded-full mb-6 w-fit">
          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
          <span className="text-[9px] font-black uppercase tracking-widest text-yellow-500">Premium Quality</span>
        </div>

        <h1 className="text-5xl font-black tracking-tighter uppercase mb-4 leading-tight">{product.name}</h1>
        <div className="text-3xl font-black text-white mb-8">
          {formatNumber(product.base_price_usd)} <span className="text-sm font-medium text-neutral-500">CDF</span>
        </div>

        <p className="text-neutral-400 mb-10 leading-relaxed font-medium">{product.description}</p>

        {step === 'selection' ? (
          <div className="space-y-10">
            {/* Variant Selection */}
            <div>
              <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-4">Choisir la Taille</label>
              <div className="flex flex-wrap gap-3">
                {product.merch_variants?.map((v: any) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    disabled={v.stock_count === 0}
                    className={`min-w-[60px] h-14 rounded-2xl border-2 font-black transition-all flex items-center justify-center ${
                      v.stock_count === 0 
                        ? "border-neutral-900 text-neutral-800 cursor-not-allowed" 
                        : selectedVariant?.id === v.id
                        ? "border-yellow-500 bg-yellow-500 text-black shadow-lg shadow-yellow-500/20"
                        : "border-white/10 text-white hover:border-white/30"
                    }`}
                  >
                    {v.size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-4">Quantité</label>
              <div className="flex items-center space-x-6 bg-neutral-900 w-fit p-1 rounded-2xl border border-white/5">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-12 rounded-xl hover:bg-white/5 transition-all text-xl font-black">-</button>
                <span className="text-xl font-black w-8 text-center">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(selectedVariant?.stock_count || 10, quantity + 1))} className="w-12 h-12 rounded-xl hover:bg-white/5 transition-all text-xl font-black">+</button>
              </div>
            </div>

            <button 
              onClick={() => setStep('checkout')}
              disabled={!selectedVariant || selectedVariant.stock_count === 0}
              className="w-full bg-white text-black font-black py-6 rounded-3xl uppercase tracking-widest text-lg hover:bg-yellow-500 transition-all flex items-center justify-center space-x-3 shadow-2xl active:scale-95"
            >
              <ShoppingBag className="w-6 h-6" />
              <span>Commander Maintenant</span>
            </button>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8 bg-neutral-900/50 p-8 rounded-[2.5rem] border border-white/5">
             <div className="flex items-center justify-between border-b border-white/5 pb-6">
                <h2 className="text-xl font-black uppercase tracking-tight">Détails de Commande</h2>
                <button onClick={() => setStep('selection')} className="text-[10px] font-black text-neutral-500 uppercase hover:text-white underline underline-offset-4">Modifier</button>
             </div>

             <form onSubmit={handleOrder} className="space-y-6">
                <div className="space-y-4">
                  <input 
                    type="text" 
                    placeholder="Votre Nom Complet" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 focus:border-yellow-500 outline-none transition-all" 
                  />
                  <input 
                    type="tel" 
                    placeholder="Téléphone (WhatsApp de préférence)" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 focus:border-yellow-500 outline-none transition-all" 
                  />
                </div>

                <div className="space-y-4">
                  <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest">Mode de Paiement</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('mobile_money')}
                      className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center space-y-2 transition-all ${paymentMethod === 'mobile_money' ? 'border-blue-500 bg-blue-500/10' : 'border-white/5 bg-black'}`}
                    >
                      <Smartphone className={`w-6 h-6 ${paymentMethod === 'mobile_money' ? 'text-blue-500' : 'text-neutral-500'}`} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Mobile Money</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cash')}
                      className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center space-y-2 transition-all ${paymentMethod === 'cash' ? 'border-orange-500 bg-orange-500/10' : 'border-white/5 bg-black'}`}
                    >
                      <Banknote className={`w-6 h-6 ${paymentMethod === 'cash' ? 'text-orange-500' : 'text-neutral-500'}`} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Cash / Event</span>
                    </button>
                  </div>
                </div>

                {paymentMethod === 'mobile_money' && (
                  <div className="p-6 bg-blue-900/10 border border-blue-500/20 rounded-3xl">
                    <h3 className="text-blue-400 font-black text-xs uppercase tracking-widest mb-4 flex items-center">
                      <Info className="w-4 h-4 mr-2" /> Instructions de Paiement
                    </h3>
                    <p className="text-neutral-400 text-xs mb-6 leading-relaxed">
                      Envoyez le montant exact vers le numéro suivant : <br/>
                      <span className="text-white font-black text-lg">081 234 5678 (G-AURA)</span><br/>
                      Puis entrez la référence SMS reçue ci-dessous.
                    </p>
                    <input 
                      type="text" 
                      placeholder="Référence SMS (ex: 1234567)" 
                      value={refCode}
                      onChange={(e) => setRefCode(e.target.value)}
                      className="w-full bg-black border border-blue-500/30 rounded-2xl px-6 py-4 text-center font-mono text-blue-400 focus:border-blue-500 outline-none" 
                    />
                  </div>
                )}

                <div className="pt-6">
                  <div className="flex items-center justify-between mb-8">
                    <span className="text-neutral-500 font-bold uppercase tracking-widest text-[10px]">Total à régler</span>
                    <span className="text-2xl font-black text-white">{formatNumber(product.base_price_usd * quantity)} <span className="text-xs">CDF</span></span>
                  </div>

                  <button 
                    type="submit"
                    disabled={loading}
                    className={`w-full py-6 rounded-3xl font-black uppercase tracking-widest flex items-center justify-center space-x-3 transition-all active:scale-95 ${paymentMethod === 'cash' ? 'bg-orange-500 text-black' : 'bg-blue-500 text-white'}`}
                  >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                      <>
                        <ShieldCheck className="w-6 h-6" />
                        <span>Confirmer l'Achat</span>
                      </>
                    )}
                  </button>
                </div>
             </form>
          </motion.div>
        )}

        <div className="mt-10 p-6 bg-neutral-900/30 border border-white/5 rounded-3xl flex items-start space-x-4">
           <Info className="w-5 h-5 text-neutral-500 mt-1" />
           <p className="text-[10px] text-neutral-500 leading-relaxed font-medium">
             Une fois la commande validée par notre équipe, vous recevrez un message de confirmation. Les produits sont à retirer directement lors des événements G-Aura ou à nos points de retrait partenaires.
           </p>
        </div>
      </div>
    </div>
  );
}
