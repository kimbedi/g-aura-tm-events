import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Ticket, Calendar, MapPin, Clock, ArrowRight, Smartphone } from "lucide-react";
import Link from "next/link";

export default async function MyTicketsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/tickets");
  }

  // Fetch tickets linked to this user via their orders
  const { data: tickets, error } = await supabase
    .from("issued_tickets")
    .select(`
      *,
      events (
        title,
        date_time,
        location,
        image_url
      ),
      ticket_categories (
        name
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching user tickets:", error);
  }

  return (
    <main className="min-h-screen bg-black pt-32 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-yellow-500 rounded-2xl flex items-center justify-center">
              <Ticket className="w-6 h-6 text-black" />
            </div>
            <h1 className="text-4xl font-black tracking-tighter uppercase">Mes Billets</h1>
          </div>
          <p className="text-neutral-500 max-w-xl font-medium">
            Retrouvez ici tous vos accès officiels pour les événements G-Aura. Présentez le QR Code à l'entrée.
          </p>
        </header>

        {(!tickets || tickets.length === 0) ? (
          <div className="bg-neutral-900/50 border border-white/5 rounded-[2.5rem] p-12 text-center">
            <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Ticket className="w-8 h-8 text-neutral-600" />
            </div>
            <h2 className="text-xl font-bold mb-2 text-white">Aucun billet trouvé</h2>
            <p className="text-neutral-500 mb-8 max-w-xs mx-auto">Vous n'avez pas encore de billets pour les événements à venir.</p>
            <Link 
              href="/events" 
              className="inline-flex items-center space-x-2 bg-yellow-500 text-black font-black px-8 py-4 rounded-full hover:bg-yellow-400 transition-all active:scale-95"
            >
              <span>Découvrir les événements</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tickets.map((t: any) => (
              <Link 
                key={t.id} 
                href={`/tickets/${t.qr_code_hash}`}
                className="group relative bg-neutral-900 border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-yellow-500/30 transition-all duration-500 shadow-2xl"
              >
                <div className="flex flex-col h-full">
                  {/* Event Thumbnail */}
                  <div className="relative aspect-video w-full overflow-hidden">
                    {t.events?.image_url ? (
                      <img 
                        src={t.events.image_url} 
                        alt={t.events.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      />
                    ) : (
                      <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                        <Ticket className="w-12 h-12 text-neutral-700" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                    
                    {/* Status Badge */}
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        t.status === 'available' ? 'bg-green-500 text-black' : 'bg-red-500 text-white'
                      }`}>
                        {t.status === 'available' ? 'Valide' : 'Scanné'}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-8 flex-1 flex flex-col">
                    <div className="text-[10px] text-yellow-500 font-black uppercase tracking-widest mb-2 opacity-80">
                      {t.ticket_categories?.name} Access
                    </div>
                    <h3 className="text-xl font-black text-white mb-4 group-hover:text-yellow-500 transition-colors uppercase tracking-tight leading-tight">
                      {t.events?.title}
                    </h3>

                    <div className="space-y-2 mb-6">
                      <div className="flex items-center text-neutral-400 text-xs">
                        <Calendar className="w-3.5 h-3.5 mr-2 text-neutral-600" />
                        {new Date(t.events?.date_time).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}
                      </div>
                      <div className="flex items-center text-neutral-400 text-xs">
                        <Clock className="w-3.5 h-3.5 mr-2 text-neutral-600" />
                        {new Date(t.events?.date_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}
                      </div>
                      <div className="flex items-center text-neutral-400 text-xs">
                        <MapPin className="w-3.5 h-3.5 mr-2 text-neutral-600" />
                        <span className="line-clamp-1">{t.events?.location}</span>
                      </div>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-6 border-t border-white/5">
                      <div className="flex items-center space-x-2 text-neutral-500">
                        <Smartphone className="w-4 h-4" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Afficher le QR</span>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-yellow-500 group-hover:text-black transition-all">
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
