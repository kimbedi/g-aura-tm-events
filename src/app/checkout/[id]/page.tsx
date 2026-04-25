import { getEventById } from "@/app/actions/events";
import { notFound, redirect } from "next/navigation";
import CheckoutClient from "./CheckoutClient";
import { createClient } from "@/utils/supabase/server";

export default async function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEventById(id);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!event) {
    notFound();
  }

  // Buying a ticket without an account would create an orphan order
  // (orders.user_id IS NULL) that the buyer can never retrieve from
  // /tickets. Force authentication first; bring them back here after login.
  if (!user) {
    redirect(`/login?next=/checkout/${id}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

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
