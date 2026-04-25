"use server";

import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";

export async function deleteTicket(
  ticketId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const adminSupabase = createAdminClient();

    // 1. Locate the ticket and its parent order
    const { data: ticket, error: fetchError } = await adminSupabase
      .from("issued_tickets")
      .select("order_id")
      .eq("id", ticketId)
      .single();

    if (fetchError) {
      // PGRST116 = "Results contain 0 rows": ticket already gone, treat as success
      if (fetchError.code === "PGRST116") {
        revalidatePath("/admin/tickets");
        return { success: true };
      }
      return { success: false, error: "Lecture du billet : " + fetchError.message };
    }

    if (ticket?.order_id) {
      // Deleting the order cascades to the issued_ticket and any
      // platform_commissions row (both have ON DELETE CASCADE on order_id).
      const { error: orderError } = await adminSupabase
        .from("orders")
        .delete()
        .eq("id", ticket.order_id);
      if (orderError) {
        return { success: false, error: "Suppression de la commande : " + orderError.message };
      }
    } else {
      const { error: ticketError } = await adminSupabase
        .from("issued_tickets")
        .delete()
        .eq("id", ticketId);
      if (ticketError) {
        return { success: false, error: "Suppression du billet : " + ticketError.message };
      }
    }

    // The Billets list lives at /admin/tickets — the previous
    // /dashboard/tickets path didn't exist, so the page never refreshed.
    revalidatePath("/admin/tickets");
    revalidatePath("/admin");
    return { success: true };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Erreur inconnue";
    console.error("deleteTicket crash:", e);
    return { success: false, error: message };
  }
}
