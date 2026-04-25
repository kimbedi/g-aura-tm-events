import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Using Admin Service Role Key since this is a Cron Job (Server-to-Server)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Needs to be added to .env
);

export async function GET(request: Request) {
  // Optionnel: Vérifier un token secret Vercel Cron pour la sécurité
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // Appel de la fonction Supabase pour purger les billets
    const { error } = await supabase.rpc("delete_expired_tickets");

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Billets expirés purgés avec succès." });
  } catch (error: any) {
    console.error("Erreur Cron Purge:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
