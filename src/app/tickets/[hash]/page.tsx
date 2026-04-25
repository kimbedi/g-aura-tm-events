import { createAdminClient } from "@/utils/supabase/admin";
import { notFound } from "next/navigation";
import { Calendar, User, Banknote, MessageSquare, Clock, MapPin, Smartphone } from "lucide-react";
import QRCode from "react-qr-code";

export default async function TicketPage({ params }: { params: Promise<{ hash: string }> }) {
  const { hash } = await params;
  const adminSupabase = createAdminClient();

  console.log("Recherche du billet avec le hash:", hash);

  const { data: ticket, error } = await adminSupabase
    .from("issued_tickets")
    .select(`
      *,
      events (*),
      orders (*)
    `)
    .eq("qr_code_hash", hash)
    .single();

  if (error || !ticket) {
    notFound();
  }

  const isCash = ticket.orders?.payment_method === "cash";
  const isScanned = ticket.status === "scanned";

  const statusConfig = isScanned
    ? { label: "Utilisé", bg: "bg-neutral-400", text: "text-neutral-700" }
    : isCash
    ? { label: "Régler à l'entrée", bg: "bg-orange-500", text: "text-white" }
    : { label: "Accès Confirmé ✓", bg: "bg-green-500", text: "text-white" };

  return (
    <main className="min-h-screen bg-neutral-950 pt-24 pb-12 px-4 flex items-start justify-center">
      <div className="max-w-sm w-full" id="ticket-card">
        {/* Status Banner */}
        <div className={`${statusConfig.bg} text-center py-3 rounded-t-3xl shadow-lg`}>
          <span className={`font-black uppercase tracking-widest text-sm ${statusConfig.text}`}>
            {isScanned ? "⛔ Billet Utilisé" : isCash ? "💵 Paiement à l'entrée" : "✅ Billet Pré-payé"}
          </span>
        </div>

        <div className="bg-white text-black rounded-b-3xl overflow-hidden shadow-2xl">
          {/* Header Event (Flyer) - Plus compact */}
          <div className="relative bg-neutral-900 border-b border-neutral-100">
            {ticket.events?.image_url ? (
              <div className="relative aspect-video w-full overflow-hidden">
                <img src={ticket.events.image_url} alt={ticket.events.title} className="w-full h-full object-contain bg-black" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>
            ) : (
              <div className="h-32 w-full bg-neutral-800 flex items-center justify-center text-neutral-500 font-black uppercase tracking-widest text-[10px]">G-Aura Event</div>
            )}
            
            <div className="absolute bottom-3 left-5 right-5">
              <h1 className="text-lg font-black text-white leading-tight uppercase tracking-tighter mb-1">{ticket.events?.title}</h1>
              <div className="flex flex-wrap gap-2 text-yellow-400 text-[9px] font-bold uppercase tracking-widest opacity-90">
                <div className="flex items-center">
                  <Calendar className="w-2.5 h-2.5 mr-1" />
                  {ticket.events?.date_time && new Date(ticket.events.date_time).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', timeZone: 'UTC' })}
                </div>
                <div className="flex items-center">
                  <Clock className="w-2.5 h-2.5 mr-1" />
                  {ticket.events?.date_time && new Date(ticket.events.date_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}
                </div>
              </div>
            </div>
          </div>

          {/* Ticket Body - Padding réduit */}
          <div className="p-5 text-center bg-white">
            {/* Owner Section - Plus serrée */}
            <div className="mb-4">
              <span className="block text-[9px] text-neutral-400 uppercase font-black tracking-widest mb-1">Détenteur</span>
              <div className="flex items-center justify-center space-x-2">
                <span className="text-lg font-black text-neutral-900 tracking-tight capitalize">{ticket.owner_name}</span>
              </div>
            </div>

            {/* Separator with Circles - Plus petit gap */}
            <div className="relative my-6">
              <div className="absolute -left-8 -top-2.5 w-5 h-5 rounded-full bg-neutral-950" />
              <div className="absolute -right-8 -top-2.5 w-5 h-5 rounded-full bg-neutral-950" />
              <div className="border-t border-dashed border-neutral-200" />
            </div>

            {/* QR Code Section - Redimensionné */}
            <div className={`flex flex-col items-center justify-center ${isScanned ? "opacity-30 grayscale" : ""}`}>
              <div className="bg-white p-3 rounded-2xl border border-neutral-100 shadow-inner mb-3">
                <QRCode value={hash} size={140} />
              </div>
              
              <div className="bg-neutral-50 px-3 py-1 rounded-full border border-neutral-100">
                <span className="text-[9px] font-mono text-neutral-400 tracking-[0.2em]">
                  #{hash.substring(0, 10).toUpperCase()}
                </span>
              </div>
            </div>

            {/* Payment Reminder for Cash - Moins encombrant */}
            {isCash && !isScanned && (
              <div className="mt-4 p-3 bg-orange-50 border border-orange-100 rounded-xl">
                <div className="flex items-center justify-center space-x-2 text-orange-600">
                  <Banknote className="w-3.5 h-3.5" />
                  <span className="text-[9px] font-black uppercase tracking-widest">A régler : {ticket.events?.price_usd} CDF</span>
                </div>
              </div>
            )}
          </div>

          {/* Footer Info - Compact */}
          <div className="bg-neutral-50 p-4 text-center border-t border-neutral-100">
            <p className="text-[9px] text-neutral-400 leading-tight font-medium">
              QR Code à présenter à l'entrée.<br/>
              Billet personnel • Non remboursable
            </p>
          </div>
        </div>

        {/* Save Note */}
        <div className="mt-6 flex items-center justify-center space-x-2 text-neutral-500">
          <Smartphone className="w-4 h-4 opacity-50" />
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">Capture d'écran recommandée</p>
        </div>
      </div>
    </main>
  );
}
