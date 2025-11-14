import { useState, useEffect } from "react";
import { useConversations } from "@/hooks/useConversations";
import { useMessageNotifications } from "@/hooks/useMessageNotifications";
import { ConversationList } from "@/components/chat/ConversationList";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { NewConversationDialog } from "@/components/chat/NewConversationDialog";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Plus, Loader2, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Messages() {
  const { isStaff } = useAuth();
  const isMobile = useIsMobile();
  const {
    conversations,
    isLoading,
    createConversation,
    updateConversationStatus,
    markAsRead,
  } = useConversations();
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [newConversationOpen, setNewConversationOpen] = useState(false);
  const [showChat, setShowChat] = useState(false); // For mobile view toggle

  // Initialize message notifications for this page
  useMessageNotifications(selectedConversationId);

  // Filter conversations based on status
  const filteredConversations =
    statusFilter === "all"
      ? conversations
      : conversations.filter((c) => c.status === statusFilter);

  // Auto-select first conversation if none selected (only on desktop)
  useEffect(() => {
    if (filteredConversations.length > 0 && !selectedConversationId && !isMobile) {
      setSelectedConversationId(filteredConversations[0].id);
    }
  }, [filteredConversations, selectedConversationId, isMobile]);

  // On mobile, show chat when conversation is selected
  useEffect(() => {
    if (selectedConversationId && isMobile) {
      setShowChat(true);
    }
  }, [selectedConversationId, isMobile]);

  // Mark when conversation is selected
  useEffect(() => {
    if (selectedConversationId) {
      markAsRead(selectedConversationId);
    }
  }, [selectedConversationId, markAsRead]);

  const selectedConversation = conversations.find((c) => c.id === selectedConversationId);

  const handleCreateConversation = (subject, message) => {
    createConversation(
      { subject, initialMessage: message },
      {
        onSuccess: (newConversation) => {
          setSelectedConversationId(newConversation.id);
          if (isMobile) {
            setShowChat(true);
          }
        },
      }
    );
  };

  const handleSelectConversation = (id) => {
    setSelectedConversationId(id);
    if (isMobile) {
      setShowChat(true);
    }
  };

  const handleBackToList = () => {
    setShowChat(false);
  };

  const handleStatusChange = (status) => {
    if (selectedConversationId) {
      updateConversationStatus({ conversationId: selectedConversationId, status });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] sm:h-[calc(100vh-4rem)]">
      <div className="flex flex-col md:flex-row h-full">
        {/* Conversation List - Hidden on mobile when chat is open */}
        <div className={`${isMobile && showChat ? 'hidden' : 'flex'} w-full md:w-80 border-r flex-col`}>
          <div className="p-3 sm:p-4 border-b space-y-3">
            <div className="flex items-center justify-between">
              <h1 className="text-lg sm:text-xl font-bold">Messages</h1>
              {!isStaff && (
                <Button size="sm" onClick={() => setNewConversationOpen(true)} className="h-9">
                  <Plus className="h-4 w-4 mr-1" />
                  New
                </Button>
              )}
            </div>

            {isStaff && (
              <Tabs value={statusFilter} onValueChange={setStatusFilter}>
                <TabsList className="w-full grid grid-cols-3 h-10">
                  <TabsTrigger value="all" className="text-xs sm:text-sm">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="open" className="text-xs sm:text-sm">
                    Open
                  </TabsTrigger>
                  <TabsTrigger value="closed" className="text-xs sm:text-sm">
                    Closed
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}
          </div>

          <ConversationList
            conversations={filteredConversations}
            selectedId={selectedConversationId}
            onSelect={handleSelectConversation}
            onArchive={(id) => updateConversationStatus({ conversationId: id, status: "closed" })}
          />
        </div>

        {/* Chat Area - Full screen on mobile when open */}
        <div className={`${isMobile && !showChat ? 'hidden' : 'flex'} flex-1 flex-col pb-20 md:pb-0`}>
          {/* Mobile Back Button */}
          {isMobile && showChat && (
            <div className="p-3 border-b flex items-center gap-3">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleBackToList}
                className="h-9"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h2 className="text-sm font-semibold truncate flex-1">
                {selectedConversation?.subject}
              </h2>
            </div>
          )}
          
          {selectedConversation && isStaff && !isMobile && (
            <div className="p-2 sm:p-3 border-b flex gap-2">
              <Button
                size="sm"
                variant={selectedConversation.status === "open" ? "default" : "outline"}
                onClick={() => handleStatusChange("open")}
                className="h-9 flex-1 sm:flex-initial"
              >
                Open
              </Button>
              <Button
                size="sm"
                variant={selectedConversation.status === "closed" ? "default" : "outline"}
                onClick={() => handleStatusChange("closed")}
                className="h-9 flex-1 sm:flex-initial"
              >
                Close
              </Button>
            </div>
          )}
          <ChatWindow
            conversationId={selectedConversationId}
            conversationSubject={selectedConversation?.subject}
            showHeader={!isMobile}
          />
        </div>
      </div>

      <NewConversationDialog
        open={newConversationOpen}
        onOpenChange={setNewConversationOpen}
        onSubmit={handleCreateConversation}
      />
    </div>
  );
}
