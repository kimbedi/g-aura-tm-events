"use server";

import { createClient } from "@/utils/supabase/server";

export async function getCommissions() {
  const supabase = await createClient();
  
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
  const { totalDue } = await getCommissions();
  
  // Limite de dette tolérée (15% impayés)
  const DEBT_LIMIT_USD = 50; 

  if (totalDue >= DEBT_LIMIT_USD) {
    return { isLocked: true, amountOwed: totalDue };
  }

  return { isLocked: false, amountOwed: totalDue };
}
