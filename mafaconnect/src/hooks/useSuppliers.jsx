// src/hooks/useSuppliers.jsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPut } from "@/lib/api"; 
import { useToast } from "@/hooks/use-toast";

export function useSuppliers() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // 🔹 Fetch suppliers list
  const { data: suppliers, isLoading } = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const res = await apiGet("/suppliers");
      return res.data?.data || [];   // Adjust to match backend response
    },
  });

  // 🔹 Create Supplier
  const createSupplier = useMutation({
    mutationFn: async (supplierData) => {
      const res = await apiPost("/suppliers", supplierData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["suppliers"]);
      toast({
        title: "Success",
        description: "Supplier created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error?.response?.data?.message || error.message,
        variant: "destructive",
      });
    },
  });

  // 🔹 Update Supplier
  const updateSupplier = useMutation({
    mutationFn: async ({ id, ...data }) => {
      const res = await apiPut(`/suppliers/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["suppliers"]);
      toast({
        title: "Success",
        description: "Supplier updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error?.response?.data?.message || error.message,
        variant: "destructive",
      });
    },
  });

  return {
    suppliers,
    isLoading,
    createSupplier: createSupplier.mutate,
    updateSupplier: updateSupplier.mutate,
  };
}
