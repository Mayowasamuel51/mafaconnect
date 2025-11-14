// src/hooks/useLocationStats.jsx
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api"; // ✅ Named import (NO default import)

export function useLocationStats() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["location-stats"],
    queryFn: async () => {
      const res = await apiGet("/locations/stats"); 
      return res.data; 
    },
  });

  return {
    locationStats: data || [],
    isLoading,
    error,
  };
}
