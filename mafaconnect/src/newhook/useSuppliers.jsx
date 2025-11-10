import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useSuppliers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: suppliers, isLoading } = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  const createSupplier = useMutation({
    mutationFn: async (supplierData: {
      name;
      contact_person?;
      email?;
      phone?;
      address?;
      payment_terms?;
      notes?;
    }) => {
      const { error } = await supabase
        .from("suppliers")
        .insert(supplierData);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast({
        title: "Success",
        description: "Supplier created successfully",
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

  const updateSupplier = useMutation({
    mutationFn: async ({ id, ...data }) => {
      const { error } = await supabase
        .from("suppliers")
        .update(data)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast({
        title: "Success",
        description: "Supplier updated successfully",
      });
    },
  });

  return { suppliers, isLoading, createSupplier: createSupplier.mutate, updateSupplier: updateSupplier.mutate };
}
