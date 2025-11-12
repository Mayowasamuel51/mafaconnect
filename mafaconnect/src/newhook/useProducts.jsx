
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export function useProducts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isStaff } = useAuth();

  const apiBaseUrl = import.meta.env.VITE_HOME_OO; // e.g. "https://your-backend.com/api"

  // ✅ Fetch products
  const { data: products, isLoading } = useQuery({
    queryKey: ["products", isStaff],
    queryFn: async () => {
      if (isStaff) {
        // Staff: get all product fields
        const response = await axios.get(`${apiBaseUrl}/products`);
        return response.data;
      } else {
        // Non-staff: fetch public (sanitized) product list
        const response = await axios.get(`${apiBaseUrl}/public-products`);
        return response.data.sort((a, b) => a.name.localeCompare(b.name));
      }
    },
  });

  // ✅ Create Product
  const createProduct = useMutation({
    mutationFn: async (productData) => {
      const response = await axios.post(`${apiBaseUrl}/products`, productData);
      if (response.status !== 200 && response.status !== 201) {
        throw new Error(response.data?.message || "Failed to create product");
      }
      return response.data;
    },

    // ✅ On Success
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({
        title: "Product Created",
        description: "The product has been added successfully.",
      });
    },

    // ✅ On Error
    onError: (error) => {
      toast({
        title: "Error creating product",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    },
  });

  return { products, isLoading, createProduct };
}

// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { supabase } from "@/integrations/supabase/client";
// import { useToast } from "@/hooks/use-toast";
// import { useAuth } from "@/hooks/useAuth";





// export function useProducts() {
//   const { toast } = useToast();
//   const queryClient = useQueryClient();
//   const { isStaff } = useAuth();

//   const { data: products, isLoading } = useQuery<ProductPublic[]>({
//     queryKey: ["products", isStaff],
//     queryFn: async () => {
//       if (isStaff) {
//         // Staff can access full product data including cost_price
//         const { data, error } = await supabase
//           .from("products")
//           .select("*")
//           .order("name");

//         if (error) throw error;
//         return data;
//       } else {
//         // Non-staff users get products without cost_price via secure function
//         const { data, error } = await supabase
//           .rpc("get_public_products");

//         if (error) throw error;
//         // Sort by name client-side since RPC doesn't support order()
//         return data?.sort((a, b) => a.name.localeCompare(b.name)) || [];
//       }
//     },
//   });

//   const createProduct = useMutation({
//     mutationFn: async (product) => {
//       const { data, error } = await supabase
//         .from("products")
//         .insert(product)
//         .select()
//         .single();

//       if (error) throw error;
//       return data;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["products"] });
//       toast({
//         title: "Product created",
//         description: "The product has been added successfully.",
//       });
//     },
//     onError: (error) => {
//       toast({
//         title: "Error creating product",
//         description: error.message,
//         variant: "destructive",
//       });
//     },
//   });

//   return { products, isLoading, createProduct };
// }
