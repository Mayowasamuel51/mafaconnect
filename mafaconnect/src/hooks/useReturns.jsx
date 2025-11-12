import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useReturns() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: returns, isLoading } = useQuery({
    queryKey: ["returns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("returns")
        .select(`
          *,
          customers(*),
          sales(*)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const createReturn = useMutation({
    mutationFn: async (returnData: {
      saleId;
      customerId?;
      reason;
      items: Array<{
        productId;
        quantity;
        unitPrice;
        condition;
      }>;
      refundMethod;
      notes?;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const refundAmount = returnData.items.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0
      );

      const returnNumber = `RET-${Date.now()}`;

      const { data: returnRecord, error: returnError } = await supabase
        .from("returns")
        .insert({
          return_number: returnNumber,
          sale_id: returnData.saleId,
          customer_id: returnData.customerId,
          reason: returnData.reason,
          refund_amount: refundAmount,
          refund_method: returnData.refundMethod,
          notes: returnData.notes,
          processed_by: user.id,
          status: "pending",
        })
        .select()
        .single();

      if (returnError) throw returnError;

      const returnItems = returnData.items.map((item) => ({
        return_id: returnRecord.id,
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        line_total: item.quantity * item.unitPrice,
        condition: item.condition,
      }));

      const { error: itemsError } = await supabase
        .from("return_items")
        .insert(returnItems);

      if (itemsError) throw itemsError;

      return returnRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["returns"] });
      toast({
        title: "Success",
        description: "Return created successfully",
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

  const processReturn = useMutation({
    mutationFn: async ({
      id,
      status,
      restock,
    }: {
      id;
      status;
      restock;
    }) => {
      const { data: returnRecord, error: fetchError } = await supabase
        .from("returns")
        .select("*, return_items(*)")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      if (restock && status === "completed") {
        for (const item of returnRecord.return_items) {
          const { data: product } = await supabase
            .from("products")
            .select("stock_qty")
            .eq("id", item.product_id)
            .single();

          if (product) {
            await supabase
              .from("products")
              .update({ stock_qty: product.stock_qty + item.quantity })
              .eq("id", item.product_id);
          }
        }
      }

      const { error } = await supabase
        .from("returns")
        .update({ status, restocked: restock })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["returns"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({
        title: "Success",
        description: "Return processed successfully",
      });
    },
  });

  return { returns, isLoading, createReturn: createReturn.mutate, processReturn: processReturn.mutate };
}
