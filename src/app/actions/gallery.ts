"use server";

import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";

export async function addGalleryItem(formData: FormData) {
  const adminSupabase = createAdminClient();

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const imageUrl = formData.get("imageUrl") as string;
  const eventId = formData.get("eventId") as string || null;

  const { error } = await adminSupabase
    .from("gallery_items")
    .insert({
      title,
      description,
      image_url: imageUrl,
      event_id: eventId,
      is_published: true
    });

  if (error) {
    console.error("Gallery insert error:", error);
    return { error: "Erreur lors de l'ajout" };
  }

  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  
  return { success: true };
}

export async function deleteGalleryItem(id: string) {
  const adminSupabase = createAdminClient();

  const { error } = await adminSupabase
    .from("gallery_items")
    .delete()
    .eq("id", id);

  if (error) return { error: "Erreur suppression" };

  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  return { success: true };
}
