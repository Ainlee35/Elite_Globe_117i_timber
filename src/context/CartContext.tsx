import { createContext, useContext, useState, ReactNode } from "react";
import { Product, OrderItem } from "@/data/products";

interface CartContextType {
  items: OrderItem[];
  addItem: (product: Product, selectedType: string | undefined, quantity: number) => void;
  removeItem: (index: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
  clearCart: () => void;
  totalAmount: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<OrderItem[]>([]);

  const addItem = (product: Product, selectedType: string | undefined, quantity: number) => {
    const type = product.types?.find(t => t.label === selectedType || t.value === selectedType);
    const unitPrice = product.price + (type?.priceModifier || 0);

    const existingIndex = items.findIndex(
      i => i.product.id === product.id && i.selectedType === selectedType
    );

    if (existingIndex >= 0) {
      const updated = [...items];
      updated[existingIndex].quantity += quantity;
      setItems(updated);
    } else {
      setItems(prev => [...prev, { product, selectedType, quantity, unitPrice }]);
    }
  };

  const removeItem = (index: number) => setItems(prev => prev.filter((_, i) => i !== index));

  const updateQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) return removeItem(index);
    setItems(prev => prev.map((item, i) => i === index ? { ...item, quantity } : item));
  };

  const clearCart = () => setItems([]);

  const totalAmount = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalAmount, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
}
