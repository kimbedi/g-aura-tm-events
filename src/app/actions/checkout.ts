"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";

export async function submitOrder(formData: FormData) {
  const supabase = await createClient();
  const adminSupabase = createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Extract data from form
  const eventId = formData.get("eventId") as string;
  const categoryId = formData.get("categoryId") as string;
  const paymentMethod = formData.get("paymentMethod") as string;
  const refCode = formData.get("refCode") as string;
  const customerName = formData.get("customerName") as string;
  const customerPhone = formData.get("customerPhone") as string | null;
  const amountCdf = Number(formData.get("amountCdf") || 0);
  
  // 1. Get the specific category
  const { data: category } = await adminSupabase
    .from("ticket_categories")
    .select("*")
    .eq("id", categoryId)
    .single();

  // 2. Insert into orders table
  const { data: orderData, error: orderError } = await adminSupabase.from("orders").insert({
    user_id: user?.id || null,
    event_id: eventId,
    ticket_category_id: categoryId,
    customer_name: customerName,
    customer_phone: customerPhone,
    payment_method: paymentMethod,
    payment_reference: refCode,
    total_price_usd: amountCdf,
    quantity: 1,
    status: 'pending_validation'
  }).select().single();

  if (orderError || !orderData) {
    console.error("Order insertion error:", orderError);
    return { error: "Failed to submit order" };
  }

  // 3. Generate Digital Ticket IMMEDIATELY
  const qrHash = `${orderData.id}-${Math.random().toString(36).substring(7)}`;

  const { error: ticketError } = await adminSupabase
    .from("issued_tickets")
    .insert({
      order_id: orderData.id,
      event_id: eventId,
      ticket_category_id: categoryId,
      owner_name: customerName,
      qr_code_hash: qrHash,
      status: "available" 
    });

  if (ticketError) {
    console.error("Ticket generation error:", ticketError);
    return { error: "Failed to generate ticket" };
  }

  revalidatePath("/tickets");
  return { success: true, qrHash };
}
