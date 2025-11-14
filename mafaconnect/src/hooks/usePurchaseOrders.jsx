import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPut } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export function usePurchaseOrders() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // ================================
  // 🔹 GET ALL PURCHASE ORDERS
  // ================================
  const { data: purchaseOrders, isLoading } = useQuery({
    queryKey: ["purchase-orders"],
    queryFn: async () => {
      const res = await apiGet("/purchase-orders");
      return res.data;
    },
  });

  // ================================
  // 🔹 CREATE PURCHASE ORDER
  // ================================
  const createPurchaseOrder = useMutation({
    mutationFn: async (poData) => {
      // Backend expects:
      // supplierId, locationId, expectedDelivery, items[], tax, notes

      const res = await apiPost("/purchase-orders", poData);
      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });

      toast({
        title: "Success",
        description: "Purchase order created successfully",
      });
    },

    onError: (err) => {
      toast({
        title: "Error",
        description: err.response?.data?.message || err.message,
        variant: "destructive",
      });
    },
  });

  // ================================
  // 🔹 RECEIVE PURCHASE ORDER
  // (Update PO + Update Stock)
  // ================================
  const receivePurchaseOrder = useMutation({
    mutationFn: async ({ id, locationId }) => {
      // Call backend endpoint:
      // POST /purchase-orders/:id/receive
      const res = await apiPost(`/purchase-orders/${id}/receive`, {
        locationId: locationId || null,
      });

      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product-locations"] });

      toast({
        title: "Success",
        description: "Purchase order received & stock updated",
      });
    },

    onError: (err) => {
      toast({
        title: "Error",
        description: err.response?.data?.message || err.message,
        variant: "destructive",
      });
    },
  });

  return {
    purchaseOrders,
    isLoading,
    createPurchaseOrder: createPurchaseOrder.mutate,
    receivePurchaseOrder: receivePurchaseOrder.mutate,
  };
}
