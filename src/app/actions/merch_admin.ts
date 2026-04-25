"use server";

import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";

export async function addMerchProduct(formData: FormData) {
  const adminSupabase = createAdminClient();

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;
  const price = Number(formData.get("price") || 0);
  const imageUrl = formData.get("imageUrl") as string;

  const { data: product, error } = await adminSupabase
    .from("merch_products")
    .insert({
      name,
      description,
      category,
      base_price_usd: price,
      image_url: imageUrl
    })
    .select()
    .single();

  if (error) return { error: "Erreur ajout produit" };

  // Add default variants if needed or handle separately
  revalidatePath("/admin/merch");
  revalidatePath("/merch");
  return { success: true, productId: product.id };
}

export async function deleteMerchProduct(id: string) {
  const adminSupabase = createAdminClient();

  const { error } = await adminSupabase
    .from("merch_products")
    .delete()
    .eq("id", id);

  if (error) return { error: "Erreur suppression" };

  revalidatePath("/admin/merch");
  revalidatePath("/merch");
  return { success: true };
}

export async function addVariant(formData: FormData) {
  const adminSupabase = createAdminClient();

  const productId = formData.get("productId") as string;
  const size = formData.get("size") as string;
  const color = formData.get("color") as string;
  const stock = Number(formData.get("stock") || 0);
  const sku = `SKU-${Math.random().toString(36).substring(7).toUpperCase()}`;

  const { error } = await adminSupabase
    .from("merch_variants")
    .insert({
      product_id: productId,
      size,
      color,
      stock_count: stock,
      sku
    });

  if (error) return { error: "Erreur ajout variante" };

  revalidatePath("/admin/merch");
  return { success: true };
}
