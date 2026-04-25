"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Ticket, Calendar, MapPin, QrCode, Loader2, Download } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTickets();
  }, []);

  async function loadTickets() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("issued_tickets")
      .select("*, events(*), ticket_categories(*), orders(*)")
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    else setTickets(data);
    
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-black pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-bold mb-4 tracking-tighter">Mes Billets</h1>
          <p className="text-neutral-400">Retrouvez ici tous vos accès pour les événements G-Aura.</p>
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-20 bg-neutral-900/50 rounded-[3rem] border border-white/5">
            <Ticket className="w-16 h-16 mx-auto mb-6 text-neutral-700" />
            <h2 className="text-xl font-bold mb-4">Aucun billet trouvé</h2>
            <p className="text-neutral-500 mb-8 max-w-xs mx-auto">Vos billets apparaîtront ici une fois que votre paiement aura été validé par l'équipe.</p>
            <Link href="/events">
              <button className="bg-yellow-500 text-black font-bold px-8 py-3 rounded-full hover:bg-yellow-400 transition-colors">
                Découvrir les événements
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {tickets.map((ticket) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={ticket.id} 
                className="bg-neutral-900 border border-white/5 rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row shadow-2xl"
              >
                {/* Visual Part */}
                <div className="md:w-64 aspect-square md:aspect-auto bg-neutral-800 relative">
                  {ticket.events?.image_url ? (
                    <img src={ticket.events.image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-neutral-600">
                      <Ticket className="w-16 h-16" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4 bg-yellow-500 text-black text-[10px] font-black px-2 py-1 rounded uppercase">
                    {ticket.ticket_categories?.name}
                  </div>
                </div>

                {/* Info Part */}
                <div className="flex-1 p-8">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-6 tracking-tight">{ticket.events?.title}</h3>
                      <div className="space-y-3">
                        <div className="flex items-center text-sm text-neutral-400">
                          <Calendar className="w-4 h-4 mr-3 text-yellow-500" />
                          {new Date(ticket.events?.date_time).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="flex items-center text-sm text-neutral-400">
                          <MapPin className="w-4 h-4 mr-3 text-yellow-500" />
                          {ticket.events?.location}
                        </div>
                        
                        {/* Infos de paiement pour l'agent */}
                        <div className="mt-6 p-4 bg-white/5 rounded-2xl border border-white/5">
                          <div className="text-[10px] text-neutral-500 uppercase font-black mb-2">Mode de paiement</div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-bold uppercase text-yellow-500">{ticket.orders?.payment_method}</span>
                            {ticket.orders?.payment_reference && (
                              <span className="text-sm font-mono text-white bg-white/10 px-2 py-0.5 rounded">Ref: {ticket.orders.payment_reference}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* QR Code Section */}
                    <div className="bg-white p-4 rounded-3xl w-40 h-40 flex items-center justify-center shadow-xl self-center md:self-start">
                      <div className="text-black text-center">
                        <QrCode className="w-24 h-24 mx-auto mb-1" />
                        <span className="text-[8px] font-mono opacity-50 truncate block w-24 mx-auto">{ticket.qr_code_hash}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                    <div className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest">
                      Billet N° {ticket.id.substring(0, 8)}
                    </div>
                    {ticket.status === 'scanned' && (
                      <span className="text-[10px] bg-red-500/20 text-red-400 px-3 py-1 rounded-full font-bold uppercase">
                        Déjà utilisé
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
