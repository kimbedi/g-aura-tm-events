import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { Calendar, User, Banknote, MessageSquare } from "lucide-react";
import QRCode from "react-qr-code";

export default async function TicketPage({ params }: { params: { hash: string } }) {
  const supabase = await createClient();

  const { data: ticket, error } = await supabase
    .from("issued_tickets")
    .select(`
      *,
      events ( title, location, date_time, image_url, price_usd ),
      orders!inner ( id, payment_method, payment_reference, total_price_usd )
    `)
    .eq("qr_code_hash", params.hash)
    .single();

  if (error || !ticket) {
    notFound();
  }

  const isCash = ticket.orders.payment_method === "cash";
  const isScanned = ticket.status === "scanned";
  const isPending = ticket.status === "pending_validation";

  const statusConfig = isScanned
    ? { label: "Utilisé", bg: "bg-neutral-400", text: "text-neutral-700", border: "border-neutral-300" }
    : isCash
    ? { label: "Payer à l'entrée", bg: "bg-orange-500", text: "text-white", border: "border-orange-400" }
    : { label: "Pré-payé ✓", bg: "bg-green-500", text: "text-white", border: "border-green-400" };

  return (
    <main className="min-h-screen bg-neutral-950 pt-8 pb-12 px-4 flex items-start justify-center">
      <div className="max-w-sm w-full" id="ticket-card">
        {/* Status Banner */}
        <div className={`${statusConfig.bg} text-center py-3 rounded-t-3xl`}>
          <span className={`font-black uppercase tracking-widest text-sm ${statusConfig.text}`}>
            {isScanned ? "⛔ Billet Utilisé" : isCash ? "💵 Régler à l'entrée" : "✅ Pré-payé • Accès Confirmé"}
          </span>
        </div>

        <div className="bg-white text-black rounded-b-3xl overflow-hidden shadow-2xl">
          {/* Header Event */}
          <div className="h-40 relative bg-neutral-800">
            {ticket.events?.image_url ? (
              <img src={ticket.events.image_url} alt={ticket.events.title} className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-600 to-black" />
            )}
            <div className="absolute inset-0 bg-black/50" />
            <div className="absolute bottom-4 left-5 right-5">
              <h1 className="text-xl font-black text-white leading-tight">{ticket.events?.title}</h1>
              <div className="flex items-center text-yellow-400 text-sm mt-1">
                <Calendar className="w-3.5 h-3.5 mr-1" />
                {ticket.events?.date_time && new Date(ticket.events.date_time).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Ticket Body */}
          <div className="p-6 text-center">
            {/* Owner */}
            <div className="mb-5">
              <div className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Détenteur</div>
              <div className="text-xl font-bold flex items-center justify-center">
                <User className="w-4 h-4 mr-2 text-neutral-400" />
                {ticket.owner_name}
              </div>
            </div>

            {/* Payment Info Band */}
            {!isScanned && isCash ? (
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-5 flex items-center space-x-3">
                <Banknote className="w-8 h-8 text-orange-500 flex-shrink-0" />
                <div className="text-left">
                  <div className="font-bold text-orange-800 text-sm">Paiement Cash à la porte</div>
                  <div className="text-orange-600 font-black text-xl">{ticket.events?.price_usd} USD</div>
                </div>
              </div>
            ) : !isScanned && !isCash ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-5 flex items-center space-x-3">
                <MessageSquare className="w-8 h-8 text-green-600 flex-shrink-0" />
                <div className="text-left">
                  <div className="font-bold text-green-800 text-sm">Réf. Airtel Money</div>
                  <div className="text-green-700 font-mono font-black text-lg">{ticket.orders?.payment_reference || "N/A"}</div>
                </div>
              </div>
            ) : null}

            {/* Separator */}
            <div className="border-t-2 border-dashed border-neutral-200 my-5 relative">
              <div className="absolute -left-10 -top-3 w-6 h-6 rounded-full bg-neutral-950" />
              <div className="absolute -right-10 -top-3 w-6 h-6 rounded-full bg-neutral-950" />
            </div>

            {/* QR Code */}
            <div className={`relative flex items-center justify-center ${isScanned ? "opacity-30 grayscale" : ""}`}>
              <div className="bg-white p-3 rounded-2xl border-2 border-neutral-100 shadow-inner">
                <QRCode value={params.hash} size={180} />
              </div>
            </div>

            {isScanned && (
              <div className="mt-3 font-black text-red-500 uppercase tracking-widest border-2 border-red-500 px-4 py-2 rounded-xl text-sm">
                Déjà Scanné · Entrée Refusée
              </div>
            )}

            <p className="text-[10px] text-neutral-400 font-mono mt-4 tracking-widest">
              #{params.hash.substring(0, 16).toUpperCase()}
            </p>
          </div>

          {/* Footer */}
          <div className="bg-neutral-50 p-4 text-center border-t border-neutral-200">
            <p className="text-xs text-neutral-500">Présentez ce QR code à l'agent à l'entrée.</p>
            <p className="text-xs text-neutral-400 mt-1 font-semibold">Billet personnel · Non remboursable · Non cessible</p>
          </div>
        </div>

        {/* Save hint */}
        <p className="text-center text-neutral-500 text-xs mt-4">
          📸 Faites une capture d'écran pour garder votre billet hors ligne.
        </p>
      </div>
    </main>
  );
}
