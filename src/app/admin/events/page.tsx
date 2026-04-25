"use client";

import { useEffect, useState } from "react";
import { getEvents, createEvent, deleteEvent } from "@/app/actions/events";
import { Plus, Calendar, MapPin, Trash2, Image as ImageIcon, Loader2, X, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [newCategories, setNewCategories] = useState([{ name: "Standard", price_usd: 20, capacity: 100 }]);

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      const data = await getEvents();
      setEvents(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    formData.append("categories", JSON.stringify(newCategories));
    
    try {
      await createEvent(formData);
      setIsModalOpen(false);
      setNewCategories([{ name: "Standard", price_usd: 20, capacity: 100 }]);
      await loadEvents();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cet événement ?")) return;
    try {
      await deleteEvent(id);
      await loadEvents();
    } catch (e) {
      alert("Erreur lors de la suppression");
    }
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 tracking-tighter">Événements</h1>
          <p className="text-neutral-400 text-sm">Gérez la programmation et la billetterie.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center space-x-2 bg-yellow-500 text-black font-bold px-6 py-3 rounded-2xl hover:bg-yellow-400 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Nouvel Événement</span>
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-64 bg-neutral-900 animate-pulse rounded-3xl" />
          ))
        ) : events.map((event) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={event.id} 
            className="bg-neutral-900 border border-white/5 rounded-3xl overflow-hidden group"
          >
            <div className="aspect-video relative overflow-hidden bg-neutral-800">
              {event.image_url ? (
                <img src={event.image_url} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="flex items-center justify-center h-full text-neutral-600">
                  <ImageIcon className="w-12 h-12" />
                </div>
              )}
              {event.is_premium && (
                <div className="absolute top-4 left-4 bg-yellow-500 text-black text-[10px] font-black px-2 py-1 rounded uppercase flex items-center">
                  <Star className="w-3 h-3 mr-1 fill-current" /> Premium
                </div>
              )}
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4 line-clamp-1">{event.title}</h3>
              <div className="space-y-2 mb-6">
                <div className="flex items-center text-sm text-neutral-400">
                  <Calendar className="w-4 h-4 mr-2 text-yellow-500" />
                  {new Date(event.date_time).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                <div className="flex items-center text-sm text-neutral-400">
                  <MapPin className="w-4 h-4 mr-2 text-yellow-500" />
                  {event.location}
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="text-xs text-neutral-500">
                  {event.ticket_categories?.length || 0} Catégories
                </div>
                <button 
                  onClick={() => handleDelete(event.id)}
                  className="p-2 text-neutral-500 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Creation Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-2xl bg-neutral-900 border border-white/10 rounded-[2rem] p-8 max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 text-neutral-500 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>

              <h2 className="text-2xl font-bold mb-8">Nouvel Événement</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Titre</label>
                      <input name="title" required className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-yellow-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Lieu</label>
                      <input name="location" required className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-yellow-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Date et Heure</label>
                      <input name="dateTime" type="datetime-local" required className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-yellow-500 outline-none text-white" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Flyer de l'événement</label>
                    <div className="relative group aspect-square rounded-2xl bg-black border border-white/10 flex flex-col items-center justify-center text-neutral-500 cursor-pointer overflow-hidden">
                      <input type="file" name="flyer" className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                      <ImageIcon className="w-10 h-10 mb-2 group-hover:text-yellow-500 transition-colors" />
                      <span className="text-[10px]">Cliquer pour uploader</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Description</label>
                  <textarea name="description" rows={3} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-yellow-500 outline-none" />
                </div>

                <div className="flex items-center space-x-2">
                  <input type="checkbox" name="isPremium" value="true" className="w-4 h-4 accent-yellow-500" />
                  <label className="text-sm text-neutral-400 font-medium">Événement Premium (G-Aura Exclusive)</label>
                </div>

                <div className="pt-6 border-t border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-xs font-bold text-neutral-500 uppercase">Catégories de Billets</label>
                    <button 
                      type="button"
                      onClick={() => setNewCategories([...newCategories, { name: "VIP", price_usd: 50, capacity: 50 }])}
                      className="text-yellow-500 text-xs font-bold hover:underline"
                    >
                      + Ajouter une catégorie
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {newCategories.map((cat, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <input 
                          placeholder="Nom (VIP...)" 
                          className="flex-1 bg-black border border-white/10 rounded-lg px-3 py-2 text-xs"
                          value={cat.name}
                          onChange={(e) => {
                            const updated = [...newCategories];
                            updated[index].name = e.target.value;
                            setNewCategories(updated);
                          }}
                        />
                        <input 
                          type="number" 
                          placeholder="Prix $" 
                          className="w-20 bg-black border border-white/10 rounded-lg px-3 py-2 text-xs"
                          value={cat.price_usd}
                          onChange={(e) => {
                            const updated = [...newCategories];
                            updated[index].price_usd = Number(e.target.value);
                            setNewCategories(updated);
                          }}
                        />
                        <input 
                          type="number" 
                          placeholder="Place" 
                          className="w-20 bg-black border border-white/10 rounded-lg px-3 py-2 text-xs"
                          value={cat.capacity}
                          onChange={(e) => {
                            const updated = [...newCategories];
                            updated[index].capacity = Number(e.target.value);
                            setNewCategories(updated);
                          }}
                        />
                        {newCategories.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => setNewCategories(newCategories.filter((_, i) => i !== index))}
                            className="text-red-500 p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-white text-black font-black py-4 rounded-2xl hover:bg-yellow-500 transition-colors flex items-center justify-center disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Créer l'Événement"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
