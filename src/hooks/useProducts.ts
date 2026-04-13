import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DbProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  stock: number;
  unit: string;
  types: { value: string; label: string; priceModifier: number }[];
  created_at: string;
}

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as DbProduct[];
    },
  });
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: ["products", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as unknown as DbProduct;
    },
    enabled: !!id,
  });
}

export const CATEGORIES = [
  { value: "all", label: "All Products" },
  { value: "wood", label: "Wood" },
  { value: "paints", label: "Paints" },
  { value: "designs", label: "Architectural Designs" },
] as const;
