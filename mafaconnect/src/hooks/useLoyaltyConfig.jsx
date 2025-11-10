import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

// Dummy API base URL — replace with your Node.js backend URL
const API_BASE = "https://your-backend-api.com/api";

export function useLoyaltyConfig() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // ✅ Fetch loyalty configuration
  const { data: config, isLoading } = useQuery({
    queryKey: ["loyalty_config"],
    queryFn: async () => {
      try {
        const res = await fetch(`${API_BASE}/loyalty/config`);
        if (!res.ok) throw new Error("Failed to load loyalty config");
        const data = await res.json();
        return data;
      } catch (err) {
        console.error("Error fetching loyalty config:", err);
        throw err;
      }
    },
  });

  // ✅ Update loyalty configuration
  const updateConfig = useMutation({
    mutationFn: async (configData) => {
      const res = await fetch(`${API_BASE}/loyalty/config/${config?.id || 1}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(configData),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to update loyalty configuration");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["loyalty_config"]);
      toast({
        title: "Success",
        description: "Loyalty configuration updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  return {
    config,
    isLoading,
    updateConfig: updateConfig.mutate,
  };
}

// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { supabase } from "@/integrations/supabase/client";
// import { useToast } from "@/hooks/use-toast";

// export function useLoyaltyConfig() {
//   const { toast } = useToast();
//   const queryClient = useQueryClient();

//   const { data: config, isLoading } = useQuery({
//     queryKey: ["loyalty_config"],
//     queryFn: async () => {
//       const { data, error } = await supabase
//         .from("loyalty_config")
//         .select("*")
//         .single();

//       if (error) throw error;
//       return data;
//     },
//   });

//   const updateConfig = useMutation({
//     mutationFn: async (configData) => {
//       const { error } = await supabase
//         .from("loyalty_config")
//         .update(configData)
//         .eq("id", config?.id);

//       if (error) throw error;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["loyalty_config"] });
//       toast({
//         title: "Success",
//         description: "Loyalty configuration updated successfully",
//       });
//     },
//     onError: (error: Error) => {
//       toast({
//         title: "Error",
//         description: error.message,
//         variant: "destructive",
//       });
//     },
//   });

//   return { config, isLoading, updateConfig: updateConfig.mutate };
// }
