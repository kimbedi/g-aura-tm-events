import { useCartStore } from "@/store/cartStore";
import { useState, useEffect } from "react";
import { ArrowLeft, Ticket, CreditCard, Smartphone, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function MerchCheckoutPage() {
  const [mounted, setMounted] = useState(false);
  const { items, clearCart } = useCartStore();
  const [phone, setPhone] = useState("");
  const [paymentState, setPaymentState] = useState<"idle" | "awaiting_pin" | "success" | "error">("idle");
  const router = useRouter();
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;

    setPaymentState("awaiting_pin");

    setTimeout(() => {
      clearCart();
      setPaymentState("success");
    }, 4000);
  };

  if (!mounted) return null;

  if (paymentState === "success") {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-green-500 rounded-3xl p-8 text-center text-black shadow-2xl">
          <CheckCircle2 className="w-20 h-20 mx-auto mb-6" />
          <h1 className="text-3xl font-black uppercase mb-4">Paiement Réussi !</h1>
          <p className="font-medium text-lg opacity-90 mb-8">
            Votre commande Merch a été validée. L'équipe prépare votre colis.
          </p>
          <Link href="/merch">
            <button className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-neutral-900 transition-colors uppercase tracking-wide">
              Retour à la boutique
            </button>
          </Link>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-black pt-32 pb-24 px-6 max-w-7xl mx-auto text-center">
        <h1 className="text-3xl font-bold mb-4">Votre panier est vide</h1>
        <Link href="/merch" className="text-yellow-500 hover:text-yellow-400">
          Retourner à la boutique
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-32 pb-24 px-6 max-w-7xl mx-auto">
      <Link href="/merch" className="inline-flex items-center text-neutral-400 hover:text-white mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Retour à la boutique
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Résumé Panier */}
        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <Ticket className="w-6 h-6 mr-3 text-yellow-500" />
            Votre Panier
          </h2>
          <div className="bg-neutral-900 border border-white/5 rounded-3xl p-6 md:p-8 space-y-6">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between border-b border-white/5 pb-4 last:border-0 last:pb-0">
                <div className="flex items-center space-x-4">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-16 h-16 rounded-lg object-cover bg-neutral-800" />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-neutral-800" />
                  )}
                  <div>
                    <div className="font-bold">{item.name}</div>
                    <div className="text-sm text-neutral-400">Qté: {item.quantity}</div>
                  </div>
                </div>
                <div className="font-bold text-lg">${(item.price * item.quantity).toFixed(2)}</div>
              </div>
            ))}
            
            <div className="pt-4 border-t border-white/10 flex justify-between items-center text-xl">
              <span className="font-medium text-neutral-400">Total</span>
              <span className="font-black text-white">${total.toFixed(2)} USD</span>
            </div>
          </div>
        </div>

        {/* Formulaire API Automatisé */}
        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <CreditCard className="w-6 h-6 mr-3 text-yellow-500" />
            Paiement Mobile
          </h2>
          
          {paymentState === "awaiting_pin" ? (
            <div className="bg-neutral-900 border border-white/5 rounded-3xl p-8 text-center flex flex-col items-center justify-center h-[400px]">
              <Loader2 className="w-16 h-16 text-yellow-500 animate-spin mb-6" />
              <h2 className="text-2xl font-bold mb-4">Vérifiez votre téléphone</h2>
              <p className="text-neutral-400">
                Un pop-up Airtel Money a été envoyé au <span className="text-white font-bold">{phone}</span>.<br/>
                Veuillez entrer votre code PIN pour autoriser le prélèvement de ${total.toFixed(2)}.
              </p>
            </div>
          ) : (
            <div className="bg-neutral-900 border border-white/5 rounded-3xl p-6 md:p-8">
              <div className="flex justify-center space-x-4 mb-6">
                <Smartphone className="w-12 h-12 text-yellow-500" />
              </div>
              <p className="text-neutral-400 mb-8 text-center">
                Entrez votre numéro Airtel Money. Un pop-up s'affichera directement sur votre téléphone pour valider l'achat. Zéro transfert manuel nécessaire !
              </p>
              
              <form onSubmit={handlePayment}>
                <label className="block text-sm font-medium text-neutral-400 mb-2">
                  Numéro Airtel Money
                </label>
                <div className="flex mb-6">
                  <div className="bg-neutral-800 border border-white/10 border-r-0 rounded-l-xl px-4 py-3 text-neutral-400 font-bold flex items-center">
                    +243
                  </div>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="99 300 2546"
                    className="w-full bg-black border border-white/10 rounded-r-xl px-4 py-3 text-white font-bold tracking-wider focus:outline-none focus:border-yellow-500 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-yellow-500 text-black font-black py-4 rounded-xl hover:bg-yellow-400 transition-colors text-lg uppercase tracking-wide"
                >
                  Payer ${total.toFixed(2)}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
