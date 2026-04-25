"use server";

import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// Default debt threshold (USD) used as a fallback when no row exists in
// public.app_config. The super_admin can override this from the dashboard.
const DEFAULT_DEBT_LIMIT_USD = 100;

export async function getDebtLimit(): Promise<number> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("app_config")
    .select("value")
    .eq("key", "debt_limit_usd")
    .single();

  if (error || !data) return DEFAULT_DEBT_LIMIT_USD;
  const parsed = Number(data.value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_DEBT_LIMIT_USD;
}

export async function setDebtLimit(amount: number) {
  // Super-admin only.
  const userClient = await createClient();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return { success: false, error: "Non authentifié." };

  const { data: profile } = await userClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "super_admin") {
    return { success: false, error: "Réservé au super administrateur." };
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return { success: false, error: "Montant invalide." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("app_config")
    .upsert(
      { key: "debt_limit_usd", value: amount, updated_at: new Date().toISOString() },
      { onConflict: "key" }
    );

  if (error) {
    console.error("setDebtLimit error:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin", "layout");
  return { success: true };
}

export async function getCommissions() {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("platform_commissions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching commissions:", error);
    return { totalDue: 0, totalPaid: 0, history: [] };
  }

  const totalDue = data
    .filter(c => c.payout_status === 'pending')
    .reduce((sum, c) => sum + Number(c.commission_amount_usd), 0);

  const totalPaid = data
    .filter(c => c.payout_status === 'paid_to_koho')
    .reduce((sum, c) => sum + Number(c.commission_amount_usd), 0);

  return { totalDue, totalPaid, history: data };
}

export async function checkPlatformLockStatus() {
  const [{ totalDue }, debtLimit] = await Promise.all([
    getCommissions(),
    getDebtLimit(),
  ]);

  if (totalDue >= debtLimit) {
    return { isLocked: true, amountOwed: totalDue, debtLimit };
  }

  return { isLocked: false, amountOwed: totalDue, debtLimit };
}

// Super-admin only: marks every pending commission as paid_to_koho,
// which immediately drops totalDue to 0 and unlocks the admin dashboard.
// Use this once the off-platform Koho transfer has been received.
export async function reactivatePlatform() {
  // Verify caller is super_admin via the cookie-bound client.
  const userClient = await createClient();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return { success: false, error: "Non authentifié." };

  const { data: profile } = await userClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "super_admin") {
    return { success: false, error: "Réservé au super administrateur." };
  }

  // Use the admin client to bypass RLS for the bulk update.
  const admin = createAdminClient();
  const { error, count } = await admin
    .from("platform_commissions")
    .update({ payout_status: "paid_to_koho", paid_at: new Date().toISOString() }, { count: "exact" })
    .eq("payout_status", "pending");

  if (error) {
    console.error("reactivatePlatform error:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin", "layout");
  return { success: true, paidCount: count ?? 0 };
}
