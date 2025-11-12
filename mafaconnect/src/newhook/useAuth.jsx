import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_HOME_OO; // e.g. http://localhost:8000/api

// ✅ Fetch the current user
async function fetchCurrentUser() {
  const token = localStorage.getItem("ACCESS_TOKEN");
  if (!token) throw new Error("No token");

  const res = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Unauthorized");
  }

  const data = await res.json();
  console.log("✅ /me response:", data);
  return data;
}

// ✅ Logout
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

export function useAuth() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loading, setLoading] = React.useState(true);

  const {
    data: userData,
    isLoading: userLoading,
    isError,
  } = useQuery({
    queryKey: ["authUser"],
    queryFn: fetchCurrentUser,
    retry: false,
    enabled: !!localStorage.getItem("ACCESS_TOKEN"),
  });

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

  const user = userData?.user || null;
  const role = user?.role || "guest";

  return {
    user,
    role,
    loading,
    signOut,
    isError,
    isAdmin: role === "admin",
    isManager: role === "manager",
    isSalesAgent: role === "sales_agent",
    isUser: role === "user",
  };
}





