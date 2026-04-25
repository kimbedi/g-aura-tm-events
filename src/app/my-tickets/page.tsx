import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Ticket, ArrowRight } from "lucide-react";

export default async function MyTicketsPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="min-h-screen bg-black pt-32 pb-24 px-6 max-w-2xl mx-auto text-center">
        <h1 className="text-3xl font-bold mb-4">Connectez-vous</h1>
        <p className="text-neutral-400 mb-8">Vous devez être connecté pour voir vos billets.</p>
        <Link href="/login">
          <button className="bg-white text-black font-bold px-8 py-4 rounded-xl hover:bg-neutral-200 transition-colors">Se connecter</button>
        </Link>
      </main>
    );
  }

  const { data: tickets, error } = await supabase
    .from("issued_tickets")
    .select(`
      *,
      events ( title, date_time, location, image_url ),
      orders!inner ( payment_method, payment_reference )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-black pt-32 pb-24 px-6 max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold mb-2">Mes <span className="text-yellow-500">Billets</span></h1>
      <p className="text-neutral-400 mb-10">Tous vos billets achetés sur G-Aura Events.</p>

      {(!tickets || tickets.length === 0) ? (
        <div className="text-center py-20 bg-neutral-900 border border-white/5 rounded-3xl">
          <Ticket className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
          <p className="text-neutral-500 mb-6">Vous n'avez aucun billet pour l'instant.</p>
          <Link href="/">
            <button className="bg-white text-black font-bold px-8 py-3 rounded-xl hover:bg-neutral-200 transition-colors">Voir les événements</button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((t: any) => {
            const isCash = t.orders.payment_method === "cash";
            const isScanned = t.status === "scanned";
            return (
              <Link key={t.id} href={`/tickets/${t.qr_code_hash}`}>
                <div className="bg-neutral-900 border border-white/5 rounded-2xl p-5 hover:border-yellow-500/30 transition-all group flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {t.events?.image_url ? (
                      <img src={t.events.image_url} alt={t.events.title} className="w-16 h-16 rounded-xl object-cover" />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-yellow-600 to-black flex items-center justify-center">
                        <Ticket className="w-6 h-6 text-yellow-500" />
                      </div>
                    )}
                    <div>
                      <div className="font-bold mb-1">{t.events?.title}</div>
                      <div className="text-sm text-neutral-400">{t.events?.date_time && new Date(t.events.date_time).toLocaleDateString('fr-FR')}</div>
                      <div className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full mt-1 ${isScanned ? "bg-neutral-600 text-neutral-300" : isCash ? "bg-orange-500/20 text-orange-400" : "bg-green-500/20 text-green-400"}`}>
                        {isScanned ? "Utilisé" : isCash ? "Cash à régler" : "Pré-payé ✓"}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-neutral-600 group-hover:text-yellow-500 transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
