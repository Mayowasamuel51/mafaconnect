import { useQuery } from "@tanstack/react-query";

/**
 * API endpoint (replace with your backend base URL)
 */
const API_URL = import.meta.env.VITE_HOME_OO || "http://localhost:8000/api";

/**
 * Fetch audit logs from backend
 */
async function fetchAuditLogs() {
  const token = localStorage.getItem("ACCESS_TOKEN");
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_URL}/audit-logs`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to fetch audit logs: ${errText}`);
  }

  const data = await res.json();
  return data;
}

/**
 * useAuditLogs Hook (ReactJS + React Query)
 */
export function useAuditLogs() {
  const {
    data: logs,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["audit_logs"],
    queryFn: fetchAuditLogs,
  });

  return { logs: logs || [], isLoading, isError, error, refetch };
}


// import { useQuery } from "@tanstack/react-query";
// import { supabase } from "@/integrations/supabase/client";

// export function useAuditLogs() {
//   const { data: logs, isLoading } = useQuery({
//     queryKey: ["audit_logs"],
//     queryFn: async () => {
//       const { data, error } = await supabase
//         .from("audit_logs")
//         .select("*")
//         .order("created_at", { ascending: false })
//         .limit(100);

//       if (error) throw error;
//       return data;
//     },
//   });

//   return { logs, isLoading };
// }
