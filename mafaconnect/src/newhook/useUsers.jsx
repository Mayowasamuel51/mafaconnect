import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useUsers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users, isLoading, error: queryError } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      console.log('Fetching users...');
      
      // Get current user to check auth
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      console.log('Current user ID:', currentUser?.id);
      
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select(`
          *,
          user_roles(role)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        toast({
          title: "Error loading users",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      console.log('Users fetched:', profiles?.length, 'profiles:', profiles);
      return profiles;
    },
  });

  // Log any query errors
  if (queryError) {
    console.error('Query error:', queryError);
  }

  const updateUserApproval = useMutation({
    mutationFn: async ({ userId, status, notes }: { userId; status; notes?: string }) => {
      const currentUser = await supabase.auth.getUser();
      const { error } = await supabase
        .from("profiles")
        .update({
          approval_status: status,
          ...(notes && { approval_notes: notes }),
          ...(status === "approved" && {
            approved_at: new Date().toISOString(),
            approved_by: currentUser.data.user?.id,
          }),
        })
        .eq("id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "User updated",
        description: "User approval status has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const assignRole = useMutation({
    mutationFn: async ({ userId, role }: { userId; role: string }) => {
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role: role });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Role assigned",
        description: "Role has been assigned successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const removeRole = useMutation({
    mutationFn: async ({ userId, role }: { userId; role: string }) => {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", role);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Role removed",
        description: "Role has been removed successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteUser = useMutation({
    mutationFn: async (userId) => {
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { userId },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to delete user');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "User deleted",
        description: "User has been removed from the system.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    users,
    isLoading,
    updateUserApproval: updateUserApproval.mutate,
    assignRole: assignRole.mutate,
    removeRole: removeRole.mutate,
    deleteUser: deleteUser.mutate,
  };
}
