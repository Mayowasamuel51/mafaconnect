import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const API_URL = import.meta.env.VITE_HOME_OO || "http://localhost:8000/api";

export function useStockTransfers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // 🔹 Fetch all stock transfers
  const {
    data: stockTransfers,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["stock-transfers"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/stock-transfers`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch stock transfers");
      const data = await res.json();
      return data.transfers || data; // handle flexible backend format
    },
  });

  // 🔹 Create new transfer
  const createTransfer = useMutation({
    mutationFn: async (transferData) => {
      const res = await fetch(`${API_URL}/stock-transfers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(transferData),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to create stock transfer");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["stock-transfers"]);
      toast({
        title: "✅ Transfer created",
        description: "Stock transfer initiated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "❌ Error creating transfer",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // 🔹 Approve transfer
  const approveTransfer = useMutation({
    mutationFn: async (transferId) => {
      const res = await fetch(`${API_URL}/stock-transfers/${transferId}/approve`, {
        method: "PUT",
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to approve transfer");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["stock-transfers"]);
      toast({
        title: "✅ Transfer approved",
        description: "Stock transfer has been approved.",
      });
    },
    onError: (error) => {
      toast({
        title: "❌ Approval error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // 🔹 Complete transfer
  const completeTransfer = useMutation({
    mutationFn: async (transferId) => {
      const res = await fetch(`${API_URL}/stock-transfers/${transferId}/complete`, {
        method: "PUT",
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to complete transfer");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["stock-transfers"]);
      toast({
        title: "✅ Transfer completed",
        description: "Stock successfully moved between locations.",
      });
    },
    onError: (error) => {
      toast({
        title: "❌ Error completing transfer",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // 🔹 Cancel transfer
  const cancelTransfer = useMutation({
    mutationFn: async (transferId) => {
      const res = await fetch(`${API_URL}/stock-transfers/${transferId}/cancel`, {
        method: "PUT",
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to cancel transfer");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["stock-transfers"]);
      toast({
        title: "🚫 Transfer cancelled",
        description: "Stock transfer has been cancelled.",
      });
    },
    onError: (error) => {
      toast({
        title: "❌ Cancellation error",
        description: error.message,
        variant: "destructive",
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
