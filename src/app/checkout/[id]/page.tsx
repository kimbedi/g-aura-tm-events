import { getEventById } from "@/app/actions/events";
import { notFound } from "next/navigation";
import CheckoutClient from "./CheckoutClient";
import { createClient } from "@/utils/supabase/server";

export default async function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEventById(id);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let profile = null;
  if (user) {
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    profile = data;
  }

  if (!event) {
    notFound();
  }

  return (
    <main className="min-h-screen pt-24 pb-12 px-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black tracking-tighter mb-2">
          FINALISER <span className="text-yellow-500 text-3xl">L'ACHAT</span>
        </h1>
        <p className="text-neutral-500 text-xs uppercase tracking-widest font-bold">Paiement Sécurisé</p>
      </div>

      <div className="w-full">
        <CheckoutClient event={event} userProfile={profile} />
      </div>
    </main>
  );
}
