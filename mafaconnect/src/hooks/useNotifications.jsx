
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { useEffect } from "react";

export function useNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const API_BASE = import.meta.env.VITE_HOME_OO || "https://to-backendapi-v1.onrender.com";

  // ✅ Fetch notifications from your Node.js API
  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const res = await fetch(`${API_BASE}/api/notifications/${user.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch notifications");
      return await res.json();
    },
    enabled: !!user,
  });

  // ✅ Count unread notifications
  const unreadCount = notifications?.filter((n) => !n.read).length || 0;

  // ✅ Mark single notification as read
  const markAsRead = useMutation({
    mutationFn: async (notificationId) => {
      const res = await fetch(`${API_BASE}/api/notifications/${notificationId}/read`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error("Failed to mark notification as read");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // ✅ Mark all notifications as read
  const markAllAsRead = useMutation({
    mutationFn: async () => {
      if (!user) return;

      const res = await fetch(`${API_BASE}/api/notifications/${user.id}/read-all`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error("Failed to mark all notifications as read");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // ✅ Optional: Polling for new notifications
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }, 15000); // every 15s

    return () => clearInterval(interval);
  }, [user, queryClient]);

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead: markAsRead.mutate,
    markAllAsRead: markAllAsRead.mutate,
  };
}

// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { supabase } from "@/integrations/supabase/client";
// import { useAuth } from "./useAuth";
// import { useEffect } from "react";

// export function useNotifications() {
//   const { user } = useAuth();
//   const queryClient = useQueryClient();

//   // Fetch notifications
//   const { data: notifications, isLoading } = useQuery({
//     queryKey: ["notifications", user?.id],
//     queryFn: async () => {
//       if (!user) return [];

//       const { data, error } = await supabase
//         .from("notifications")
//         .select("*")
//         .eq("user_id", user.id)
//         .order("created_at", { ascending: false })
//         .limit(50);

//       if (error) throw error;
//       return data || [];
//     },
//     enabled: !!user,
//   });

//   // Count unread notifications
//   const unreadCount = notifications?.filter((n) => !n.read).length || 0;

//   // Mark mutation
//   const markAsRead = useMutation({
//     mutationFn: async (notificationId) => {
//       const { error } = await supabase
//         .from("notifications")
//         .update({ read: true })
//         .eq("id", notificationId);

//       if (error) throw error;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["notifications"] });
//     },
//   });

//   // Mark all
//   const markAllAsRead = useMutation({
//     mutationFn: async () => {
//       if (!user) return;

//       const { error } = await supabase
//         .from("notifications")
//         .update({ read: true })
//         .eq("user_id", user.id)
//         .eq("read", false);

//       if (error) throw error;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["notifications"] });
//     },
//   });

//   // Real-time subscription
//   useEffect(() => {
//     if (!user) return;

//     const channel = supabase
//       .channel("notifications-changes")
//       .on(
//         "postgres_changes",
//         {
//           event: "INSERT",
//           schema: "public",
//           table: "notifications",
//           filter: `user_id=eq.${user.id}`,
//         },
//         () => {
//           queryClient.invalidateQueries({ queryKey: ["notifications"] });
//         }
//       )
//       .subscribe();

//     return () => {
//       supabase.removeChannel(channel);
//     };
//   }, [user, queryClient]);

//   return {
//     notifications,
//     unreadCount,
//     isLoading,
//     markAsRead: markAsRead.mutate,
//     markAllAsRead: markAllAsRead.mutate,
//   };
// }
