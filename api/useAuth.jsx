














// import React from "react";
// import { useNavigate } from "react-router-dom";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// /**
//  * API Base URL
//  */
// const API_URL = import.meta.env.VITE_HOME_OO;

// async function fetchCurrentUser() {
//   const token = localStorage.getItem("ACCESS_TOKEN");
//   if (!token) throw new Error("No token");

//   const res = await fetch(`${API_URL}/auth/me`, {
//     headers: { Authorization: `Bearer ${token}` },
//     credentials: "include",
//   });

//   if (!res.ok) {
//     console.error("Fetch /me failed:", res.status, await res.text());
//     throw new Error("Unauthorized");
//   }

//   const data = await res.json();
//   console.log("✅ /me response:", data);
//   return data;
// }

// /**
//  * Logout request
//  */
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

// /**
//  * ✅ Main useAuth Hook
//  */
// export function useAuth() {
//   const navigate = useNavigate();
//   const queryClient = useQueryClient();
//   const [loading, setLoading] = React.useState(true);

//   // Fetch current user
//   const {
//     data: userData,
//     isLoading: userLoading,
//     isError,
//     refetch,
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
//   const roles = userData?.roles || (user?.role ? [user.role] : []);
//   const hasRole = (role) => roles.includes(role);
//   const isAdmin = hasRole("admin");
//   const isManager = hasRole("manager") || isAdmin;
//   const isStaff = roles.some((r) => ["admin", "manager", "sales_agent"].includes(r));

//   return {
//     user,
//     session: userData,
//     loading,
//     signOut,
//     roles,
//     hasRole,
//     isAdmin,
//     isManager,
//     isStaff,
//     refetch,
//     isError,
//   };
// }

















































// import React from "react";
// import { useNavigate } from "react-router-dom";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// /**
//  * Simple API wrapper (replace with your actual backend endpoints)
//  */
// const API_URL = import.meta.env.VITE_HOME_OO || "http://localhost:8000/api";

// async function fetchCurrentUser() {
//   const token = localStorage.getItem("ACCESS_TOKEN");
//   if (!token) throw new Error("No token");

//   const res = await fetch(`${API_URL}/auth/me`, {
//     headers: { Authorization: `Bearer ${token}` },
//   });

//   if (!res.ok) throw new Error("Unauthorized");
//   return res.json();
// }

// async function logoutRequest() {
//   const token = localStorage.getItem("ACCESS_TOKEN");
//   if (!token) return;

//   await fetch(`${API_URL}/auth/logout`, {
//     method: "POST",
//     headers: { Authorization: `Bearer ${token}` },
//   });

//   localStorage.removeItem("ACCESS_TOKEN");
// }

// /**
//  * useAuth Hook (ReactJS + React Query)
//  */
// export function useAuth() {
//   const navigate = useNavigate();
//   const queryClient = useQueryClient();
//   const [loading, setLoading] = React.useState(true);

//   const {
//     data: userData,
//     isLoading: userLoading,
//     isError,
//     refetch,
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
//     if (!userLoading) {
//       setLoading(false);
//     }
//   }, [userLoading]);

//   const signOut = async () => {
//     await logoutMutation.mutateAsync();
//   };

//   const user = userData?.user || null;
//   const roles = userData?.roles || [];

//   // Role helpers
//   const hasRole = (role) => roles.includes(role);
//   const isAdmin = hasRole("admin");
//   const isManager = hasRole("manager") || isAdmin;
//   const isStaff = roles.some((r) => ["admin", "manager", "sales_agent"].includes(r));

//   return {
//     user,
//     session: userData,
//     loading,
//     signOut,
//     roles,
//     hasRole,
//     isAdmin,
//     isManager,
//     isStaff,
//     refetch,
//     isError,
//   };
// }

// import React from "react";
// import { useNavigate } from "react-router-dom";
// import { supabase } from "@/integrations/supabase/client";
// import { User, Session } from "@supabase/supabase-js";

// export function useAuth() {
//   const [user, setUser] = React.useState(null);
//   const [session, setSession] = React.useState(null);
//   const [loading, setLoading] = React.useState(true);
//   const [roles, setRoles] = React.useState([]);
//   const [rolesLoaded, setRolesLoaded] = React.useState(false);
//   const navigate = useNavigate();

//   const fetchUserRoles = async (userId) => {
//     try {
//       const { data } = await supabase
//         .from("user_roles")
//         .select("role")
//         .eq("user_id", userId);
      
//       if (data) {
//         setRoles(data.map(r => r.role));
//       }
//       setRolesLoaded(true);
//     } catch (error) {
//       console.error("Error fetching roles:", error);
//       setRolesLoaded(true);
//     }
//   };

//   React.useEffect(() => {
//     // Set up auth state listener FIRST
//     const { data: { subscription } } = supabase.auth.onAuthStateChange(
//       (event, session) => {
//         setSession(session);
//         setUser(session?.user ?? null);
        
//         if (session?.user) {
//           setRolesLoaded(false);
//           setTimeout(() => fetchUserRoles(session.user.id), 0);
//         } else {
//           setRoles([]);
//           setRolesLoaded(true);
//         }
        
//         if (event === "SIGNED_OUT") {
//           navigate("/auth");
//         }
//       }
//     );

//     // THEN check for existing session
//     supabase.auth.getSession().then(async ({ data: { session } }) => {
//       setSession(session);
//       setUser(session?.user ?? null);
      
//       if (session?.user) {
//         await fetchUserRoles(session.user.id);
//       } else {
//         setRolesLoaded(true);
//         navigate("/auth");
//       }
      
//       setLoading(false);
//     });

//     return () => subscription.unsubscribe();
//   }, [navigate]);

//   // Only set loading to false when both session and roles are ready
//   React.useEffect(() => {
//     if (rolesLoaded) {
//       setLoading(false);
//     }
//   }, [rolesLoaded]);

//   const signOut = async () => {
//     await supabase.auth.signOut();
//   };

//   const hasRole = (role) => roles.includes(role);
//   const isAdmin = hasRole('admin');
//   const isManager = hasRole('manager') || isAdmin;
//   const isStaff = roles.some(role => ['admin', 'manager', 'sales_agent'].includes(role));

//   return { user, session, loading, signOut, roles, hasRole, isAdmin, isManager, isStaff };
// }
