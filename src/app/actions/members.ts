"use server";

import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getMembers() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });
    
  if (error) throw new Error(error.message);
  return data;
}

export async function updateMemberRole(userId: string, newRole: string) {
  const supabase = await createClient();
  const adminSupabase = createAdminClient();
  const { data: { user: currentUser } } = await supabase.auth.getUser();

  if (!currentUser) throw new Error("Non autorisé");

  // Security: Don't allow changing your own role
  if (currentUser.id === userId) {
    throw new Error("Vous ne pouvez pas modifier votre propre rôle.");
  }

  // Security: Don't allow changing a super_admin role
  const { data: target } = await adminSupabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (target?.role === "super_admin") {
    throw new Error("Impossible de modifier le rôle du DevTool.");
  }

  const { error } = await adminSupabase
    .from("profiles")
    .update({ role: newRole })
    .eq("id", userId);
    
  if (error) throw new Error(error.message);
  revalidatePath("/admin/members");
  return { success: true };
}
