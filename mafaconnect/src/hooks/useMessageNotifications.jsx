import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Pusher from "pusher-js";
import { useAuth } from "./useAuth";
import { MessageNotificationToast } from "@/components/chat/MessageNotificationToast";
export function useMessageNotifications(currentConversationId = null) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const audioRef = useRef(null);
  const lastNotificationRef = useRef(0);

  useEffect(() => {
    if (!user) return;

    // 1. Load Notification Sound
    audioRef.current = new Audio("/sounds/notification.mp3");
    audioRef.current.volume = 0.5;

    // 2. Setup Pusher client
    const pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
      cluster: import.meta.env.VITE_PUSHER_CLUSTER,
      authEndpoint: `${import.meta.env.VITE_HOME_OO}/api/pusher/auth`,
      auth: {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      }
    });

    // 3. Subscribe to personal notification channel
    const channel = pusher.subscribe(`private-user-${user.id}`);

    // 4. Handle new message notifications
    channel.bind("new-message", (data) => {
      const { message, sender, conversation } = data;

      // Avoid notifying for own messages
      if (message.sender_id === user.id) return;

      // Avoid notifying if viewing the same conversation
      if (message.conversation_id === currentConversationId) return;

      // Debounce notifications
      const now = Date.now();
      if (now - lastNotificationRef.current < 2000) return;
      lastNotificationRef.current = now;

      // 5. Visual Toast
      toast.custom(
        (t) => (
          <MessageNotificationToast
            senderName={sender?.full_name || sender?.email || "Unknown"}
            message={message.content}
            subject={conversation?.subject || "New Message"}
            conversationId={message.conversation_id}
            onDismiss={() => toast.dismiss(t)}
          />
        ),
        {
          duration: 5000,
          position: "top-right",
        }
      );

      // 6. Play sound
      try {
        audioRef.current?.play().catch(() => {});
      } catch {}

      // 7. Refresh unread counters
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`private-user-${user.id}`);
      pusher.disconnect();
    };
  }, [user, currentConversationId, queryClient]);
}
