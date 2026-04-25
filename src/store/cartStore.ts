import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string; // Will use product_id
  name: string;
  price: number;
  quantity: number;
  image_url: string;
  variant?: string; // e.g., 'Size L'
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  getTotalItems: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const { items } = get();
        const existingItem = items.find((i) => i.id === item.id && i.variant === item.variant);
        
        if (existingItem) {
          set({
            items: items.map((i) =>
              i.id === item.id && i.variant === item.variant
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          });
        } else {
          set({ items: [...items, item] });
        }
      },
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),
      clearCart: () => set({ items: [] }),
      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: "gaura-cart-storage",
    }
  )
);
