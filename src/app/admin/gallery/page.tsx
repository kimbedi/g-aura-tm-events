import { createClient } from "@/utils/supabase/server";
import { Camera, Trash2, Image as ImageIcon } from "lucide-react";
import { deleteGalleryItem } from "@/app/actions/gallery";
import GalleryUpload from "./GalleryUpload";

export default async function AdminGalleryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user?.id)
    .single();

  const isAdmin = ["admin", "super_admin", "moderator"].includes(profile?.role || "");

  const { data: items } = await supabase
    .from("gallery_items")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: events } = await supabase
    .from("events")
    .select("id, title")
    .order("date_time", { ascending: false });

  async function handleDelete(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    await deleteGalleryItem(id);
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto pb-32">
      <header className="mb-10">
        <h1 className="text-3xl font-black uppercase tracking-tighter flex items-center">
          <Camera className="w-8 h-8 mr-3 text-yellow-500" />
          Gestion Galerie
        </h1>
        <p className="text-neutral-500 text-sm font-medium">Ajoutez des souvenirs de vos événements passés (Batch upload).</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Upload Component */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <GalleryUpload events={events || []} />
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {items?.map((item: any) => (
              <div key={item.id} className="bg-neutral-900 border border-white/5 rounded-3xl overflow-hidden group">
                <div className="aspect-video relative overflow-hidden bg-black">
                  <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  {isAdmin && (
                    <div className="absolute top-3 right-3">
                      <form action={handleDelete}>
                        <input type="hidden" name="id" value={item.id} />
                        <button type="submit" className="w-10 h-10 bg-red-500 text-white rounded-xl flex items-center justify-center hover:bg-red-600 transition-colors shadow-xl">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </form>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-white mb-1 uppercase tracking-tight">{item.title}</h3>
                  <p className="text-neutral-500 text-xs line-clamp-1">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          {(!items || items.length === 0) && (
            <div className="text-center py-20 bg-neutral-900/30 border border-dashed border-white/10 rounded-[3rem]">
              <ImageIcon className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
              <p className="text-neutral-500 font-medium">La galerie est vide.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
