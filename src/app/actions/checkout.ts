"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitOrder(formData: FormData) {
  const supabase = await createClient();

  // Extract data from form
  const eventId = formData.get("eventId") as string;
  const method = formData.get("method") as string;
  const refCode = formData.get("refCode") as string;
  const customerName = formData.get("customerName") as string;
  const customerPhone = formData.get("customerPhone") as string;

  // In a real app, we'd fetch the ticket category and calculate price securely on the server
  // For this MVP, we assume a static $100 VIP ticket
  
  // Insert into orders table
  const { data, error } = await supabase.from("orders").insert({
    event_id: eventId,
    customer_name: customerName,
    customer_phone: customerPhone,
    payment_method: method,
    payment_reference: refCode,
    total_price_usd: 100.00,
    quantity: 1
    // ticket_category_id: ...
  }).select();

  if (error || !data) {
    console.error("Order insertion error:", error);
    return { error: "Failed to submit order" };
  }

  const newOrder = data[0];

  // 2. Generate Digital Ticket IMMEDIATELY (pending validation)
  const crypto = require("crypto");
  const qrHash = crypto.randomBytes(16).toString("hex");

  const { error: ticketError } = await supabase
    .from("issued_tickets")
    .insert({
      order_id: newOrder.id,
      event_id: eventId,
      owner_name: customerName,
      qr_code_hash: qrHash,
      status: "pending_validation" // Important: Needs validation at the door
    });

  if (ticketError) {
    console.error("Ticket generation error:", ticketError);
    return { error: "Failed to generate ticket" };
  }

  revalidatePath("/admin/payments");
  return { success: true, qrHash };
}
