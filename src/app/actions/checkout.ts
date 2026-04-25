"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";

export async function submitOrder(formData: FormData) {
  const supabase = await createClient();
  const adminSupabase = createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Refuse anonymous purchases — without user_id the buyer can never
  // see their own ticket on /tickets (the SELECT policy requires
  // orders.user_id = auth.uid()). The /checkout page already gates
  // unauthenticated visitors, this is a belt-and-braces server check.
  if (!user) {
    return { error: "Vous devez être connecté pour acheter un billet." };
  }

  // Extract data from form
  const eventId = formData.get("eventId") as string;
  const categoryId = formData.get("categoryId") as string;
  const paymentMethod = formData.get("paymentMethod") as string;
  const refCode = formData.get("refCode") as string;
  const customerName = formData.get("customerName") as string;
  const customerPhone = formData.get("customerPhone") as string | null;
  const amountUsd = Number(formData.get("amountCdf") || 0); // legacy field name

  if (!eventId || !categoryId || !paymentMethod || !customerName) {
    return { error: "Champs obligatoires manquants." };
  }

  // 1. Resolve the chosen category (also acts as a sanity check)
  const { data: category, error: catError } = await adminSupabase
    .from("ticket_categories")
    .select("id, event_id, price_usd")
    .eq("id", categoryId)
    .single();

  if (catError || !category || category.event_id !== eventId) {
    return { error: "Catégorie de billet invalide." };
  }

  // 2. Insert into orders table
  const { data: orderData, error: orderError } = await adminSupabase
    .from("orders")
    .insert({
      user_id: user.id,
      event_id: eventId,
      ticket_category_id: categoryId,
      customer_name: customerName,
      customer_phone: customerPhone,
      payment_method: paymentMethod,
      payment_reference: refCode,
      total_price_usd: amountUsd,
      quantity: 1,
      status: "pending_validation",
    })
    .select()
    .single();

  if (orderError || !orderData) {
    console.error("Order insertion error:", orderError);
    return { error: orderError?.message || "Échec de la création de la commande." };
  }

  // 3. Generate digital ticket immediately so buyer can see it on /tickets
  const qrHash = `${orderData.id}-${Math.random().toString(36).substring(7)}`;

  const { error: ticketError } = await adminSupabase
    .from("issued_tickets")
    .insert({
      order_id: orderData.id,
      event_id: eventId,
      ticket_category_id: categoryId,
      owner_name: customerName,
      qr_code_hash: qrHash,
      status: "available",
    });

  if (ticketError) {
    console.error("Ticket generation error:", ticketError);
    return { error: ticketError.message || "Échec de la génération du billet." };
  }

  revalidatePath("/tickets");
  revalidatePath("/admin/tickets");
  revalidatePath("/admin/payments");
  return { success: true, qrHash };
}
