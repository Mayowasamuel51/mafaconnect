import { useQuery } from "@tanstack/react-query";

export function useRewards() {
  const { data: rewards, isLoading } = useQuery({
    queryKey: ["rewards"],
    queryFn: async () => {
      const res = await fetch("/api/rewards", {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) throw new Error(`Failed to fetch rewards (HTTP ${res.status})`);

      const data = await res.json();
      return data;
    },
  });

  return { rewards, isLoading };
}
