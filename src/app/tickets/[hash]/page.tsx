import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { QrCode, Ticket, Calendar, MapPin, User } from "lucide-react";
import QRCode from "react-qr-code"; // We need to install this

export default async function TicketPage({ params }: { params: { hash: string } }) {
  const supabase = await createClient();

  // Fetch ticket details based on secure hash
  const { data: ticket, error } = await supabase
    .from("issued_tickets")
    .select(`
      *,
      events ( title, location, date_time, image_url )
    `)
    .eq("qr_code_hash", params.hash)
    .single();

  if (error || !ticket) {
    notFound();
  }

  const isScanned = ticket.status !== "available";

  return (
    <main className="min-h-screen bg-neutral-950 pt-24 pb-12 px-6 flex items-center justify-center">
      <div className="max-w-md w-full bg-neutral-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        {/* En-tête Event */}
        <div className="h-48 relative bg-neutral-800">
          {ticket.events.image_url ? (
            <img src={ticket.events.image_url} alt={ticket.events.title} className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-600 to-black" />
          )}
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute bottom-4 left-6 right-6">
            <h1 className="text-2xl font-bold text-white mb-1 drop-shadow-md">{ticket.events.title}</h1>
            <div className="flex items-center text-yellow-500 text-sm font-medium">
              <Calendar className="w-4 h-4 mr-1" />
              {new Date(ticket.events.date_time).toLocaleDateString('fr-FR')}
            </div>
          </div>
        </div>

        {/* Corps du Billet */}
        <div className="p-8 text-center relative bg-white text-black">
          {isScanned && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full flex justify-center z-10 pointer-events-none opacity-20">
              <span className="text-red-600 text-6xl font-black uppercase tracking-widest border-8 border-red-600 p-4 transform rotate-[-15deg]">
                UTILISÉ
              </span>
            </div>
          )}
          
          <div className="mb-8">
            <div className="text-sm text-neutral-500 font-medium mb-1">Détenteur du billet</div>
            <div className="text-xl font-bold flex items-center justify-center">
              <User className="w-5 h-5 mr-2 text-neutral-400" />
              {ticket.owner_name}
            </div>
          </div>

          <div className="flex items-center justify-center mb-8 border-y border-neutral-200 py-6">
            <div className="text-center px-4 border-r border-neutral-200">
              <div className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Catégorie</div>
              <div className="text-xl font-black text-yellow-600">VIP</div> {/* Dummy, in real life fetch from ticket_categories */}
            </div>
            <div className="text-center px-4">
              <div className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Entrée</div>
              <div className="text-xl font-black">1 Personne</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl mx-auto w-fit mb-4 border-2 border-neutral-100">
            <QRCode value={params.hash} size={192} />
          </div>
          
          <p className="text-xs text-neutral-500 font-mono tracking-widest">
            {params.hash.substring(0, 12).toUpperCase()}...
          </p>
        </div>

        {/* Footer */}
        <div className="bg-neutral-100 p-6 flex items-center justify-center text-neutral-500 text-xs text-center border-t border-neutral-200 dashed-border">
          <div className="absolute -top-3 -left-3 w-6 h-6 rounded-full bg-neutral-950" />
          <div className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-neutral-950" />
          Présentez ce code QR à l'entrée. Billet non remboursable.
        </div>
      </div>

      <style>{`
        .dashed-border {
          border-top: 2px dashed #e5e5e5;
        }
      `}</style>
    </main>
  );
}
