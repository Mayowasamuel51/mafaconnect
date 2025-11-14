import { useQuery } from "@tanstack/react-query";

// 🔹 Generic API fetcher
async function fetchAPI(url) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export function useLoyaltyStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["loyalty-stats"],
    queryFn: async () => {
      // Call REST endpoint that aggregates loyalty stats
      const data = await fetchAPI("/api/loyalty/stats");

      // Expected response shape:
      // {
      //   totalPointsDistributed: number,
      //   rewardsRedeemed: number,
      //   activeMembers: number
      // }

      return {
        totalPointsDistributed: data.totalPointsDistributed || 0,
        rewardsRedeemed: data.rewardsRedeemed || 0,
        activeMembers: data.activeMembers || 0,
      };
    },
  });

  return { stats, isLoading };
}
