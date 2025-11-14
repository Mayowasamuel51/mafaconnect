import React from "react";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/Badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/useAuth";
import { MessageSquare, Archive } from "lucide-react";
import { SwipeToDelete } from "@/components/ui/swipe-to-delete";
import { toast } from "sonner";

export function ConversationList({ conversations = [], selectedId, onSelect, onArchive }) {
  const { isStaff } = useAuth();

  const handleArchive = (id) => {
    if (onArchive) {
      onArchive(id);
      toast.success("Conversation archived");
    }
  };

  if (!conversations || conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
        <MessageSquare className="h-12 w-12 mb-2 opacity-50" />
        <p className="text-center">No conversations yet</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-2 p-2">
        {conversations.map((conversation) => {
          const isUnread = isStaff
            ? conversation.unread_by_staff
            : conversation.unread_by_customer;
          const isSelected = conversation.id === selectedId;

          return (
            <SwipeToDelete
              key={conversation.id}
              onDelete={() => handleArchive(conversation.id)}
              deleteText="Archive"
              deleteIcon={<Archive className="h-4 w-4" />}
              deleteThreshold={100}
            >
              <div
                onClick={() => onSelect(conversation.id)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-card hover:bg-accent"
                } ${isUnread ? "border-l-4 border-primary" : ""}`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-medium text-sm line-clamp-1">
                    {conversation.subject || "Untitled Conversation"}
                  </h3>
                  <Badge
                    variant={conversation.status === "open" ? "default" : "secondary"}
                    className="text-xs shrink-0"
                  >
                    {conversation.status || "unknown"}
                  </Badge>
                </div>

                {isStaff && conversation.customer && (
                  <p className="text-xs opacity-70 mb-1">
                    {conversation.customer.full_name || conversation.customer.email}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <p className="text-xs opacity-70">
                    {conversation.last_message_at
                      ? formatDistanceToNow(new Date(conversation.last_message_at), {
                          addSuffix: true,
                        })
                      : "No recent messages"}
                  </p>
                  {isUnread && (
                    <Badge variant="destructive" className="text-xs">
                      New
                    </Badge>
                  )}
                </div>
              </div>
            </SwipeToDelete>
          );
        })}
      </div>
    </ScrollArea>
  );
}

// import { formatDistanceToNow } from "date-fns";
// import { Badge } from "@/components/ui/badge";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { useAuth } from "@/hooks/useAuth";
// import { MessageSquare, Archive } from "lucide-react";
// import { SwipeToDelete } from "@/components/ui/swipe-to-delete";
// import { toast } from "sonner";



// export function ConversationList({
//   conversations,
//   selectedId,
//   onSelect,
//   onArchive,
// }: ConversationListProps) {
//   const { isStaff } = useAuth();

//   const handleArchive = (id) => {
//     if (onArchive) {
//       onArchive(id);
//       toast.success("Conversation archived");
//     }
//   };

//   if (conversations.length === 0) {
//     return (
//       <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
//         <MessageSquare className="h-12 w-12 mb-2 opacity-50" />
//         <p className="text-center">No conversations yet</p>
//       </div>
//     );
//   }

//   return (
//     <ScrollArea className="h-full">
//       <div className="space-y-2 p-2">
//         {conversations.map((conversation) => {
//           const isUnread = isStaff
//             ? conversation.unread_by_staff
//             : conversation.unread_by_customer;
//           const isSelected = conversation.id === selectedId;

//           return (
//             <SwipeToDelete
//               key={conversation.id}
//               onDelete={() => handleArchive(conversation.id)}
//               deleteText="Archive"
//               deleteIcon={<Archive className="h-4 w-4" />}
//               deleteThreshold={100}
//             >
//               <div
//                 onClick={() => onSelect(conversation.id)}
//                 className={`p-3 rounded-lg cursor-pointer transition-colors ${
//                   isSelected
//                     ? "bg-primary text-primary-foreground"
//                     : "bg-card hover:bg-accent"
//                 } ${isUnread ? "border-l-4 border-primary" : ""}`}
//               >
//                 <div className="flex items-start justify-between gap-2 mb-1">
//                   <h3 className="font-medium text-sm line-clamp-1">
//                     {conversation.subject}
//                   </h3>
//                   <Badge
//                     variant={conversation.status === "open" ? "default" : "secondary"}
//                     className="text-xs shrink-0"
//                   >
//                     {conversation.status}
//                   </Badge>
//                 </div>

//                 {isStaff && conversation.customer && (
//                   <p className="text-xs opacity-70 mb-1">
//                     {conversation.customer.full_name || conversation.customer.email}
//                   </p>
//                 )}

//                 <div className="flex items-center justify-between">
//                   <p className="text-xs opacity-70">
//                     {formatDistanceToNow(new Date(conversation.last_message_at), {
//                       addSuffix: true,
//                     })}
//                   </p>
//                   {isUnread && (
//                     <Badge variant="destructive" className="text-xs">
//                       New
//                     </Badge>
//                   )}
//                 </div>
//               </div>
//             </SwipeToDelete>
//           );
//         })}
//       </div>
//     </ScrollArea>
//   );
// }
