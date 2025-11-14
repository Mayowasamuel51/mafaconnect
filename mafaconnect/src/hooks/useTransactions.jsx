import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { TRANSACTION_TYPES } from "@/lib/transactionUtils";

/**
 * Custom hook for managing sales / transaction data via REST API
 * Replaces all Supabase calls with standard fetch() requests.
 */
export function useTransactions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // 🔹 Fetch all transactions
  const { data: transactions, isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const res = await fetch("/api/transactions");
      if (!res.ok) throw new Error("Failed to fetch transactions");
      return res.json();
    },
  });

  // 🔹 Create new transaction
  const createTransaction = useMutation({
    mutationFn: async (transactionData) => {
      console.log("🔐 Creating new transaction...");

      // Validate required fields
      const config = TRANSACTION_TYPES[transactionData.transactionType];
      if (config.requiresCustomer && !transactionData.customerId) {
        throw new Error("Customer is required for this transaction type");
      }
      if (config.requiresLocation && !transactionData.locationId) {
        throw new Error("Location is required for this transaction type");
      }

      // Perform REST API call
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transactionData),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error("❌ Transaction creation failed:", data);
        throw new Error(data.message || "Failed to create transaction");
      }

      return data;
    },
    onSuccess: () => {
      // Refresh relevant caches
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product-locations"] });
      toast({
        title: "Success",
        description: "Transaction created successfully",
      });
    },
    onError: (error) => {
      console.error("❌ Transaction creation failed:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create transaction",
        variant: "destructive",
      });
    },
  });

  // 🔹 Update transaction status (e.g. draft → sent → paid)
  const updateTransactionStatus = useMutation({
    mutationFn: async ({ id, status }) => {
      const res = await fetch(`/api/transactions/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update status");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast({
        title: "Success",
        description: "Status updated successfully",
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

  return {
    transactions,
    isLoading,
    createTransaction: createTransaction.mutate,
    updateTransactionStatus: updateTransactionStatus.mutate,
    isCreating: createTransaction.isPending,
  };
}
