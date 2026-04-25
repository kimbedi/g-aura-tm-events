"use client";

import { useState } from "react";
import { Plus, Trash2, Tag, Package, Image as ImageIcon, Loader2, X, PlusCircle } from "lucide-react";
import { addMerchProduct, deleteMerchProduct, addVariant } from "@/app/actions/merch_admin";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

export default function MerchAdminClient({ initialProducts }: { initialProducts: any[] }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();

  // Form states for new product
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newCat, setNewCat] = useState("T-Shirt");
  const [newImgFile, setNewImgFile] = useState<File | null>(null);

  // Variant form states (per product)
  const [showVariantForm, setShowVariantForm] = useState<string | null>(null);
  const [varSize, setVarSize] = useState("");
  const [varColor, setVarColor] = useState("");
  const [varStock, setVarStock] = useState("");

  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setUploading(true);

    try {
      let imageUrl = "";
      if (newImgFile) {
        const fileExt = newImgFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `merch/${fileName}`;

        const { data, error: uploadError } = await supabase.storage
          .from('gallery')
          .upload(filePath, newImgFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('gallery')
          .getPublicUrl(filePath);
        
        imageUrl = publicUrl;
      }

      const formData = new FormData();
      formData.append("name", newName);
      formData.append("description", newDesc);
      formData.append("category", newCat);
      formData.append("price", newPrice);
      formData.append("imageUrl", imageUrl);

      await addMerchProduct(formData);
      setShowAddModal(false);
      // Reset form
      setNewName(""); setNewDesc(""); setNewPrice(""); setNewImgFile(null);
    } catch (e) {
      alert("Erreur lors de l'ajout");
    } finally {
      setLoading(false);
      setUploading(false);
    }
  }

  async function handleAddVariant(productId: string) {
    if (!varSize || !varStock) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("productId", productId);
    formData.append("size", varSize);
    formData.append("color", varColor);
    formData.append("stock", varStock);

    await addVariant(formData);
    setShowVariantForm(null);
    setVarSize(""); setVarColor(""); setVarStock("");
    setLoading(false);
  }

  return (
    <div className="space-y-10">
      {/* Top Action */}
      <div className="flex justify-end">
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-yellow-500 text-black font-black px-8 py-4 rounded-2xl uppercase tracking-widest text-xs hover:bg-yellow-400 transition-all shadow-xl flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Produit</span>
        </button>
      </div>

      {/* Product List */}
      <div className="grid grid-cols-1 gap-8">
        {initialProducts.map((product) => (
          <div key={product.id} className="bg-neutral-900 border border-white/5 rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row shadow-2xl">
            {/* Image */}
            <div className="w-full md:w-64 h-64 bg-black relative shrink-0">
              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
              <div className="absolute top-4 left-4">
                <span className="bg-black/60 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-white/10">
                  {product.category}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-8 flex flex-col md:flex-row gap-8">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{product.name}</h2>
                  <div className="text-xl font-black text-yellow-500">{Number(product.base_price_usd).toLocaleString()} CDF</div>
                </div>
                <p className="text-neutral-500 text-sm mb-6 max-w-xl">{product.description}</p>

                {/* Variants List */}
                <div className="space-y-3">
                  <h3 className="text-[10px] font-black text-neutral-600 uppercase tracking-widest flex items-center">
                    <Package className="w-3 h-3 mr-2" /> Stock & Variantes
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.merch_variants?.map((v: any) => (
                      <div key={v.id} className="bg-black border border-white/5 rounded-xl px-4 py-2 flex items-center space-x-4">
                        <span className="text-xs font-black text-white">{v.size}</span>
                        <span className="text-[10px] text-neutral-500">{v.color || 'Unique'}</span>
                        <span className={`text-[10px] font-bold ${v.stock_count > 5 ? 'text-green-500' : 'text-red-500'}`}>
                          {v.stock_count} en stock
                        </span>
                      </div>
                    ))}
                    <button 
                      onClick={() => setShowVariantForm(product.id)}
                      className="bg-white/5 hover:bg-white/10 text-white p-2 rounded-xl border border-white/5 transition-all"
                    >
                      <PlusCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Add Variant Inline Form */}
                <AnimatePresence>
                  {showVariantForm === product.id && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-6 bg-black rounded-3xl border border-yellow-500/20 space-y-4">
                      <div className="grid grid-cols-3 gap-3">
                        <input value={varSize} onChange={e => setVarSize(e.target.value)} placeholder="Taille (Ex: L)" className="bg-neutral-900 border border-white/10 rounded-xl px-4 py-2 text-xs outline-none focus:border-yellow-500" />
                        <input value={varColor} onChange={e => setVarColor(e.target.value)} placeholder="Couleur" className="bg-neutral-900 border border-white/10 rounded-xl px-4 py-2 text-xs outline-none focus:border-yellow-500" />
                        <input type="number" value={varStock} onChange={e => setVarStock(e.target.value)} placeholder="Stock" className="bg-neutral-900 border border-white/10 rounded-xl px-4 py-2 text-xs outline-none focus:border-yellow-500" />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <button onClick={() => setShowVariantForm(null)} className="px-4 py-2 text-[10px] font-black uppercase text-neutral-500">Annuler</button>
                        <button onClick={() => handleAddVariant(product.id)} className="bg-yellow-500 text-black px-4 py-2 rounded-lg text-[10px] font-black uppercase">Ajouter</button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Actions */}
              <div className="flex md:flex-col justify-end gap-2">
                <button 
                  onClick={() => { if(confirm("Supprimer ce produit ?")) deleteMerchProduct(product.id) }}
                  className="w-12 h-12 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl flex items-center justify-center transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setShowAddModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-neutral-900 border border-white/10 w-full max-w-xl rounded-[2.5rem] overflow-hidden shadow-2xl">
              <div className="p-8 border-b border-white/5 flex justify-between items-center">
                <h2 className="text-xl font-black uppercase tracking-tighter">Nouveau Produit</h2>
                <button onClick={() => setShowAddModal(false)} className="text-neutral-500 hover:text-white"><X className="w-6 h-6" /></button>
              </div>
              
              <form onSubmit={handleAddProduct} className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Nom du Produit</label>
                      <input required value={newName} onChange={e => setNewName(e.target.value)} className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-yellow-500" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Catégorie</label>
                      <select value={newCat} onChange={e => setNewCat(e.target.value)} className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-yellow-500 appearance-none">
                        <option>T-Shirt</option>
                        <option>Hoodie</option>
                        <option>Accessoire</option>
                        <option>Autre</option>
                      </select>
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Description</label>
                   <textarea required rows={3} value={newDesc} onChange={e => setNewDesc(e.target.value)} className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-yellow-500" />
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Prix (CDF)</label>
                      <input required type="number" value={newPrice} onChange={e => setNewPrice(e.target.value)} className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-yellow-500" />
                   </div>
                   <div className="space-y-2 text-center">
                      <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-2">Photo du Produit</label>
                      <label className="w-full h-14 bg-black border border-white/10 rounded-2xl flex items-center justify-center cursor-pointer hover:border-yellow-500 transition-all overflow-hidden px-4">
                        <input type="file" accept="image/*" onChange={e => setNewImgFile(e.target.files?.[0] || null)} className="hidden" />
                        <ImageIcon className="w-5 h-5 mr-2 text-neutral-500" />
                        <span className="text-[10px] font-bold text-neutral-400 truncate">{newImgFile ? newImgFile.name : 'Choisir photo'}</span>
                      </label>
                   </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-yellow-500 text-black font-black py-6 rounded-3xl uppercase tracking-widest text-sm hover:bg-yellow-400 transition-all flex items-center justify-center space-x-2 shadow-2xl"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Créer le Produit</span>}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
