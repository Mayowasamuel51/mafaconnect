import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useLoyaltyStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["loyalty-stats"],
    queryFn: async () => {
      // Get total points distributed
      const { data: earnedPoints } = await supabase
        .from("loyalty_transactions")
        .select("points")
        .gt("points", 0);

      const totalPointsDistributed = earnedPoints?.reduce((sum, tx) => sum + tx.points, 0) || 0;

      // Get rewards redeemed count
      const { count: rewardsRedeemed } = await supabase
        .from("loyalty_transactions")
        .select("*", { count: "exact", head: true })
        .eq("type", "redemption");

      // Get active members count
      const { count: activeMembers } = await supabase
        .from("loyalty_accounts")
        .select("*", { count: "exact", head: true });

      return {
        totalPointsDistributed,
        rewardsRedeemed: rewardsRedeemed || 0,
        activeMembers: activeMembers || 0,
      };
    },
  });

  return { stats, isLoading };
}
