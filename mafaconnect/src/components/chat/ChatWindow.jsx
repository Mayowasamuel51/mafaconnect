import React, { useState, useEffect, useRef } from "react";
import { useMessages } from "@/hooks/useMessages";
import { MessageBubble } from "./MessageBubble";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react"; 
import { useAuth } from "@/hooks/useAuth";

export function ChatWindow({ conversationId, conversationSubject, showHeader = true }) {
  const { user } = useAuth();
  const { messages, isLoading, sendMessage, isSending } = useMessages(conversationId);

  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversationId) return;

    sendMessage({ content: newMessage });
    setNewMessage("");
  };

  if (!conversationId) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Select a conversation to start messaging
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      {showHeader && (
        <div className="border-b p-3 sm:p-4">
          <h2 className="font-semibold text-base sm:text-lg">
            {conversationSubject || "Conversation"}
          </h2>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                content={message.content}
                senderType={message.sender_type}
                senderName={
                  message.sender?.full_name ||
                  message.sender?.email ||
                  "Unknown"
                }
                createdAt={message.created_at}
                isOwn={message.sender_id === user?.id}
              />
            ))}

            {/* Auto-scroll anchor */}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="border-t p-3 sm:p-4">
        <div className="flex gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            rows={2}
            className="resize-none text-sm sm:text-base"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
          />

          <Button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            size="icon"
            className="h-11 w-11"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-2 hidden sm:block">
          Press Enter to send, Shift+Enter for new line
        </p>
      </form>
    </div>
  );
}
