import { createClient } from "@/utils/supabase/server";
import { Camera, Maximize2, Share2, Calendar } from "lucide-react";

export default async function GalleryPage() {
  const supabase = await createClient();
  
  const { data: items, error } = await supabase
    .from("gallery_items")
    .select("*, events(title, date_time)")
    .eq("is_published", true)
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching gallery items:", error);
  }

  return (
    <main className="min-h-screen bg-black pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <header className="mb-20">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-neutral-900 rounded-2xl flex items-center justify-center border border-white/10">
              <Camera className="w-5 h-5 text-yellow-500" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500">Archives Visuelles</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-black tracking-tighter uppercase mb-6 leading-none">
            G-AURA <span className="text-neutral-500">GALERIE</span>
          </h1>
          <p className="text-neutral-400 max-w-xl font-medium leading-relaxed">
            Revivez les moments les plus exclusifs et l'ambiance électrique de nos événements passés. L'expérience G-Aura en images.
          </p>
        </header>

        {/* Gallery Grid (Masonry-like with CSS columns or Bento) */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {items?.map((item: any, index: number) => (
            <div 
              key={item.id} 
              className="relative group break-inside-avoid rounded-[2rem] overflow-hidden bg-neutral-900 border border-white/5 shadow-2xl"
            >
              {/* Image */}
              <img 
                src={item.image_url} 
                alt={item.title} 
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700" 
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                <div className="flex items-center space-x-2 text-yellow-500 text-[9px] font-black uppercase tracking-widest mb-2">
                   <Calendar className="w-3 h-3" />
                   <span>{item.events?.date_time ? new Date(item.events.date_time).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : 'Archive G-Aura'}</span>
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">{item.title}</h3>
                <p className="text-neutral-400 text-xs line-clamp-2 font-medium mb-6">{item.description}</p>
                
                <div className="flex items-center space-x-3 pt-4 border-t border-white/10">
                   <button className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors backdrop-blur-md">
                      <Maximize2 className="w-4 h-4 text-white" />
                   </button>
                   <button className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors backdrop-blur-md">
                      <Share2 className="w-4 h-4 text-white" />
                   </button>
                </div>
              </div>

              {/* Discreet Title (visible when NOT hovered) */}
              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between group-hover:opacity-0 transition-opacity duration-300">
                <span className="text-[9px] font-black uppercase tracking-widest text-white/40 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5">
                  {item.title}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <section className="mt-32 text-center py-20 bg-neutral-900/30 border border-white/5 rounded-[3rem] relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-500/5 blur-[100px] rounded-full" />
          <h2 className="text-3xl font-black uppercase tracking-tighter mb-4 relative z-10">Voulez-vous apparaître ici ?</h2>
          <p className="text-neutral-500 mb-10 max-w-md mx-auto text-sm font-medium relative z-10">Participez à nos prochains événements et soyez au cœur de l'expérience G-Aura.</p>
          <a 
            href="/events" 
            className="inline-flex bg-white text-black px-10 py-5 rounded-full font-black uppercase tracking-widest text-xs hover:bg-yellow-500 transition-all shadow-2xl relative z-10"
          >
            Voir les Événements
          </a>
        </section>
      </div>
    </main>
  );
}
