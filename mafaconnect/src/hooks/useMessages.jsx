// src/hooks/useMessages.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import { useEffect } from "react";

export function useMessages(conversationId) {
  const { user, isStaff } = useAuth();
  const queryClient = useQueryClient();

  // FETCH MESSAGES FROM BACKEND
  const {
    data: messages,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      if (!conversationId) return [];

      const res = await apiGet(`/messages/${conversationId}`);
      return res.data; // backend returns array of messages
    },
    enabled: !!conversationId && !!user,
  });

  // SIMPLE POLLING (REALT IME REPLACEMENT)
  useEffect(() => {
    if (!conversationId || !user) return;

    const interval = setInterval(() => {
      refetch(); // refresh messages every 3 seconds
      queryClient.invalidateQueries(["conversations"]);
    }, 3000);

    return () => clearInterval(interval);
  }, [conversationId, user]);

  // SEND MESSAGE
  const sendMessage = useMutation({
    mutationFn: async ({ content }) => {
      if (!conversationId) throw new Error("No conversation selected");

      await apiPost("/messages", {
        conversation_id: conversationId,
        sender_id: user?.id,
        sender_type: isStaff ? "staff" : "customer",
        content,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["messages", conversationId]);
      queryClient.invalidateQueries(["conversations"]);
    },
    onError: () => {
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
