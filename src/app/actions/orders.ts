"use server";

import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";

export async function validateOrder(orderId: string) {
  const supabase = createAdminClient();
  
  // 1. Récupérer la commande
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*, ticket_categories(*)")
    .eq("id", orderId)
    .single();
    
  if (orderError || !order) throw new Error("Commande introuvable");

  // 2. Marquer la commande comme validée
  const { error: updateError } = await supabase
    .from("orders")
    .update({ 
      status: 'completed',
      validated_at: new Date().toISOString()
    })
    .eq("id", orderId);

  if (updateError) throw new Error("Erreur validation commande");

  // 3. Générer les tickets (un par quantité)
  const tickets = [];
  for (let i = 0; i < order.quantity; i++) {
    tickets.push({
      order_id: order.id,
      event_id: order.event_id,
      ticket_category_id: order.ticket_category_id,
      owner_name: order.customer_name,
      qr_code_hash: `${order.id}-${i}-${Math.random().toString(36).substring(7)}`,
      status: 'available'
    });
  }

  const { error: ticketError } = await supabase
    .from("issued_tickets")
    .insert(tickets);

  if (ticketError) throw new Error("Erreur génération tickets");

  // 4. Enregistrer la commission plateforme (15%)
  const commission = order.total_price_usd * 0.15;
  await supabase.from("platform_commissions").insert({
    order_id: order.id,
    commission_amount_usd: commission,
    payout_status: 'pending'
  });

  revalidatePath("/admin/payments");
  revalidatePath("/admin");
  return { success: true };
}

export async function rejectOrder(orderId: string) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("orders")
    .update({ status: 'cancelled' })
    .eq("id", orderId);
    
  if (error) throw new Error(error.message);
  revalidatePath("/admin/payments");
  return { success: true };
}
