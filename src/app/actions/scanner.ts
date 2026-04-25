"use server";

import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function scanTicket(qrHash: string) {
  const adminSupabase = createAdminClient();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Authentification requise");

  // 1. Chercher le billet avec les infos de la commande
  const { data: ticket, error } = await adminSupabase
    .from("issued_tickets")
    .select("*, events(*), ticket_categories(*), orders(*)")
    .eq("qr_code_hash", qrHash)
    .single();

  if (error || !ticket) throw new Error("Billet invalide ou introuvable");

  // 2. Vérifier s'il est déjà utilisé
  if (ticket.status === 'scanned') {
    return { 
      success: false, 
      message: "BILLET DÉJÀ UTILISÉ", 
      scannedAt: ticket.scanned_at,
      event: ticket.events.title,
      owner: ticket.owner_name,
      paymentMethod: ticket.orders?.payment_method,
      paymentRef: ticket.orders?.payment_reference
    };
  }

  // On ne marque pas comme scanné ici, on laisse l'agent le faire après vérification
  return { 
    success: true, 
    message: "VÉRIFICATION REQUISE", 
    ticketId: ticket.id,
    owner: ticket.owner_name,
    category: ticket.ticket_categories.name,
    event: ticket.events.title,
    paymentMethod: ticket.orders?.payment_method,
    paymentRef: ticket.orders?.payment_reference,
    amount: ticket.orders?.total_price_usd
  };
}

export async function confirmEntry(ticketId: string) {
  const adminSupabase = createAdminClient();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Authentification requise");

  // Marquer le billet comme scanné
  const { data: ticket } = await adminSupabase
    .from("issued_tickets")
    .select("order_id")
    .eq("id", ticketId)
    .single();

  const { error } = await adminSupabase
    .from("issued_tickets")
    .update({ 
      status: 'scanned',
      scanned_at: new Date().toISOString(),
      scanned_by: user.id
    })
    .eq("id", ticketId);

  if (error) throw new Error("Erreur validation");

  // Marquer la commande comme complétée aussi
  if (ticket?.order_id) {
    await adminSupabase
      .from("orders")
      .update({ status: 'completed', validated_at: new Date().toISOString() })
      .eq("id", ticket.order_id);
  }

  return { success: true };
}
