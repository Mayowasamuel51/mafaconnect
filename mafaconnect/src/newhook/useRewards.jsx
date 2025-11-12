import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useRewards() {
  const { data: rewards, isLoading } = useQuery({
    queryKey: ["rewards"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rewards")
        .select("*")
        .eq("active", true)
        .order("points_cost");

      if (error) throw error;
      return data;
    },
  });

  return { rewards, isLoading };
}
