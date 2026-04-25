import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import MerchProductClient from "./MerchProductClient";

export default async function MerchProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch product with variants
  const { data: product, error } = await supabase
    .from("merch_products")
    .select(`
      *,
      merch_variants (*)
    `)
    .eq("id", id)
    .single();

  if (error || !product) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-black pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <MerchProductClient product={product} />
      </div>
    </main>
  );
}
