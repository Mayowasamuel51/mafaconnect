import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useAccountDeletion() {
  const navigate = useNavigate();

  const deleteMutation = useMutation({
    mutationFn: async ({ password, confirmation }: { password; confirmation: string }) => {
      const { data, error } = await supabase.functions.invoke('delete-own-account', {
        body: { password, confirmation },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      return data;
    },
    onSuccess: () => {
      toast.success("Account deleted", {
        description: "Your account has been permanently deleted.",
      });
      // Sign out and redirect after a short delay
      setTimeout(async () => {
        await supabase.auth.signOut();
        navigate('/auth');
      }, 2000);
    },
    onError: (error) => {
      console.error('Account deletion error:', error);
      toast.error("Deletion failed", {
        description: error.message || "Unable to delete account. Please try again.",
      });
    },
  });

  return { 
    deleteAccount: deleteMutation.mutate, 
    isDeleting: deleteMutation.isPending 
  };
}
