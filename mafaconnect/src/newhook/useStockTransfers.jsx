import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useStockTransfers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stockTransfers, isLoading, isError, error } = useQuery({
    queryKey: ["stock-transfers"],
    queryFn: async () => {
      console.log("Fetching stock transfers...");
      const { data, error } = await supabase
        .from("stock_movements")
        .select(`
          *,
          product:products!product_id(name, sku),
          from_location:locations!from_location_id(name, state),
          to_location:locations!to_location_id(name, state),
          processor:profiles!processed_by(full_name),
          approver:profiles!approved_by(full_name)
        `)
        .eq("movement_type", "transfer")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching stock transfers:", error);
        throw error;
      }
      console.log("Stock transfers fetched:", data?.length || 0);
      return data;
    },
  });

  const createTransfer = useMutation({
    mutationFn: async ({
      productId,
      fromLocationId,
      toLocationId,
      quantity,
      expectedDelivery,
      notes,
    }: {
      productId;
      fromLocationId;
      toLocationId;
      quantity;
      expectedDelivery?;
      notes?;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Check stock availability at source location
      const { data: sourceStock, error: stockError } = await supabase
        .from("product_locations")
        .select("stock_qty")
        .eq("product_id", productId)
        .eq("location_id", fromLocationId)
        .single();

      if (stockError) throw stockError;
      if (!sourceStock || sourceStock.stock_qty < quantity) {
        throw new Error("Insufficient stock at source location");
      }

      const movementNumber = `TRF-${Date.now()}`;

      const { error } = await supabase
        .from("stock_movements")
        .insert({
          product_id: productId,
          from_location_id: fromLocationId,
          to_location_id: toLocationId,
          quantity,
          movement_type: "transfer",
          movement_number: movementNumber,
          notes,
          processed_by: user.id,
          status: "pending",
          expected_delivery: expectedDelivery,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-transfers"] });
      toast({
        title: "Transfer created",
        description: "Stock transfer has been initiated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating transfer",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const approveTransfer = useMutation({
    mutationFn: async (transferId) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("stock_movements")
        .update({
          status: "approved",
          approved_by: user.id,
          approved_at: new Date().toISOString(),
        })
        .eq("id", transferId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-transfers"] });
      toast({
        title: "Transfer approved",
        description: "Stock transfer has been approved.",
      });
    },
  });

  const completeTransfer = useMutation({
    mutationFn: async (transferId) => {
      const { data: transfer, error: fetchError } = await supabase
        .from("stock_movements")
        .select("*")
        .eq("id", transferId)
        .single();

      if (fetchError) throw fetchError;
      if (!transfer) throw new Error("Transfer not found");

      // Deduct from source location
      const { data: sourceStock, error: sourceError } = await supabase
        .from("product_locations")
        .select("stock_qty")
        .eq("product_id", transfer.product_id)
        .eq("location_id", transfer.from_location_id)
        .single();

      if (sourceError) throw sourceError;

      await supabase
        .from("product_locations")
        .update({ stock_qty: sourceStock.stock_qty - transfer.quantity })
        .eq("product_id", transfer.product_id)
        .eq("location_id", transfer.from_location_id);

      // Add to destination location
      const { data: destStock } = await supabase
        .from("product_locations")
        .select("stock_qty")
        .eq("product_id", transfer.product_id)
        .eq("location_id", transfer.to_location_id)
        .maybeSingle();

      if (destStock) {
        await supabase
          .from("product_locations")
          .update({ stock_qty: destStock.stock_qty + transfer.quantity })
          .eq("product_id", transfer.product_id)
          .eq("location_id", transfer.to_location_id);
      } else {
        await supabase.from("product_locations").insert({
          product_id: transfer.product_id,
          location_id: transfer.to_location_id,
          stock_qty: transfer.quantity,
          reorder_level: 10,
        });
      }

      // Update transfer status
      const { error: updateError } = await supabase
        .from("stock_movements")
        .update({
          status: "completed",
          actual_delivery: new Date().toISOString(),
        })
        .eq("id", transferId);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-transfers"] });
      queryClient.invalidateQueries({ queryKey: ["product-locations"] });
      toast({
        title: "Transfer completed",
        description: "Stock has been successfully transferred.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error completing transfer",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const cancelTransfer = useMutation({
    mutationFn: async (transferId) => {
      const { error } = await supabase
        .from("stock_movements")
        .update({ status: "cancelled" })
        .eq("id", transferId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-transfers"] });
      toast({
        title: "Transfer cancelled",
        description: "Stock transfer has been cancelled.",
      });
    },
  });

  return {
    stockTransfers,
    isLoading,
    isError,
    error,
    createTransfer: createTransfer.mutate,
    approveTransfer: approveTransfer.mutate,
    completeTransfer: completeTransfer.mutate,
    cancelTransfer: cancelTransfer.mutate,
  };
}
