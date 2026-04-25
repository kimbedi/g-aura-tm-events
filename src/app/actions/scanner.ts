"use server";

import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function scanTicket(qrHash: string) {
  const adminSupabase = createAdminClient();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Authentification requise");

  // 1. Chercher le billet
  const { data: ticket, error } = await adminSupabase
    .from("issued_tickets")
    .select("*, events(*), ticket_categories(*)")
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
      owner: ticket.owner_name
    };
  }

  // 3. Marquer comme utilisé
  const { error: updateError } = await adminSupabase
    .from("issued_tickets")
    .update({ 
      status: 'scanned',
      scanned_at: new Date().toISOString(),
      scanned_by: user.id
    })
    .eq("id", ticket.id);

  if (updateError) throw new Error("Erreur lors du scan");

  return { 
    success: true, 
    message: "ACCÈS VALIDE", 
    owner: ticket.owner_name,
    category: ticket.ticket_categories.name,
    event: ticket.events.title
  };
}
