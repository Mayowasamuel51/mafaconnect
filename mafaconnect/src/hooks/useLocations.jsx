import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useLocations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: locations, isLoading } = useQuery({
    queryKey: ["locations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("locations")
        .select("*")
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  const createLocation = useMutation({
    mutationFn: async (locationData: {
      name;
      address?;
      phone?;
      email?;
      state?;
      zone?;
      location_type?;
      capacity_sqft?;
      manager_id?: string | null;
      active?;
    }) => {
      const { error } = await supabase
        .from("locations")
        .insert(locationData);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      toast({
        title: "Success",
        description: "Location created successfully",
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

  const updateLocation = useMutation({
    mutationFn: async ({ id, ...data }) => {
      const { error } = await supabase
        .from("locations")
        .update(data)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      toast({
        title: "Success",
        description: "Location updated successfully",
      });
    },
  });

  return { locations, isLoading, createLocation: createLocation.mutate, updateLocation: updateLocation.mutate };
}
