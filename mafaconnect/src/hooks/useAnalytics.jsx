import { useQuery } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_HOME_OO; // e.g. https://to-backendapi-v1.onrender.com/api

export function useAnalytics() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const token = localStorage.getItem("ACCESS_TOKEN");
      if (!token) throw new Error("Not authenticated");

      const headers = { Authorization: `Bearer ${token}` };

      // --- 1️⃣ Get Total Revenue ---
      const salesRes = await fetch(`${API_URL}/sales/completed`, { headers });
      if (!salesRes.ok) throw new Error("Failed to fetch sales");
      const salesData = await salesRes.json();

      const totalRevenue =
        salesData?.reduce(
          (sum, sale) => sum + Number(sale.total_amount || 0),
          0
        ) || 0;

      // --- 2️⃣ Get Sales Count ---
      const salesCountRes = await fetch(`${API_URL}/sales/count`, { headers });
      const { count: salesCount } = await salesCountRes.json();

      // --- 3️⃣ Get Customer Count ---
      const customerCountRes = await fetch(`${API_URL}/customers/count`, { headers });
      const { count: customerCount } = await customerCountRes.json();

      // --- 4️⃣ Get Total Loyalty Points ---
      const loyaltyRes = await fetch(`${API_URL}/loyalty/points`, { headers });
      const loyaltyData = await loyaltyRes.json();

      const totalPoints =
        loyaltyData?.reduce(
          (sum, account) => sum + Number(account.points_balance || 0),
          0
        ) || 0;

      return {
        totalRevenue,
        salesCount: salesCount || 0,
        customerCount: customerCount || 0,
        totalPoints,
      };
    },
  });

  return { analytics, isLoading };
}


// import { useQuery } from "@tanstack/react-query";
// import { supabase } from "@/integrations/supabase/client";

// export function useAnalytics() {
//   const { data: analytics, isLoading } = useQuery({
//     queryKey: ["analytics"],
//     queryFn: async () => {
//       // Get total revenue
//       const { data: salesData } = await supabase
//         .from("sales")
//         .select("total_amount")
//         .eq("status", "completed");

//       const totalRevenue = salesData?.reduce(
//         (sum, sale) => sum + Number(sale.total_amount),
//         0
//       ) || 0;

//       // Get sales count
//       const { count: salesCount } = await supabase
//         .from("sales")
//         .select("*", { count: "exact", head: true });

//       // Get customer count
//       const { count: customerCount } = await supabase
//         .from("customers")
//         .select("*", { count: "exact", head: true });

//       // Get total loyalty points
//       const { data: loyaltyData } = await supabase
//         .from("loyalty_accounts")
//         .select("points_balance");

//       const totalPoints = loyaltyData?.reduce(
//         (sum, account) => sum + account.points_balance,
//         0
//       ) || 0;

//       return {
//         totalRevenue,
//         salesCount: salesCount || 0,
//         customerCount: customerCount || 0,
//         totalPoints,
//       };
//     },
//   });

//   return { analytics, isLoading };
// }
