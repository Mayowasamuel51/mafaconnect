import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "./useAuth";

export function useCustomerOrders() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch customer orders
  const { data: orders, isLoading } = useQuery({
    queryKey: ["customer-orders", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("customer_orders")
        .select(`
          *,
          customer:customers!customer_id (
            id,
            name,
            email,
            phone
          ),
          items:customer_order_items (
            *,
            product:products (
              name,
              sku
            )
          )
        `)
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Get single order by ID
  const getOrderById = async (orderId) => {
    const { data, error } = await supabase
      .from("customer_orders")
      .select(`
        *,
        customer:customers!customer_id (
          id,
          name,
          email,
          phone
        ),
        items:customer_order_items (
          *,
          product:products (
            name,
            sku
          )
        ),
        history:order_status_history (
          *,
          changed_by_user:profiles!changed_by (
            full_name
          )
        )
      `)
      .eq("id", orderId)
      .single();

    if (error) throw error;
    return data;
  };

  // Cancel order mutation
  const cancelOrder = useMutation({
    mutationFn: async ({ orderId, reason }: { orderId; reason: string }) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("customer_orders")
        .update({
          status: "cancelled",
          cancellation_reason: reason,
          cancelled_at: new Date().toISOString(),
          cancelled_by: user.id,
        })
        .eq("id", orderId)
        .eq("customer_id", user.id);

      if (error) throw error;

      // Add status history entry
      await supabase.from("order_status_history").insert({
        order_id: orderId,
        from_status: "pending",
        to_status: "cancelled",
        notes: reason,
        changed_by: user.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-orders"] });
      toast({
        title: "Order cancelled",
        description: "Your order has been cancelled successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error cancelling order",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    orders,
    isLoading,
    getOrderById,
    cancelOrder: cancelOrder.mutate,
    isCancelling: cancelOrder.isPending,
  };
}
