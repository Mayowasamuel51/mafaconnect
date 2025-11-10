import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * API Base URL
 * Make sure your .env file has:
 * VITE_HOME_OO="https://your-backend-domain.com/api"
 */
const API_URL = import.meta.env.VITE_HOME_OO 
/**
 * Fetch the currently authenticated user
 */
async function fetchCurrentUser() {
  const token = localStorage.getItem("ACCESS_TOKEN");
  if (!token) throw new Error("No token");
  const res = await fetch(`${API_URL}/me`, {
    headers: { Authorization: `Bearer ${token}` },credentials: "include",
  });

  if (!res.ok) throw new Error("Unauthorized");
  return res.json();
}

/**
 * Logout request
 */
async function logoutRequest() {
  const token = localStorage.getItem("ACCESS_TOKEN");
  if (token) {
    await fetch(`${API_URL}/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  localStorage.removeItem("ACCESS_TOKEN");
}

/**
 * ✅ Main useAuth Hook
 * Handles user session, role checks, and logout
 */
export function useAuth() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loading, setLoading] = React.useState(true);

  // Fetch current user using React Query
  const {
    data: userData,
    isLoading: userLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["authUser"],
    queryFn: fetchCurrentUser,
    retry: false,
    enabled: !!localStorage.getItem("ACCESS_TOKEN"),
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: logoutRequest,
    onSuccess: () => {
      queryClient.removeQueries(["authUser"]);
      localStorage.removeItem("ACCESS_TOKEN");
      navigate("/auth");
    },
  });

  React.useEffect(() => {
    if (!userLoading) setLoading(false);
  }, [userLoading]);

  const signOut = async () => {
    await logoutMutation.mutateAsync();
  };

  // Extract user + roles from backend
  const user = userData?.user || userData?.admin || null;
  const roles =
    userData?.roles ||
    (user?.role ? [user.role] : []); // handle single-role users too

  // Role helpers
  const hasRole = (role) => roles.includes(role);
  const isAdmin = hasRole("admin");
  const isManager = hasRole("manager") || isAdmin;
  const isStaff = roles.some((r) => ["admin", "manager", "sales_agent"].includes(r));

  return {
    user,
    session: userData,
    loading,
    signOut,
    roles,
    hasRole,
    isAdmin,
    isManager,
    isStaff,
    refetch,
    isError,
  };
}


