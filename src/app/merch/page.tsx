import { getMerchProducts } from "@/app/actions/merch";
import AddToCartButton from "@/components/AddToCartButton";
import CartIndicator from "@/components/CartIndicator";

export default async function MerchPage() {
  const products = await getMerchProducts();

  return (
    <main className="min-h-screen pt-32 pb-24 px-6 max-w-7xl mx-auto">
      <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 border border-white/10 bg-white/5 backdrop-blur-md rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300">G-Aura Exclusives</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">
            BOUTIQUE <span className="text-yellow-500">MERCH</span>
          </h1>
          <p className="text-neutral-400 text-lg max-w-xl">
            Vêtements et accessoires officiels G-Aura en édition limitée. L'essence de nos événements à porter.
          </p>
        </div>
        
        <CartIndicator />
      </div>

      {(!products || products.length === 0) ? (
        <div className="text-center py-32 text-neutral-500">
          La boutique est actuellement vide.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product: any) => (
            <div key={product.id} className="group relative block bg-neutral-900 border border-white/5 rounded-3xl overflow-hidden hover:border-white/10 transition-colors">
              <div className="aspect-[4/5] overflow-hidden bg-neutral-800 relative">
                {product.image_url ? (
                  <img 
                    src={product.image_url} 
                    alt={product.name} 
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" 
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-neutral-600">Aucune image</div>
                )}
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  {product.category}
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-white group-hover:text-yellow-500 transition-colors">{product.name}</h3>
                  <span className="text-lg font-black ml-4">${product.base_price_usd}</span>
                </div>
                <p className="text-sm text-neutral-400 mb-6 line-clamp-2">{product.description}</p>
                
                <AddToCartButton product={product} />
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
