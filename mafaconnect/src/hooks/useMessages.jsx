import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import React from "react";

export function useMessages(conversationId: string | null) {
  const { user, isStaff } = useAuth();
  const queryClient = useQueryClient();

  // Fetch messages for a conversation
  const { data: messages, isLoading } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      if (!conversationId) return [];

      const { data, error } = await supabase
        .from("messages")
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(full_name, email)
        `)
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!conversationId && !!user,
  });

  // Subscribe to real-time message updates
  React.useEffect(() => {
    if (!conversationId || !user) return;

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
          queryClient.invalidateQueries({ queryKey: ["conversations"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, user, queryClient]);

  // Send new message
  const sendMessage = useMutation({
    mutationFn: async ({ content }: { content: string }) => {
      if (!conversationId) throw new Error("No conversation selected");

      const { error } = await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: user?.id,
        sender_type: isStaff ? "staff" : "customer",
        content,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (error) => {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    },
  });

  return {
    messages: messages || [],
    isLoading,
    sendMessage: sendMessage.mutate,
    isSending: sendMessage.isPending,
  };
}
