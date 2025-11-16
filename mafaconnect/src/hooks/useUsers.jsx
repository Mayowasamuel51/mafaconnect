import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const API_BASE = import.meta.env.VITE_HOME_OO;

export function useUsers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // 🔐 GET TOKEN
  const token = localStorage.getItem("ACCESS_TOKEN");

  // =====================================================
  // 1️⃣ FETCH ALL USERS
  // =====================================================
  const { data: users, isLoading, error: queryError } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/allusers`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // ✔ TOKEN HERE
        },
      });

      if (!res.ok) throw new Error("Failed to fetch users");

      const json = await res.json();
      console.log("Fetched Users:", json.data);

      return json.data; // ✔ return the list
    },
  });

  // =====================================================
  // 2️⃣ UPDATE USER APPROVAL
  // =====================================================
  const updateUserApproval = useMutation({
    mutationFn: async ({ userId, status, notes }) => {
      const res = await fetch(`${API_BASE}/users/${userId}/approval`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // ✔ TOKEN HERE
        },
        body: JSON.stringify({ status, notes }),
      });

      if (!res.ok) throw new Error("Failed to update approval");
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
      toast({
        title: "User Updated",
        description: "Approval status updated successfully.",
      });
    },
  });

  // =====================================================
  // 3️⃣ ASSIGN ROLE
  // =====================================================
  const assignRole = useMutation({
    mutationFn: async ({ userId, role }) => {
      const res = await fetch(`${API_BASE}/users/${userId}/roles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // ✔ TOKEN HERE
        },
        body: JSON.stringify({ role }),
      });

      if (!res.ok) throw new Error("Failed to assign role");
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
      toast({
        title: "Role Assigned",
        description: "Role assigned successfully.",
      });
    },
  });

  // =====================================================
  // 4️⃣ REMOVE ROLE
  // =====================================================
  const removeRole = useMutation({
    mutationFn: async ({ userId, role }) => {
      const res = await fetch(`${API_BASE}/api/users/${userId}/roles/${role}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`, // ✔ TOKEN HERE
        },
      });

      if (!res.ok) throw new Error("Failed to remove role");
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
      toast({
        title: "Role Removed",
        description: "Role removed successfully.",
      });
    },
  });

  // =====================================================
  // 5️⃣ DELETE USER
  // =====================================================
  const deleteUser = useMutation({
    mutationFn: async (userId) => {
      const res = await fetch(`${API_BASE}/api/users/${userId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`, // ✔ TOKEN HERE
        },
      });

      if (!res.ok) throw new Error("Failed to delete user");
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
      toast({
        title: "User Deleted",
        description: "User has been removed successfully.",
      });
    },
  });

  // Return everything to the component
  return {
    users,
    isLoading,
    updateUserApproval: updateUserApproval.mutate,
    assignRole: assignRole.mutate,
    removeRole: removeRole.mutate,
    deleteUser: deleteUser.mutate,
  };
}



// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { useToast } from "@/hooks/use-toast";

// // 🔹 Replace this with your Node backend base URL
// const API_BASE = import.meta.env.VITE_HOME_OO 

// export function useUsers() {
//   const { toast } = useToast();
//   const queryClient = useQueryClient();

//   // ✅ Fetch all users
//   const { data: users, isLoading, error: queryError } = useQuery({
//     queryKey: ["users"],
//     queryFn: async () => {
//       try {
//         const res = await fetch(`${API_BASE}/allusers`);
//         if (!res.ok) throw new Error("Failed to fetch users");
//         const data = await res.data.json();
//         console.log(data)
//         return data;
//       } catch (error) {
//         console.error("Error fetching users:", error);
//         toast({
//           title: "Error loading users",
//           description: error.message,
//           variant: "destructive",
//         });
//         throw error;
//       }
//     },
//   });

//   if (queryError) console.error("Query error:", queryError);

//   // ✅ Update user approval (approve / reject)
//   const updateUserApproval = useMutation({
//     mutationFn: async ({ userId, status, notes }) => {
//       const res = await fetch(`${API_BASE}/api/users/${userId}/approval`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ status, notes }),
//       });
//       if (!res.ok) {
//         const err = await res.json();
//         throw new Error(err.message || "Failed to update approval");
//       }
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["users"] });
//       toast({
//         title: "User updated",
//         description: "User approval status updated successfully.",
//       });
//     },
//     onError: (error) => {
//       toast({
//         title: "Error",
//         description: error.message,
//         variant: "destructive",
//       });
//     },
//   });

//   // ✅ Assign role
//   const assignRole = useMutation({
//     mutationFn: async ({ userId, role }) => {
//       const res = await fetch(`${API_BASE}/api/users/${userId}/roles`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ role }),
//       });
//       if (!res.ok) {
//         const err = await res.json();
//         throw new Error(err.message || "Failed to assign role");
//       }
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["users"] });
//       toast({
//         title: "Role assigned",
//         description: "Role has been assigned successfully.",
//       });
//     },
//     onError: (error) => {
//       toast({
//         title: "Error",
//         description: error.message,
//         variant: "destructive",
//       });
//     },
//   });

//   // ✅ Remove role
//   const removeRole = useMutation({
//     mutationFn: async ({ userId, role }) => {
//       const res = await fetch(`${API_BASE}/api/users/${userId}/roles/${role}`, {
//         method: "DELETE",
//       });
//       if (!res.ok) {
//         const err = await res.json();
//         throw new Error(err.message || "Failed to remove role");
//       }
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["users"] });
//       toast({
//         title: "Role removed",
//         description: "Role has been removed successfully.",
//       });
//     },
//     onError: (error) => {
//       toast({
//         title: "Error",
//         description: error.message,
//         variant: "destructive",
//       });
//     },
//   });

//   // ✅ Delete user
//   const deleteUser = useMutation({
//     mutationFn: async (userId) => {
//       const res = await fetch(`${API_BASE}/api/users/${userId}`, {
//         method: "DELETE",
//       });
//       if (!res.ok) {
//         const err = await res.json();
//         throw new Error(err.message || "Failed to delete user");
//       }
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["users"] });
//       toast({
//         title: "User deleted",
//         description: "User has been removed from the system.",
//       });
//     },
//     onError: (error) => {
//       toast({
//         title: "Error",
//         description: error.message,
//         variant: "destructive",
//       });
//     },
//   });

//   // ✅ Return hooks
//   return {
//     users,
//     isLoading,
//     updateUserApproval: updateUserApproval.mutate,
//     assignRole: assignRole.mutate,
//     removeRole: removeRole.mutate,
//     deleteUser: deleteUser.mutate,
//   };
// }



// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { supabase } from "@/integrations/supabase/client";
// import { useToast } from "@/hooks/use-toast";

// export function useUsers() {
//   const { toast } = useToast();
//   const queryClient = useQueryClient();

//   const { data: users, isLoading, error: queryError } = useQuery({
//     queryKey: ["users"],
//     queryFn: async () => {
//       console.log('Fetching users...');
      
//       // Get current user to check auth
//       const { data: { user: currentUser } } = await supabase.auth.getUser();
//       console.log('Current user ID:', currentUser?.id);
      
//       const { data: profiles, error } = await supabase
//         .from("profiles")
//         .select(`
//           *,
//           user_roles(role)
//         `)
//         .order("created_at", { ascending: false });

//       if (error) {
//         console.error('Error fetching users:', error);
//         toast({
//           title: "Error loading users",
//           description: error.message,
//           variant: "destructive",
//         });
//         throw error;
//       }
//       console.log('Users fetched:', profiles?.length, 'profiles:', profiles);
//       return profiles;
//     },
//   });

//   // Log any query errors
//   if (queryError) {
//     console.error('Query error:', queryError);
//   }

//   const updateUserApproval = useMutation({
//     mutationFn: async ({ userId, status, notes }: { userId; status; notes?: string }) => {
//       const currentUser = await supabase.auth.getUser();
//       const { error } = await supabase
//         .from("profiles")
//         .update({
//           approval_status: status,
//           ...(notes && { approval_notes: notes }),
//           ...(status === "approved" && {
//             approved_at: new Date().toISOString(),
//             approved_by: currentUser.data.user?.id,
//           }),
//         })
//         .eq("id", userId);

//       if (error) throw error;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["users"] });
//       toast({
//         title: "User updated",
//         description: "User approval status has been updated successfully.",
//       });
//     },
//     onError: (error: Error) => {
//       toast({
//         title: "Error",
//         description: error.message,
//         variant: "destructive",
//       });
//     },
//   });

//   const assignRole = useMutation({
//     mutationFn: async ({ userId, role }: { userId; role: string }) => {
//       const { error } = await supabase
//         .from("user_roles")
//         .insert({ user_id: userId, role: role });

//       if (error) throw error;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["users"] });
//       toast({
//         title: "Role assigned",
//         description: "Role has been assigned successfully.",
//       });
//     },
//     onError: (error: Error) => {
//       toast({
//         title: "Error",
//         description: error.message,
//         variant: "destructive",
//       });
//     },
//   });

//   const removeRole = useMutation({
//     mutationFn: async ({ userId, role }: { userId; role: string }) => {
//       const { error } = await supabase
//         .from("user_roles")
//         .delete()
//         .eq("user_id", userId)
//         .eq("role", role);

//       if (error) throw error;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["users"] });
//       toast({
//         title: "Role removed",
//         description: "Role has been removed successfully.",
//       });
//     },
//     onError: (error: Error) => {
//       toast({
//         title: "Error",
//         description: error.message,
//         variant: "destructive",
//       });
//     },
//   });

//   const deleteUser = useMutation({
//     mutationFn: async (userId) => {
//       const { data, error } = await supabase.functions.invoke('delete-user', {
//         body: { userId },
//       });

//       if (error) throw error;
//       if (!data?.success) throw new Error(data?.error || 'Failed to delete user');
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["users"] });
//       toast({
//         title: "User deleted",
//         description: "User has been removed from the system.",
//       });
//     },
//     onError: (error: Error) => {
//       toast({
//         title: "Error",
//         description: error.message,
//         variant: "destructive",
//       });
//     },
//   });

//   return {
//     users,
//     isLoading,
//     updateUserApproval: updateUserApproval.mutate,
//     assignRole: assignRole.mutate,
//     removeRole: removeRole.mutate,
//     deleteUser: deleteUser.mutate,
//   };
// }
