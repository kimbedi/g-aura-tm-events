"use server";

import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";

export async function deleteTicket(ticketId: string) {
  const adminSupabase = createAdminClient();

  // 1. Get the ticket to find the associated order
  const { data: ticket } = await adminSupabase
    .from("issued_tickets")
    .select("order_id")
    .eq("id", ticketId)
    .single();

  if (ticket?.order_id) {
    // 2. Delete the order (which should delete the ticket via CASCADE or manual delete)
    await adminSupabase.from("orders").delete().eq("id", ticket.order_id);
  } else {
    // Just delete the ticket if no order is found
    await adminSupabase.from("issued_tickets").delete().eq("id", ticketId);
  }

  revalidatePath("/dashboard/tickets");
  return { success: true };
}
