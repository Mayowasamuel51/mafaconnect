import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import { MessageNotificationToast } from "@/components/chat/MessageNotificationToast";

;
}

export function useMessageNotifications(currentConversationId = null) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const audioRef = useRef(null);
  const lastNotificationRef = useRef(0);

  useEffect(() => {
    if (!user) return;

    // Initialize audio for notification sound
    audioRef.current = new Audio('/sounds/notification.mp3');
    audioRef.current.volume = 0.5;

    // Subscribe to all message inserts globally
    const channel = supabase
      .channel('global-messages-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        async (payload: MessagePayload) => {
          const message = payload.new;
          
          // Don't notify for own messages
          if (message.sender_id === user.id) return;
          
          // Don't notify if currently viewing that conversation
          if (message.conversation_id === currentConversationId) return;

          // Debounce notifications (max 1 per 2 seconds)
          const now = Date.now();
          if (now - lastNotificationRef.current < 2000) return;
          lastNotificationRef.current = now;

          // Fetch sender info and conversation details
          const { data: senderData } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', message.sender_id)
            .single();

          const { data: conversationData } = await supabase
            .from('conversations')
            .select('subject')
            .eq('id', message.conversation_id)
            .single();

          // Show toast notification
          toast.custom(
            (t) => (
              <MessageNotificationToast
                senderName={senderData?.full_name || senderData?.email || 'Unknown'}
                message={message.content}
                subject={conversationData?.subject || 'New Message'}
                conversationId={message.conversation_id}
                onDismiss={() => toast.dismiss(t)}
              />
            ),
            {
              duration: 5000,
              position: 'top-right',
            }
          );

          // Play notification sound
          try {
            audioRef.current?.play().catch(() => {
              // Ignore audio play errors (e.g., user hasn't interacted with page)
            });
          } catch (error) {
            console.log('Audio notification failed:', error);
          }

          // Invalidate queries to update unread counts
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, currentConversationId, queryClient]);
}
