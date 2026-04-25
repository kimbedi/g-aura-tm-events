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

export async function updateEvent(id: string, formData: FormData) {
  console.log("Début updateEvent pour ID:", id);
  const adminSupabase = createAdminClient();
  
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const location = formData.get("location") as string;
  const dateTime = formData.get("dateTime") as string;
  const isPremium = formData.get("isPremium") === "true";
  const file = formData.get("flyer") as File;
  
  let updateData: any = {
    title,
    description,
    location,
    date_time: dateTime,
    is_premium: isPremium,
    updated_at: new Date().toISOString()
  };

  if (file && file.size > 0) {
    console.log("Changement de flyer détecté...");
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const arrayBuffer = await file.arrayBuffer();

    const { error: uploadError } = await adminSupabase.storage
      .from("flyers")
      .upload(fileName, arrayBuffer, {
        contentType: file.type,
        upsert: true
      });
      
    if (!uploadError) {
      const { data: { publicUrl } } = adminSupabase.storage
        .from("flyers")
        .getPublicUrl(fileName);
      updateData.image_url = publicUrl;
      console.log("Nouveau flyer uploadé:", publicUrl);
    } else {
      console.error("Erreur upload flyer:", uploadError);
    }
  }

  console.log("Envoi des données à Supabase:", updateData);
  const { error } = await adminSupabase
    .from("events")
    .update(updateData)
    .eq("id", id);

  if (error) {
    console.error("Erreur SQL Update Event:", error);
    throw new Error(error.message);
  }

  // Categories update — diff against the existing rows so we don't blindly
  // delete-and-reinsert. The previous version would silently duplicate rows
  // whenever the DELETE failed (e.g. an FK from issued_tickets/orders).
  const categoriesRaw = formData.get("categories");
  if (categoriesRaw) {
    const submitted: Array<{ id?: string; name: string; price_usd: number | string; capacity: number | string }> =
      JSON.parse(categoriesRaw as string);

    // 1. Pull current state from DB
    const { data: existing, error: fetchError } = await adminSupabase
      .from("ticket_categories")
      .select("id")
      .eq("event_id", id);

    if (fetchError) {
      console.error("Erreur fetch existing categories:", fetchError);
      throw new Error("Impossible de lire les catégories existantes : " + fetchError.message);
    }

    const existingIds = new Set((existing ?? []).map((c) => c.id));
    const submittedIds = new Set(submitted.filter((c) => c.id).map((c) => c.id as string));

    // 2. Categories removed in the UI → delete from DB
    const idsToDelete = [...existingIds].filter((eid) => !submittedIds.has(eid));
    if (idsToDelete.length > 0) {
      const { error: delError } = await adminSupabase
        .from("ticket_categories")
        .delete()
        .in("id", idsToDelete);
      if (delError) {
        console.error("Erreur delete categories:", delError);
        // Most common cause: FK from issued_tickets (ON DELETE RESTRICT).
        throw new Error(
          "Impossible de supprimer une catégorie déjà liée à des billets émis. " +
            "Annule plutôt l'événement ou crée une nouvelle catégorie."
        );
      }
    }

    // 3. Categories with an id and still present → update in place
    const toUpdate = submitted.filter((c) => c.id && existingIds.has(c.id));
    for (const cat of toUpdate) {
      const { error: updError } = await adminSupabase
        .from("ticket_categories")
        .update({
          name: cat.name,
          price_usd: Number(cat.price_usd),
          capacity: Number(cat.capacity),
        })
        .eq("id", cat.id!);
      if (updError) {
        console.error("Erreur update category:", updError);
        throw new Error("Erreur mise à jour catégorie : " + updError.message);
      }
    }

    // 4. New categories (no id) → insert
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
        console.error("Erreur insert categories:", insError);
        throw new Error("Erreur création catégorie : " + insError.message);
      }
    }
  }

  console.log("✅ Mise à jour réussie !");
  revalidatePath("/admin/events");
  revalidatePath("/");
  return { success: true };
}
