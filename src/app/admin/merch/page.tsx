import { createClient } from "@/utils/supabase/server";
import { ShoppingBag, Plus, Trash2, Package, Tag, ArrowRight } from "lucide-react";
import MerchAdminClient from "@/app/admin/merch/MerchAdminClient";

export default async function AdminMerchPage() {
  const supabase = await createClient();
  
  const { data: products } = await supabase
    .from("merch_products")
    .select(`
      *,
      merch_variants (*)
    `)
    .order("created_at", { ascending: false });

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto pb-32">
      <header className="mb-10">
        <h1 className="text-3xl font-black uppercase tracking-tighter flex items-center">
          <ShoppingBag className="w-8 h-8 mr-3 text-yellow-500" />
          Gestion Boutique
        </h1>
        <p className="text-neutral-500 text-sm font-medium">Gérez vos collections de vêtements et accessoires G-Aura.</p>
      </header>

      <MerchAdminClient initialProducts={products || []} />
    </div>
  );
}
