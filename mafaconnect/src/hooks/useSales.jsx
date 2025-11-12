import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";

/**
 * Handles all sales data operations via your Node.js backend
 */
export function useSales() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const apiBaseUrl = import.meta.env.VITE_HOME_OO; // e.g. "https://your-backend.com/api"

  // ✅ Fetch Sales
  const { data: sales, isLoading } = useQuery({
    queryKey: ["sales"],
    queryFn: async () => {
      const response = await axios.get(`${apiBaseUrl}/sales`);
      return response.data; // expected: [{id, customer, sale_items, ...}]
    },
  });

  // ✅ Create Sale
  const createSale = useMutation({
    mutationFn: async (saleData) => {
      // Expected saleData format:
      // { customer_id, location_id, items: [{ product_id, quantity, unit_price }], payment_method, discount_amount?, notes? }

      // Call your Node backend endpoint for sale creation
      const response = await axios.post(`${apiBaseUrl}/sales`, saleData);

      if (response.status !== 200) {
        throw new Error(response.data?.message || "Failed to create sale");
      }

      return response.data;
    },

    // ✅ On Success
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["loyalty-stats"] });

      toast({
        title: "Sale Completed",
        description: "The sale has been recorded successfully.",
      });
    },

    // ✅ On Error
    onError: (error) => {
      toast({
        title: "Error creating sale",
        description: error.message || "Something went wrong while creating the sale.",
        variant: "destructive",
      });
    },
  });

  return { sales, isLoading, createSale };
}

// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { supabase } from "@/integrations/supabase/client";
// import { useToast } from "@/hooks/use-toast";

// export function useSales() {
//   const { toast } = useToast();
//   const queryClient = useQueryClient();

//   const { data: sales, isLoading } = useQuery({
//     queryKey: ["sales"],
//     queryFn: async () => {
//       const { data, error } = await supabase
//         .from("sales")
//         .select(`
//           *,
//           customers(*),
//           sale_items(*, products(*))
//         `)
//         .order("created_at", { ascending: false })
//         .limit(50);

//       if (error) throw error;
//       return data;
//     },
//   });

//   const createSale = useMutation({
//     mutationFn: async (saleData: {
//       customer_id?;
//       location_id?;
//       items: Array<{ product_id; quantity; unit_price: number }>;
//       payment_method;
//       discount_amount?;
//       notes?;
//     }) => {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) throw new Error("Not authenticated");

//       // Validate stock availability at the specified location
//       if (saleData.location_id) {
//         for (const item of saleData.items) {
//           const { data: locationStock, error: stockError } = await supabase
//             .from("product_locations")
//             .select("stock_qty, product:products(name)")
//             .eq("product_id", item.product_id)
//             .eq("location_id", saleData.location_id)
//             .maybeSingle();

//           if (stockError) throw stockError;

//           if (!locationStock) {
//             const { data: product } = await supabase
//               .from("products")
//               .select("name")
//               .eq("id", item.product_id)
//               .single();
//             throw new Error(`${product?.name || "Product"} not available at this location`);
//           }

//           if (locationStock.stock_qty < item.quantity) {
//             const productName = (locationStock.product)?.name || "Product";
//             throw new Error(
//               `Insufficient stock for ${productName}. Available: ${locationStock.stock_qty}, Required: ${item.quantity}`
//             );
//           }
//         }
//       }

//       // Calculate totals
//       const subtotal = saleData.items.reduce(
//         (sum, item) => sum + item.quantity * item.unit_price,
//         0
//       );
//       const discount = saleData.discount_amount || 0;
//       const total = subtotal - discount;

//       // Create sale
//       const { data: sale, error: saleError } = await supabase
//         .from("sales")
//         .insert({
//           sales_agent_id: user.id,
//           customer_id: saleData.customer_id,
//           location_id: saleData.location_id,
//           total_amount: total,
//           discount_amount: discount,
//           payment_method: saleData.payment_method,
//           notes: saleData.notes,
//         })
//         .select()
//         .single();

//       if (saleError) throw saleError;

//       // Create sale items
//       const items = saleData.items.map((item) => ({
//         sale_id: sale.id,
//         product_id: item.product_id,
//         quantity: item.quantity,
//         unit_price: item.unit_price,
//         line_total: item.quantity * item.unit_price,
//       }));

//       const { error: itemsError } = await supabase
//         .from("sale_items")
//         .insert(items);

//       if (itemsError) throw itemsError;

//       // Update product stock by fetching current stock and decrementing
//       for (const item of saleData.items) {
//         // If location is specified, update location-specific stock
//         if (saleData.location_id) {
//           const { data: locationStock } = await supabase
//             .from("product_locations")
//             .select("stock_qty")
//             .eq("product_id", item.product_id)
//             .eq("location_id", saleData.location_id)
//             .single();

//           if (locationStock) {
//             await supabase
//               .from("product_locations")
//               .update({ stock_qty: locationStock.stock_qty - item.quantity })
//               .eq("product_id", item.product_id)
//               .eq("location_id", saleData.location_id);
//           }
//         }

//         // Also update global product stock
//         const { data: product } = await supabase
//           .from("products")
//           .select("stock_qty")
//           .eq("id", item.product_id)
//           .single();

//         if (product) {
//           await supabase
//             .from("products")
//             .update({ stock_qty: product.stock_qty - item.quantity })
//             .eq("id", item.product_id);
//         }
//       }

//       // Award loyalty points if customer is provided
//       if (saleData.customer_id) {
//         const { data: config } = await supabase
//           .from("loyalty_config")
//           .select("points_per_currency, multiplier")
//           .single();

//         if (config) {
//           const points = Math.floor(
//             (total / config.points_per_currency) * config.multiplier
//           );

//           const { data: loyaltyAccount } = await supabase
//             .from("loyalty_accounts")
//             .select("id")
//             .eq("customer_id", saleData.customer_id)
//             .single();

//           if (loyaltyAccount) {
//             await supabase.from("loyalty_transactions").insert({
//               loyalty_account_id: loyaltyAccount.id,
//               type: "earn",
//               points: points,
//               reference_id: sale.id,
//               note: `Earned from sale`,
//             });

//             await supabase
//               .from("loyalty_accounts")
//               .update({
//                 points_balance: await supabase
//                   .from("loyalty_accounts")
//                   .select("points_balance")
//                   .eq("id", loyaltyAccount.id)
//                   .single()
//                   .then(({ data }) => (data?.points_balance || 0) + points),
//               })
//               .eq("id", loyaltyAccount.id);
//           }
//         }
//       }

//       // Send receipt email if customer has email
//       const { data: customer } = await supabase
//         .from("customers")
//         .select("email")
//         .eq("id", saleData.customer_id || "")
//         .single();

//       if (customer?.email) {
//         try {
//           await supabase.functions.invoke("send-receipt", {
//             body: { saleId: sale.id },
//           });
//         } catch (error) {
//           console.error("Failed to send receipt:", error);
//         }
//       }

//       return sale;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["sales"] });
//       queryClient.invalidateQueries({ queryKey: ["products"] });
//       queryClient.invalidateQueries({ queryKey: ["product-locations"] });
//       queryClient.invalidateQueries({ queryKey: ["customers"] });
//       queryClient.invalidateQueries({ queryKey: ["loyalty-stats"] });
//       toast({
//         title: "Sale completed",
//         description: "The sale has been recorded successfully.",
//       });
//     },
//     onError: (error) => {
//       toast({
//         title: "Error creating sale",
//         description: error.message,
//         variant: "destructive",
//       });
//     },
//   });

//   return { sales, isLoading, createSale };
// }
