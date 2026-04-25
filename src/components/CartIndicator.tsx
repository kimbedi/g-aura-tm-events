"use client";

import { useCartStore } from "@/store/cartStore";
import { ShoppingBag } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function CartIndicator() {
  const [mounted, setMounted] = useState(false);
  const getTotalItems = useCartStore((state) => state.getTotalItems);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="flex items-center justify-center space-x-2 bg-white/10 border border-white/10 text-white px-6 py-3 rounded-xl font-medium">
        <ShoppingBag className="w-5 h-5" />
        <span>Panier (0)</span>
      </button>
    );
  }

  const count = getTotalItems();

  return (
    <Link href="/merch/checkout" className="flex items-center justify-center space-x-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white px-6 py-3 rounded-xl font-medium transition-all backdrop-blur-md">
      <ShoppingBag className="w-5 h-5" />
      <span>Panier ({count})</span>
    </Link>
  );
}
