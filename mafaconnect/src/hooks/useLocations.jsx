import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const API_URL = import.meta.env.VITE_HOME_OO || "http://localhost:8000/api";

export function useLocations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // 🔹 Fetch all locations
  const { data: locations, isLoading } = useQuery({
    queryKey: ["locations"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/locations`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch locations");
      const data = await res.json();
      return data.locations || data; // handle flexible response format
    },
  });

  // 🔹 Create a new location
  const createLocation = useMutation({
    mutationFn: async (locationData) => {
      const res = await fetch(`${API_URL}/locations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(locationData),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to create location");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["locations"]);
      toast({
        title: "✅ Success",
        description: "Location created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "❌ Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // 🔹 Update an existing location
  const updateLocation = useMutation({
    mutationFn: async ({ id, ...data }) => {
      const res = await fetch(`${API_URL}/locations/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to update location");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["locations"]);
      toast({
        title: "✅ Success",
        description: "Location updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "❌ Error updating location",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    locations,
    isLoading,
    createLocation: createLocation.mutate,
    updateLocation: updateLocation.mutate,
  };
}
