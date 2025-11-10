import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useProductLocations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: productLocations, isLoading } = useQuery({
    queryKey: ["product-locations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_locations")
        .select(`
          *,
          product:products(*),
          location:locations(*)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const getProductLocationStock = useQuery({
    queryKey: ["product-location-stock"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_locations")
        .select(`
          *,
          product:products(id, name, sku),
          location:locations(id, name, state)
        `);

      if (error) throw error;
      return data;
    },
  });

  const updateProductLocationStock = useMutation({
    mutationFn: async ({ 
      productId, 
      locationId, 
      stockQty, 
      reorderLevel 
    }: { 
      productId; 
      locationId; 
      stockQty?; 
      reorderLevel?;
    }) => {
      const updateData = {};
      if (stockQty !== undefined) updateData.stock_qty = stockQty;
      if (reorderLevel !== undefined) updateData.reorder_level = reorderLevel;

      const { error } = await supabase
        .from("product_locations")
        .upsert({
          product_id: productId,
          location_id: locationId,
          ...updateData,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-locations"] });
      queryClient.invalidateQueries({ queryKey: ["product-location-stock"] });
      toast({
        title: "Stock updated",
        description: "Location stock has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating stock",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const adjustLocationStock = useMutation({
    mutationFn: async ({
      productId,
      locationId,
      adjustment,
      reason,
    }: {
      productId;
      locationId;
      adjustment;
      reason;
    }) => {
      const { data: currentStock, error: fetchError } = await supabase
        .from("product_locations")
        .select("stock_qty")
        .eq("product_id", productId)
        .eq("location_id", locationId)
        .single();

      if (fetchError) throw fetchError;

      const newQty = (currentStock?.stock_qty || 0) + adjustment;

      const { error: updateError } = await supabase
        .from("product_locations")
        .update({ stock_qty: newQty })
        .eq("product_id", productId)
        .eq("location_id", locationId);

      if (updateError) throw updateError;

      // Log stock movement
      const { data: { user } } = await supabase.auth.getUser();
      const movementNumber = `ADJ-${Date.now()}`;

      const { error: movementError } = await supabase
        .from("stock_movements")
        .insert({
          product_id: productId,
          from_location_id: adjustment < 0 ? locationId ,
          to_location_id: adjustment > 0 ? locationId ,
          quantity: Math.abs(adjustment),
          movement_type: adjustment > 0 ? 'adjustment_in' : 'adjustment_out',
          movement_number: movementNumber,
          notes: reason,
          processed_by: user?.id,
          status: 'completed',
        });

      if (movementError) throw movementError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-locations"] });
      queryClient.invalidateQueries({ queryKey: ["stock-movements"] });
      toast({
        title: "Stock adjusted",
        description: "Stock quantity has been adjusted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error adjusting stock",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    productLocations,
    isLoading,
    productLocationStock: getProductLocationStock.data,
    updateProductLocationStock: updateProductLocationStock.mutate,
    adjustLocationStock: adjustLocationStock.mutate,
  };
}
