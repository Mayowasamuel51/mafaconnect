import { useQuery } from "@tanstack/react-query";
import axios from "axios";

/**
 * Fetch customers from your Node.js backend API
 * (Replace the API URL with your backend route)
 */
export function useCustomers() {
  const apiBaseUrl = import.meta.env.VITE_HOME_OO; // example: "https://your-backend.com/api"

  const { data: customers, isLoading, error } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const response = await axios.get(`${apiBaseUrl}/customers`);
      return response.data; // expected to return [{ id, name, loyalty_accounts: [...] }, ...]
    },
  });

  if (error) {
    console.error("Error fetching customers:", error);
  }

  return { customers, isLoading };
}

// import { useQuery } from "@tanstack/react-query";
// import { supabase } from "@/integrations/supabase/client";

// export function useCustomers() {
//   const { data: customers, isLoading } = useQuery({
//     queryKey: ["customers"],
//     queryFn: async () => {
//       const { data, error } = await supabase
//         .from("customers")
//         .select(`
//           *,
//           loyalty_accounts(*)
//         `)
//         .order("name");

//       if (error) throw error;
//       return data;
//     },
//   });

//   return { customers, isLoading };
// }
