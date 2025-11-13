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
  console.log("/me response:", data);
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

  // ✅ Normalize user data
  const user = userData?.user || userData || null;
  const role = user?.role?.toLowerCase?.() || "guest";
  const roles = Array.isArray(user?.roles)
    ? user.roles.map((r) => r.toLowerCase())
    : [role];

  // ✅ Derived role flags
  const isAdmin = roles.includes("admin");
  const isManager = roles.includes("manager");
  const isSalesAgent = roles.includes("sales_agent");
  const isUser = roles.includes("user");
  const isStaff = isAdmin || isManager || isSalesAgent; // for dashboard filtering

  // ✅ Log for debugging
  console.log("🔍 Auth roles:", { role, roles, isAdmin, isManager, isSalesAgent, isStaff });

  return {
    user,
    role,
    roles,
    loading,
    signOut,
    isError,
    isAdmin,
    isManager,
    isSalesAgent,
    isUser,
    isStaff,
  };
}




// import React from "react";
// import { useNavigate } from "react-router-dom";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// const API_URL = import.meta.env.VITE_HOME_OO; // e.g. http://localhost:8000/api

// // ✅ Fetch the current user
// async function fetchCurrentUser() {
//   const token = localStorage.getItem("ACCESS_TOKEN");
//   if (!token) throw new Error("No token");

//   const res = await fetch(`${API_URL}/auth/me`, {
//     headers: { Authorization: `Bearer ${token}` },
//     credentials: "include",
//   });

//   if (!res.ok) {
//     throw new Error("Unauthorized");
//   }

//   const data = await res.json();
//   console.log("✅ /me response:", data);
//   return data;
// }

// // ✅ Logout
// async function logoutRequest() {
//   const token = localStorage.getItem("ACCESS_TOKEN");
//   if (token) {
//     await fetch(`${API_URL}/logout`, {
//       method: "POST",
//       headers: { Authorization: `Bearer ${token}` },
//     });
//   }
//   localStorage.removeItem("ACCESS_TOKEN");
// }

// export function useAuth() {
//   const navigate = useNavigate();
//   const queryClient = useQueryClient();
//   const [loading, setLoading] = React.useState(true);

//   const {
//     data: userData,
//     isLoading: userLoading,
//     isError,
//   } = useQuery({
//     queryKey: ["authUser"],
//     queryFn: fetchCurrentUser,
//     retry: false,
//     enabled: !!localStorage.getItem("ACCESS_TOKEN"),
//   });

//   const logoutMutation = useMutation({
//     mutationFn: logoutRequest,
//     onSuccess: () => {
//       queryClient.removeQueries(["authUser"]);
//       localStorage.removeItem("ACCESS_TOKEN");
//       navigate("/auth");
//     },
//   });

//   React.useEffect(() => {
//     if (!userLoading) setLoading(false);
//   }, [userLoading]);

//   const signOut = async () => {
//     await logoutMutation.mutateAsync();
//   };

//   const user = userData?.user || null;
//   const role = user?.role || "guest";


// // const roles = user?.roles || [];
//   return {
//     user,
//     role,
//     roles: user?.roles || [],
//     loading,
//     signOut,
//     isError,
//     isAdmin: role === "admin",
//     isManager: role === "manager",
//     isSalesAgent: role === "sales_agent",
//     isUser: role === "user",
//   };
// }





