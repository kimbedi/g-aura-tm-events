import { createClient } from "@/utils/supabase/server";
import { FileText, Send } from "lucide-react";
import Link from "next/link";
import TicketDeleteButton from "./TicketDeleteButton";

export default async function AdminTicketsPage() {
  const supabase = await createClient();

  const { data: tickets, error } = await supabase
    .from("issued_tickets")
    .select(`
      *,
      events ( title )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching tickets:", error);
  }

  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://g-aura-tm-events.vercel.app";

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center">
          <FileText className="w-6 h-6 mr-3 text-yellow-500" />
          Billets Générés
        </h1>
        <p className="text-neutral-400 text-sm">
          Liste de tous les billets valides. Vous pouvez les envoyer aux clients par WhatsApp, très pratique pour les paiements Cash !
        </p>
      </header>

      <div className="space-y-4">
        {(!tickets || tickets.length === 0) && (
          <div className="text-center py-20 text-neutral-500">
            Aucun billet n'a encore été généré.
          </div>
        )}
        {tickets && tickets.map((t: any) => {
          const ticketUrl = `${BASE_URL}/tickets/${t.qr_code_hash}`;
          const whatsappMsg = encodeURIComponent(`Bonjour ${t.owner_name} ! 🎉 Voici votre billet officiel pour l'événement ${t.events?.title}. Cliquez ici pour l'afficher à l'entrée : ${ticketUrl}`);
          // Pour l'instant on ouvre un lien universel WhatsApp. On pourrait pré-remplir le numéro si on le récupérait de la table order.
          const whatsappLink = `https://wa.me/?text=${whatsappMsg}`;

          return (
            <div
              key={t.id}
              className="bg-neutral-900 border border-white/5 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${t.status === 'available' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                    {t.status === 'available' ? 'Valide' : 'Scanné'}
                  </span>
                  <span className="text-sm text-neutral-400">
                    {new Date(t.created_at).toLocaleString('fr-FR')}
                  </span>
                </div>
                <div className="text-lg font-bold text-white mb-1">
                  Billet de : <span className="text-yellow-500">{t.owner_name}</span>
                </div>
                <div className="text-sm text-neutral-300">
                  {t.events?.title}
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-4 md:pt-0 border-t border-white/5 md:border-t-0 w-full md:w-auto">
                <Link
                  href={`/tickets/${t.qr_code_hash}`}
                  target="_blank"
                  className="flex-1 md:flex-none text-center px-4 py-2 border border-white/10 hover:bg-white/5 text-white rounded-xl text-sm font-medium transition-colors"
                >
                  Voir Billet
                </Link>
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 md:flex-none flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 text-black px-4 py-2 rounded-xl text-sm font-bold transition-colors"
                >
                  <Send className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>
                <TicketDeleteButton ticketId={t.id} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
