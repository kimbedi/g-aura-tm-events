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

// Roles an admin is allowed to assign through the UI. super_admin is
// excluded on purpose — only DB-level promotion can grant DevTool.
const ASSIGNABLE_ROLES = ["user", "scanner", "manager", "moderator", "admin"] as const;
type AssignableRole = (typeof ASSIGNABLE_ROLES)[number];

export async function updateMemberRole(userId: string, newRole: string) {
  const supabase = await createClient();
  const adminSupabase = createAdminClient();
  const { data: { user: currentUser } } = await supabase.auth.getUser();

  if (!currentUser) throw new Error("Non autorisé");

  // Security: Don't allow changing your own role
  if (currentUser.id === userId) {
    throw new Error("Vous ne pouvez pas modifier votre propre rôle.");
  }

  // Security: only assignable roles
  if (!ASSIGNABLE_ROLES.includes(newRole as AssignableRole)) {
    throw new Error(`Rôle invalide : "${newRole}".`);
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
