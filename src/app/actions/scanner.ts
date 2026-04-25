"use server";

import { createClient } from "@/utils/supabase/server";

export async function scanTicket(qrHash: string) {
  const supabase = await createClient();

  // Fetch the ticket
  const { data: ticket, error } = await supabase
    .from("issued_tickets")
    .select(`
      *,
      events ( title )
    `)
    .eq("qr_code_hash", qrHash)
    .single();

  if (error || !ticket) {
    return { success: false, message: "Billet introuvable ou faux billet." };
  }

  // Check if already scanned
  if (ticket.status !== "available") {
    return { 
      success: false, 
      message: `Ce billet a déjà été scanné le ${new Date(ticket.scanned_at).toLocaleString('fr-FR')}.`,
      data: ticket 
    };
  }

  // Mark as scanned
  const { error: updateError } = await supabase
    .from("issued_tickets")
    .update({ 
      status: "scanned", 
      scanned_at: new Date().toISOString() 
    })
    .eq("id", ticket.id);

  if (updateError) {
    return { success: false, message: "Erreur lors de la mise à jour du billet." };
  }

  return { 
    success: true, 
    data: ticket 
  };
}
