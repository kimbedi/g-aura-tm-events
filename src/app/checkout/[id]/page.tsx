import { getEventById } from "@/app/actions/events";
import { notFound } from "next/navigation";
import CheckoutClient from "./CheckoutClient";

export default async function CheckoutPage({ params }: { params: { id: string } }) {
  const event = await getEventById(params.id);

  if (!event) {
    notFound();
  }

  return (
    <main className="min-h-screen pt-32 pb-24 px-6 max-w-7xl mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">
          FINALISER <span className="text-yellow-500">L'ACHAT</span>
        </h1>
        <p className="text-neutral-400 text-lg">Paiement automatisé via Airtel Money (Simulation API).</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Résumé de la commande */}
        <div>
          <div className="bg-neutral-900 border border-white/5 rounded-3xl p-6 md:p-8 sticky top-32">
            <h2 className="text-2xl font-bold mb-6">Résumé</h2>
            
            <div className="flex items-start space-x-4 mb-8">
              {event.image_url ? (
                <img src={event.image_url} alt={event.title} className="w-24 h-24 rounded-2xl object-cover" />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-neutral-800" />
              )}
              <div>
                <h3 className="font-bold text-lg mb-1">{event.title}</h3>
                <div className="text-neutral-400 text-sm mb-1">{new Date(event.date_time).toLocaleDateString('fr-FR')}</div>
                <div className="text-yellow-500 font-bold">${event.price_usd} USD</div>
              </div>
            </div>

            <div className="space-y-4 border-t border-white/10 pt-6">
              <div className="flex justify-between text-neutral-400">
                <span>Billet standard (1x)</span>
                <span>${event.price_usd}</span>
              </div>
              <div className="flex justify-between text-xl font-bold pt-4 border-t border-white/10">
                <span>Total</span>
                <span>${event.price_usd} USD</span>
              </div>
            </div>
          </div>
        </div>

        {/* Formulaire API Automatisé */}
        <CheckoutClient event={event} />
      </div>
    </main>
  );
}
