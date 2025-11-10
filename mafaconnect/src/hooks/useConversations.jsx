import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import React from "react";

export function useConversations() {
  const { user, isStaff } = useAuth();
  const queryClient = useQueryClient();

  // Fetch conversations
  const { data: conversations, isLoading } = useQuery({
    queryKey: ["conversations", user?.id],
    queryFn: async () => {
      let query = supabase
        .from("conversations")
        .select(`
          *,
          customer:profiles!conversations_customer_id_fkey(full_name, email)
        `)
        .order("last_message_at", { ascending: false });

      // If not staff, only get their own conversations
      if (!isStaff) {
        query = query.eq("customer_id", user?.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Subscribe to real-time conversation updates
  React.useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("conversations-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["conversations"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  // Create new conversation
  const createConversation = useMutation({
    mutationFn: async ({
      subject,
      initialMessage,
    }: {
      subject;
      initialMessage;
    }) => {
      // Create conversation
      const { data: conversation, error: convError } = await supabase
        .from("conversations")
        .insert({
          customer_id: user?.id,
          subject,
        })
        .select()
        .single();

      if (convError) throw convError;

      // Create initial message
      const { error: msgError } = await supabase.from("messages").insert({
        conversation_id: conversation.id,
        sender_id: user?.id,
        sender_type: isStaff ? "staff" : "customer",
        content: initialMessage,
      });

      if (msgError) throw msgError;

      return conversation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      toast.success("Conversation created");
    },
    onError: (error) => {
      console.error("Error creating conversation:", error);
      toast.error("Failed to create conversation");
    },
  });

  // Update conversation status
  const updateConversationStatus = useMutation({
    mutationFn: async ({
      conversationId,
      status,
    }: {
      conversationId;
      status;
    }) => {
      const { error } = await supabase
        .from("conversations")
        .update({ status })
        .eq("id", conversationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      toast.success("Status updated");
    },
    onError: (error) => {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    },
  });

  // Mark conversation
  const markAsRead = useMutation({
    mutationFn: async (conversationId) => {
      const updateField = isStaff ? "unread_by_staff" : "unread_by_customer";
      const { error } = await supabase
        .from("conversations")
        .update({ [updateField]: false })
        .eq("id", conversationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  // Get unread count
  const getUnreadCount = () => {
    if (!conversations) return 0;
    const unreadField = isStaff ? 'unread_by_staff' : 'unread_by_customer';
    return conversations.filter(c => c[unreadField]).length;
  };

  return {
    conversations: conversations || [],
    isLoading,
    createConversation: createConversation.mutate,
    updateConversationStatus: updateConversationStatus.mutate,
    markAsRead: markAsRead.mutate,
    getUnreadCount,
  };
}
