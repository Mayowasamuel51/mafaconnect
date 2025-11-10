import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useLoyaltyConfig() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: config, isLoading } = useQuery({
    queryKey: ["loyalty_config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("loyalty_config")
        .select("*")
        .single();

      if (error) throw error;
      return data;
    },
  });

  const updateConfig = useMutation({
    mutationFn: async (configData) => {
      const { error } = await supabase
        .from("loyalty_config")
        .update(configData)
        .eq("id", config?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loyalty_config"] });
      toast({
        title: "Success",
        description: "Loyalty configuration updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return { config, isLoading, updateConfig: updateConfig.mutate };
}
