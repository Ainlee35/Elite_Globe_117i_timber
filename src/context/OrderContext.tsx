import { createContext, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface DbOrder {
  id: string;
  user_id: string;
  total: number;
  status: string;
  payment_status: string;
  payment_method: string | null;
  shipping_address: string | null;
  created_at: string;
  order_items: DbOrderItem[];
  profile?: { name: string; email: string; phone: string; address: string } | null;
}

export interface DbOrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  selected_type: string | null;
  product?: { id: string; name: string; image_url: string; category: string } | null;
}

interface OrderContextType {
  orders: DbOrder[];
  loading: boolean;
  addOrder: (params: {
    total: number;
    paymentMethod: string;
    shippingAddress: string;
    items: { product_id: string; quantity: number; price: number; selected_type?: string }[];
  }) => Promise<string | null>;
  updateOrderStatus: (orderId: string, status: string) => Promise<void>;
  updatePaymentStatus: (orderId: string, status: string) => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading: loading } = useQuery({
    queryKey: ["orders", user?.id, isAdmin],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*, product:products(id, name, image_url, category))")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as unknown as DbOrder[];
    },
    enabled: !!user && !authLoading,
  });

  const addOrderMutation = useMutation({
    mutationFn: async (params: {
      total: number;
      paymentMethod: string;
      shippingAddress: string;
      items: { product_id: string; quantity: number; price: number; selected_type?: string }[];
    }) => {
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user!.id,
          total: params.total,
          payment_method: params.paymentMethod,
          shipping_address: params.shippingAddress,
          payment_status: "paid",
          status: "pending",
        })
        .select()
        .single();
      if (orderError) throw orderError;

      const items = params.items.map(i => ({
        order_id: order.id,
        product_id: i.product_id,
        quantity: i.quantity,
        price: i.price,
        selected_type: i.selected_type || "",
      }));
      const { error: itemsError } = await supabase.from("order_items").insert(items);
      if (itemsError) throw itemsError;

      return order.id;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),
  });

  const addOrder = async (params: Parameters<OrderContextType["addOrder"]>[0]) => {
    try {
      return await addOrderMutation.mutateAsync(params);
    } catch {
      return null;
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    await supabase.from("orders").update({ status }).eq("id", orderId);
    queryClient.invalidateQueries({ queryKey: ["orders"] });
  };

  const updatePaymentStatus = async (orderId: string, status: string) => {
    await supabase.from("orders").update({ payment_status: status }).eq("id", orderId);
    queryClient.invalidateQueries({ queryKey: ["orders"] });
  };

  return (
    <OrderContext.Provider value={{ orders, loading, addOrder, updateOrderStatus, updatePaymentStatus }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrders must be inside OrderProvider");
  return ctx;
}
