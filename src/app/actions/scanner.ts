"use server";

import { createClient } from "@/utils/supabase/server";

// Cette fonction est appelée UNIQUEMENT pour lire l'état du billet lors du scan
export async function getTicketInfo(qrHash: string) {
  const supabase = await createClient();

  const { data: ticket, error } = await supabase
    .from("issued_tickets")
    .select(`
      *,
      events ( title, price_usd ),
      orders!inner ( id, payment_method, payment_reference, status )
    `)
    .eq("qr_code_hash", qrHash)
    .single();

  if (error || !ticket) {
    return { success: false, message: "Billet introuvable ou faux billet." };
  }

  return { success: true, ticket };
}

// Cette fonction est appelée quand l'admin clique sur "Approuver" sur le scanner
export async function approveAndScanTicket(ticketId: string, orderId: string) {
  const supabase = await createClient();

  // 1. Mark order as completed
  const { error: orderError } = await supabase
    .from("orders")
    .update({ status: "completed", validated_at: new Date().toISOString() })
    .eq("id", orderId);

  if (orderError) return { success: false, message: "Erreur validation commande." };

  // 2. Mark ticket as scanned (available is skipped because it's validated at the door)
  const { error: ticketError } = await supabase
    .from("issued_tickets")
    .update({ 
      status: "scanned", 
      scanned_at: new Date().toISOString() 
    })
    .eq("id", ticketId);

  if (ticketError) return { success: false, message: "Erreur scan billet." };

  return { success: true };
}
