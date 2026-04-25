"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";

export async function submitMerchOrder(formData: FormData) {
  const supabase = await createClient();
  const adminSupabase = createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();

  const productId = formData.get("productId") as string;
  const variantId = formData.get("variantId") as string;
  const quantity = Number(formData.get("quantity") || 1);
  const customerName = formData.get("customerName") as string;
  const customerPhone = formData.get("customerPhone") as string;
  const paymentMethod = formData.get("paymentMethod") as string;
  const refCode = formData.get("refCode") as string;
  const totalPrice = Number(formData.get("totalPrice") || 0);

  // 1. Create the order
  const { data: order, error: orderError } = await adminSupabase
    .from("merch_orders")
    .insert({
      user_id: user?.id || null,
      product_id: productId,
      variant_id: variantId,
      customer_name: customerName,
      customer_phone: customerPhone,
      quantity,
      total_price_usd: totalPrice,
      payment_method: paymentMethod,
      payment_reference: refCode,
      status: 'pending_validation'
    })
    .select()
    .single();

  if (orderError) {
    console.error("Merch order error:", orderError);
    return { error: "Erreur lors de la commande" };
  }

  // 2. Decrement stock (Basic logic, in production use a transaction or RPC)
  const { data: variant } = await adminSupabase
    .from("merch_variants")
    .select("stock_count")
    .eq("id", variantId)
    .single();

  if (variant) {
    await adminSupabase
      .from("merch_variants")
      .update({ stock_count: Math.max(0, variant.stock_count - quantity) })
      .eq("id", variantId);
  }

  revalidatePath("/admin/merch");
  revalidatePath(`/merch/${productId}`);
  
  return { success: true, orderId: order.id };
}
