import { createClient } from "@/utils/supabase/server";
import { ShoppingBag, ArrowRight, Star, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default async function MerchStorePage() {
  const supabase = await createClient();
  
  const { data: products, error } = await supabase
    .from("merch_products")
    .select(`
      *,
      merch_variants (
        id,
        size,
        stock_count
      )
    `)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching merch products:", error);
  }

  return (
    <main className="min-h-screen bg-black pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header Section */}
        <header className="mb-20 text-center relative">
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 bg-yellow-500/10 blur-[100px] rounded-full" />
          <div className="inline-flex items-center space-x-2 bg-yellow-500/10 border border-yellow-500/20 px-4 py-2 rounded-full mb-6">
            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-500">Collection Officielle G-Aura</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-black tracking-tighter uppercase mb-6 leading-none">
            G-AURA <br className="md:hidden" /> <span className="text-neutral-500">APPAREL</span>
          </h1>
          <p className="text-neutral-400 max-w-xl mx-auto font-medium">
            Le style premium ne s'arrête pas aux événements. Découvrez notre collection exclusive de vêtements et accessoires.
          </p>
        </header>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {products?.map((product: any) => {
            const totalStock = product.merch_variants?.reduce((acc: number, v: any) => acc + v.stock_count, 0) || 0;
            
            return (
              <Link 
                key={product.id} 
                href={`/merch/${product.id}`}
                className="group relative bg-neutral-900/40 border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-yellow-500/30 transition-all duration-700 shadow-2xl"
              >
                {/* Product Image */}
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-950">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="w-16 h-16 text-neutral-800" />
                    </div>
                  )}
                  
                  {/* Category Tag */}
                  <div className="absolute top-6 left-6">
                    <span className="bg-black/60 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full border border-white/10">
                      {product.category}
                    </span>
                  </div>

                  {/* Stock Indicator */}
                  {totalStock < 10 && totalStock > 0 && (
                    <div className="absolute top-6 right-6">
                      <span className="bg-orange-500 text-black text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                        Stock Limité
                      </span>
                    </div>
                  )}
                  {totalStock === 0 && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                      <span className="bg-white text-black text-xs font-black uppercase tracking-widest px-6 py-3 rounded-full">
                        Rupture de Stock
                      </span>
                    </div>
                  )}

                  {/* Hover Overlay Button */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                    <div className="w-14 h-14 bg-yellow-500 rounded-full flex items-center justify-center text-black shadow-[0_0_30px_rgba(234,179,8,0.4)] scale-75 group-hover:scale-100 transition-transform duration-500">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                {/* Info Container */}
                <div className="p-8">
                  <h3 className="text-xl font-black text-white mb-2 group-hover:text-yellow-500 transition-colors uppercase tracking-tight">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between mt-6">
                    <div className="flex flex-col">
                      <span className="text-2xl font-black text-white tracking-tighter">
                        {Number(product.base_price_usd).toLocaleString()} <span className="text-[10px] text-neutral-500">CDF</span>
                      </span>
                    </div>
                    <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-neutral-500 group-hover:text-white transition-colors">
                      Détails <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Brand Promise Section */}
        <section className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-white/5 pt-20">
          <div className="text-center">
            <div className="w-12 h-12 bg-neutral-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
               <Star className="w-6 h-6 text-yellow-500" />
            </div>
            <h4 className="text-white font-black uppercase tracking-widest text-sm mb-4">Qualité Supérieure</h4>
            <p className="text-neutral-500 text-xs leading-relaxed">Matériaux haut de gamme sélectionnés avec soin pour un confort et une durabilité exceptionnelle.</p>
          </div>
          <div className="text-center">
             <div className="w-12 h-12 bg-neutral-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
               <ShieldCheck className="w-6 h-6 text-green-500" />
            </div>
            <h4 className="text-white font-black uppercase tracking-widest text-sm mb-4">Achat Sécurisé</h4>
            <p className="text-neutral-500 text-xs leading-relaxed">Vos transactions sont protégées. Support client dédié pour toute question sur votre commande.</p>
          </div>
          <div className="text-center">
             <div className="w-12 h-12 bg-neutral-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
               <ShoppingBag className="w-6 h-6 text-blue-500" />
            </div>
            <h4 className="text-white font-black uppercase tracking-widest text-sm mb-4">Retrait Rapide</h4>
            <p className="text-neutral-500 text-xs leading-relaxed">Récupérez vos produits directement aux événements ou profitez de nos points de retrait partenaires.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
