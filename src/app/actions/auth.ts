"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Only allow ?next= redirects that stay on this site (relative path
// starting with a single `/`, not `//host` and no protocol). Prevents
// open-redirect abuse where the post-login URL could be an external site.
function safeNext(next: string | null): string | null {
  if (!next) return null;
  if (!next.startsWith("/")) return null;
  if (next.startsWith("//")) return null;
  return next;
}

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const nextParam = safeNext(formData.get("next") as string | null);

  const { data: { user }, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Fetch role from profiles table
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  revalidatePath("/", "layout");

  // Honour ?next=/checkout/... (set when /checkout redirected here for auth)
  if (nextParam) {
    redirect(nextParam);
  }

  const role = profile?.role;
  if (
    role === "super_admin" ||
    role === "admin" ||
    role === "manager" ||
    role === "scanner" ||
    role === "moderator"
  ) {
    redirect("/admin");
  }
  redirect("/tickets"); // Regular users land on their tickets
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;
  const phone = formData.get("phone") as string;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone_number: phone,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/login?message=Compte créé avec succès. Vérifiez votre email ou connectez-vous.");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
