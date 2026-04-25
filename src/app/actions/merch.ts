"use server";

import { createClient } from "@/utils/supabase/server";

export async function getMerchProducts() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("merch_products")
    .select(`
      *,
      merch_variants ( id, size, color, sku, stock_count )
    `)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching merch:", error);
    return [];
  }

  return data;
}
