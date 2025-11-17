import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export function useProducts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isStaff } = useAuth();

  const apiBaseUrl = import.meta.env.VITE_HOME_OO;
  const token = localStorage.getItem("ACCESS_TOKEN");

  //Fetch products
  // const { data: products, isLoading } = useQuery({
  //   queryKey: ["products"],
  //   queryFn: async () => {
  //     const endpoint = isStaff ? "products" : "public-products";
  //     const res = await axios.get(`${apiBaseUrl}/products`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  //     return res.data;
  //   },
  // });

  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await axios.get(`${apiBaseUrl}/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Your backend returns: { success, message, data }
      return res.data.data; 
    },
  });
  //Create Product
  const createProduct = useMutation({
    mutationFn: async (productData) => {
      const formData = new FormData();

      formData.append("name", productData.name);
      formData.append("sku", productData.sku);
      formData.append("description", productData.description);
      formData.append("cost_price", productData.cost_price);
      formData.append("sale_price", productData.sale_price);
      formData.append("stock_qty", productData.stock_qty);
      formData.append("reorder_level", productData.reorder_level);
      formData.append("active", "true");

      // 🔥 Image File
      if (productData.image) {
        formData.append("images", productData.image); // must match Multer field
      }

      const res = await axios.post(`${apiBaseUrl}/products`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries(["products"]);
      toast({
        title: "Product Created",
        description: "The product has been added successfully.",
      });
    },

    onError: (error) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      });
    },
  });

  return { products, isLoading, createProduct };
}

// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import axios from "axios";
// import { useToast } from "@/hooks/use-toast";
// import { useAuth } from "@/hooks/useAuth";

// export function useProducts() {
//   const { toast } = useToast();
//   const queryClient = useQueryClient();
//   const { isStaff } = useAuth();
//   const apiBaseUrl = import.meta.env.VITE_HOME_OO;
//   const token = localStorage.getItem("ACCESS_TOKEN");


//   const api = axios.create({
//     baseURL: apiBaseUrl,
//     headers: {
//       Authorization: token ? `Bearer ${token}` : "",
//       "Content-Type": "application/json",
//     },
//   });

  
//   const { data: products, isLoading } = useQuery({
//     queryKey: ["products", isStaff],
//     queryFn: async () => {
//       let response;

//       if (isStaff) {
//         // Staff sees full data
//         response = await api.get(`/products`);
//       } else {
//         // Customers see public version
//         response = await api.get(`/public-products`);
//         response.data = response.data.sort((a, b) =>
//           a.name.localeCompare(b.name)
//         );
//       }

//       return response.data;
//     },
//   });

  
//   const createProduct = useMutation({
//     mutationFn: async (productData) => {
//       const response = await api.post(`/products`, productData);
//       if (!response || response.status >= 400) {
//         throw new Error(
//           response.data?.message || "Failed to create product"
//         );
//       }

//       return response.data;
//     },

//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["products"] });
//       toast({
//         title: "Product Created",
//         description: "The product has been added successfully.",
//       });
//     },

//     onError: (error) => {
//       toast({
//         title: "Error creating product",
//         description: error.message || "Something went wrong.",
//         variant: "destructive",
//       });
//     },
//   });

//   return { products, isLoading, createProduct };
// }


// // import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// // import { supabase } from "@/integrations/supabase/client";
// // import { useToast } from "@/hooks/use-toast";
// // import { useAuth } from "@/hooks/useAuth";





// // export function useProducts() {
// //   const { toast } = useToast();
// //   const queryClient = useQueryClient();
// //   const { isStaff } = useAuth();

// //   const { data: products, isLoading } = useQuery<ProductPublic[]>({
// //     queryKey: ["products", isStaff],
// //     queryFn: async () => {
// //       if (isStaff) {
// //         // Staff can access full product data including cost_price
// //         const { data, error } = await supabase
// //           .from("products")
// //           .select("*")
// //           .order("name");

// //         if (error) throw error;
// //         return data;
// //       } else {
// //         // Non-staff users get products without cost_price via secure function
// //         const { data, error } = await supabase
// //           .rpc("get_public_products");

// //         if (error) throw error;
// //         // Sort by name client-side since RPC doesn't support order()
// //         return data?.sort((a, b) => a.name.localeCompare(b.name)) || [];
// //       }
// //     },
// //   });

// //   const createProduct = useMutation({
// //     mutationFn: async (product) => {
// //       const { data, error } = await supabase
// //         .from("products")
// //         .insert(product)
// //         .select()
// //         .single();

// //       if (error) throw error;
// //       return data;
// //     },
// //     onSuccess: () => {
// //       queryClient.invalidateQueries({ queryKey: ["products"] });
// //       toast({
// //         title: "Product created",
// //         description: "The product has been added successfully.",
// //       });
// //     },
// //     onError: (error) => {
// //       toast({
// //         title: "Error creating product",
// //         description: error.message,
// //         variant: "destructive",
// //       });
// //     },
// //   });

// //   return { products, isLoading, createProduct };
// // }
