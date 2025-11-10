import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useAnalytics() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      // Get total revenue
      const { data: salesData } = await supabase
        .from("sales")
        .select("total_amount")
        .eq("status", "completed");

      const totalRevenue = salesData?.reduce(
        (sum, sale) => sum + Number(sale.total_amount),
        0
      ) || 0;

      // Get sales count
      const { count: salesCount } = await supabase
        .from("sales")
        .select("*", { count: "exact", head: true });

      // Get customer count
      const { count: customerCount } = await supabase
        .from("customers")
        .select("*", { count: "exact", head: true });

      // Get total loyalty points
      const { data: loyaltyData } = await supabase
        .from("loyalty_accounts")
        .select("points_balance");

      const totalPoints = loyaltyData?.reduce(
        (sum, account) => sum + account.points_balance,
        0
      ) || 0;

      return {
        totalRevenue,
        salesCount: salesCount || 0,
        customerCount: customerCount || 0,
        totalPoints,
      };
    },
  });

  return { analytics, isLoading };
}
