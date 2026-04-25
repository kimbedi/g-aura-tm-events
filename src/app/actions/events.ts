"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";

export async function getEvents() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("*, ticket_categories(*)")
    .order("date_time", { ascending: true });
    
  if (error) throw new Error(error.message);
  return data;
}

export async function getPublishedEvents() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("*, ticket_categories(*)")
    .eq("is_published", true)
    .order("date_time", { ascending: true });
    
  if (error) throw new Error(error.message);
  return data;
}

export async function getEventById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("*, ticket_categories(*)")
    .eq("id", id)
    .single();
    
  if (error) return null;
  return data;
}

export async function createEvent(formData: FormData) {
  const supabase = await createClient();
  
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const location = formData.get("location") as string;
  const dateTime = formData.get("dateTime") as string;
  const isPremium = formData.get("isPremium") === "true";
  const file = formData.get("flyer") as File;
  
  let imageUrl = null;
  
  const adminSupabase = createAdminClient();
  
  if (file && file.size > 0) {
    console.log("Tentative d'upload flyer (Buffer Mode):", file.name);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    
    // Conversion en ArrayBuffer pour plus de stabilité
    const arrayBuffer = await file.arrayBuffer();
    
    const { data: uploadData, error: uploadError } = await adminSupabase.storage
      .from("flyers")
      .upload(fileName, arrayBuffer, {
        contentType: file.type,
        upsert: true
      });
      
    if (uploadError) {
      console.error("Détails erreur Supabase Storage:", uploadError);
      throw new Error("Erreur upload image: " + uploadError.message);
    }
    
    const { data: { publicUrl } } = adminSupabase.storage
      .from("flyers")
      .getPublicUrl(fileName);
    imageUrl = publicUrl;
    console.log("Upload réussi! URL:", imageUrl);
  }

  const { data: event, error: eventError } = await adminSupabase
    .from("events")
    .insert([{
      title,
      description,
      location,
      date_time: dateTime,
      is_premium: isPremium,
      image_url: imageUrl,
      is_published: true
    }])
    .select()
    .single();

  if (eventError) {
    console.error("Erreur insertion Event:", eventError);
    throw new Error(eventError.message);
  }

  // Categories
  const categories = JSON.parse(formData.get("categories") as string);
  if (categories && categories.length > 0) {
    const categoriesWithEventId = categories.map((cat: any) => ({
      ...cat,
      event_id: event.id
    }));
    await adminSupabase.from("ticket_categories").insert(categoriesWithEventId);
  }

  revalidatePath("/admin/events");
  revalidatePath("/");
  return { success: true };
}

export async function deleteEvent(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/events");
  revalidatePath("/");
  return { success: true };
}

// Returns { success, error? } so the client can surface the real message.
// We avoid `throw` because Next masks server-action error messages in
// production, leaving users with the generic "An error occurred in the
// Server Components render" alert.
export async function updateEvent(
  id: string,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const adminSupabase = createAdminClient();

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const location = formData.get("location") as string;
    const dateTime = formData.get("dateTime") as string;
    const isPremium = formData.get("isPremium") === "true";
    const file = formData.get("flyer") as File;

    const updateData: Record<string, unknown> = {
      title,
      description,
      location,
      date_time: dateTime,
      is_premium: isPremium,
      updated_at: new Date().toISOString(),
    };

    if (file && file.size > 0) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const arrayBuffer = await file.arrayBuffer();

      const { error: uploadError } = await adminSupabase.storage
        .from("flyers")
        .upload(fileName, arrayBuffer, {
          contentType: file.type,
          upsert: true,
        });

      if (uploadError) {
        return { success: false, error: "Upload du flyer impossible : " + uploadError.message };
      }
      const {
        data: { publicUrl },
      } = adminSupabase.storage.from("flyers").getPublicUrl(fileName);
      updateData.image_url = publicUrl;
    }

    const { error: eventUpdError } = await adminSupabase
      .from("events")
      .update(updateData)
      .eq("id", id);

    if (eventUpdError) {
      return { success: false, error: "Mise à jour de l'événement : " + eventUpdError.message };
    }

    // Categories update — diff against the existing rows so we don't blindly
    // delete-and-reinsert.
    const categoriesRaw = formData.get("categories");
    if (categoriesRaw) {
      const submitted: Array<{
        id?: string;
        name: string;
        price_usd: number | string;
        capacity: number | string;
      }> = JSON.parse(categoriesRaw as string);

      const { data: existing, error: fetchError } = await adminSupabase
        .from("ticket_categories")
        .select("id")
        .eq("event_id", id);

      if (fetchError) {
        return {
          success: false,
          error: "Lecture des catégories existantes : " + fetchError.message,
        };
      }

      const existingIds = new Set((existing ?? []).map((c) => c.id));
      const submittedIds = new Set(
        submitted.filter((c) => c.id).map((c) => c.id as string)
      );

      // 1. DELETE rows removed in the UI
      const idsToDelete = [...existingIds].filter((eid) => !submittedIds.has(eid));
      if (idsToDelete.length > 0) {
        const { error: delError } = await adminSupabase
          .from("ticket_categories")
          .delete()
          .in("id", idsToDelete);
        if (delError) {
          return {
            success: false,
            error:
              "Suppression d'une catégorie impossible (probablement liée à des billets émis) : " +
              delError.message,
          };
        }
      }

      // 2. UPDATE rows that kept their id
      for (const cat of submitted.filter((c) => c.id && existingIds.has(c.id))) {
        const { error: updError } = await adminSupabase
          .from("ticket_categories")
          .update({
            name: cat.name,
            price_usd: Number(cat.price_usd),
            capacity: Number(cat.capacity),
          })
          .eq("id", cat.id!);
        if (updError) {
          return {
            success: false,
            error: `Mise à jour de la catégorie "${cat.name}" : ${updError.message}`,
          };
        }
      }

      // 3. INSERT brand-new rows
      const toInsert = submitted
        .filter((c) => !c.id)
        .map((cat) => ({
          name: cat.name,
          price_usd: Number(cat.price_usd),
          capacity: Number(cat.capacity),
          event_id: id,
        }));
      if (toInsert.length > 0) {
        const { error: insError } = await adminSupabase
          .from("ticket_categories")
          .insert(toInsert);
        if (insError) {
          return { success: false, error: "Création des catégories : " + insError.message };
        }
      }
    }

    revalidatePath("/admin/events");
    revalidatePath("/");
    return { success: true };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Erreur inconnue";
    console.error("updateEvent crash:", e);
    return { success: false, error: message };
  }
}
