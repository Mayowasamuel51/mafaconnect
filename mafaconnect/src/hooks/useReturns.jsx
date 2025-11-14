import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export function useReturns() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // ----------------------------------------------------
  // FETCH RETURNS
  // ----------------------------------------------------
  const { data: returns, isLoading } = useQuery({
    queryKey: ["returns"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/returns`);
      if (!res.ok) throw new Error("Failed to load returns");
      return res.json();
    },
  });

  // ----------------------------------------------------
  // CREATE RETURN
  // ----------------------------------------------------
  const createReturn = useMutation({
    mutationFn: async (returnData) => {
      const refundAmount = returnData.items.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0
      );

      const payload = {
        return_number: `RET-${Date.now()}`,
        sale_id: returnData.saleId,
        customer_id: returnData.customerId || null,
        reason: returnData.reason,
        items: returnData.items,
        refund_amount: refundAmount,
        refund_method: returnData.refundMethod,
        notes: returnData.notes || "",
      };

      const res = await fetch(`${API_URL}/api/returns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Error" }));
        throw new Error(error.message || "Failed to create return");
      }

      return res.json();
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["returns"] });
      toast({
        title: "Success",
        description: "Return created successfully",
      });
    },

    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // ----------------------------------------------------
  // PROCESS RETURN (approve, reject, complete, restock)
  // ----------------------------------------------------
  const processReturn = useMutation({
    mutationFn: async ({ id, status, restock }) => {
      const res = await fetch(`${API_URL}/api/returns/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, restock }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Error" }));
        throw new Error(error.message || "Failed to process return");
      }

      return res.json();
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["returns"] });
      queryClient.invalidateQueries({ queryKey: ["products"] }); // restock
      toast({
        title: "Success",
        description: "Return processed successfully",
      });
    },
  });

  return {
    returns,
    isLoading,
    createReturn: createReturn.mutate,
    processReturn: processReturn.mutate,
  };
}
