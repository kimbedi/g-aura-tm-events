import { createAdminClient } from "@/utils/supabase/admin";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Optionnel: Vérifier un token secret Vercel Cron pour la sécurité
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const supabase = createAdminClient();
    
    // Appel de la fonction Supabase pour purger les billets
    const { error } = await supabase.rpc("delete_expired_tickets");

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Billets expirés purgés avec succès." });
  } catch (error: any) {
    console.error("Erreur Cron Purge:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
