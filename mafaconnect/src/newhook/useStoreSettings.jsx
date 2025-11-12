import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useStoreSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all store settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ["store-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("store_settings")
        .select("*");

      if (error) throw error;

      // Convert array to object for easier access
      const settingsMap = {};
      data.forEach((setting) => {
        settingsMap[setting.setting_key] = setting.setting_value;
      });

      return settingsMap;
    },
  });

  // Get specific setting
  const getSetting = (key, defaultValue?) => {
    return settings?.[key] || defaultValue;
  };

  // Update setting mutation (admin only)
  const updateSetting = useMutation({
    mutationFn: async ({ key, value }: { key; value: any }) => {
      const { error } = await supabase
        .from("store_settings")
        .update({ setting_value: value })
        .eq("setting_key", key);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-settings"] });
      toast({
        title: "Settings updated",
        description: "Store settings have been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    settings,
    isLoading,
    getSetting,
    updateSetting: updateSetting.mutate,
    isUpdating: updateSetting.isPending,
  };
}
