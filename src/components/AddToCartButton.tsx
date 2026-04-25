"use client";

import { useCartStore } from "@/store/cartStore";
import { useState, useEffect } from "react";

export default function AddToCartButton({ product }: { product: any }) {
  const [mounted, setMounted] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  // Évite les erreurs d'hydratation avec Zustand + Persist
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAdd = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: Number(product.base_price_usd),
      quantity: 1,
      image_url: product.image_url,
    });
    alert("Ajouté au panier !");
  };

  if (!mounted) return <button className="w-full bg-white/50 text-black font-bold py-3 rounded-xl cursor-not-allowed">Chargement...</button>;

  return (
    <button 
      onClick={handleAdd}
      className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-yellow-500 transition-colors"
    >
      Ajouter au panier
    </button>
  );
}
