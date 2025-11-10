import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function usePurchaseOrders() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: purchaseOrders, isLoading } = useQuery({
    queryKey: ["purchase-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("purchase_orders")
        .select(`
          *,
          suppliers(*),
          locations(*)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const createPurchaseOrder = useMutation({
    mutationFn: async (poData: {
      supplierId;
      locationId?;
      expectedDelivery?;
      items: Array<{
        productId;
        quantity;
        unitCost;
      }>;
      notes?;
      tax?;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const subtotal = poData.items.reduce(
        (sum, item) => sum + item.quantity * item.unitCost,
        0
      );
      const taxAmount = poData.tax || 0;
      const totalAmount = subtotal + taxAmount;

      const poNumber = `PO-${Date.now()}`;

      const { data: po, error: poError } = await supabase
        .from("purchase_orders")
        .insert({
          po_number: poNumber,
          supplier_id: poData.supplierId,
          location_id: poData.locationId,
          expected_delivery: poData.expectedDelivery,
          subtotal,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          notes: poData.notes,
          created_by: user.id,
          status: "draft",
        })
        .select()
        .single();

      if (poError) throw poError;

      const poItems = poData.items.map((item) => ({
        po_id: po.id,
        product_id: item.productId,
        quantity_ordered: item.quantity,
        unit_cost: item.unitCost,
        line_total: item.quantity * item.unitCost,
      }));

      const { error: itemsError } = await supabase
        .from("purchase_order_items")
        .insert(poItems);

      if (itemsError) throw itemsError;

      return po;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      toast({
        title: "Success",
        description: "Purchase order created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const receivePurchaseOrder = useMutation({
    mutationFn: async ({ id, locationId }: { id; locationId?: string }) => {
      const { data: po, error: fetchError } = await supabase
        .from("purchase_orders")
        .select("*, purchase_order_items(*)")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      // Update stock for each item
      for (const item of po.purchase_order_items) {
        if (locationId) {
          // Update product_locations if location specified
          const { data: existing } = await supabase
            .from("product_locations")
            .select("*")
            .eq("product_id", item.product_id)
            .eq("location_id", locationId)
            .single();

          if (existing) {
            await supabase
              .from("product_locations")
              .update({ stock_qty: existing.stock_qty + item.quantity_ordered })
              .eq("id", existing.id);
          } else {
            await supabase
              .from("product_locations")
              .insert({
                product_id: item.product_id,
                location_id: locationId,
                stock_qty: item.quantity_ordered,
              });
          }
        } else {
          // Update main products table
          const { data: product } = await supabase
            .from("products")
            .select("stock_qty")
            .eq("id", item.product_id)
            .single();

          if (product) {
            await supabase
              .from("products")
              .update({ stock_qty: product.stock_qty + item.quantity_ordered })
              .eq("id", item.product_id);
          }
        }

        // Update received quantity
        await supabase
          .from("purchase_order_items")
          .update({ quantity_received: item.quantity_ordered })
          .eq("id", item.id);
      }

      // Update PO status
      const { error } = await supabase
        .from("purchase_orders")
        .update({ 
          status: "received",
          received_date: new Date().toISOString().split('T')[0]
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product-locations"] });
      toast({
        title: "Success",
        description: "Purchase order received and stock updated",
      });
    },
  });

  return { 
    purchaseOrders, 
    isLoading, 
    createPurchaseOrder: createPurchaseOrder.mutate, 
    receivePurchaseOrder: receivePurchaseOrder.mutate 
  };
}
