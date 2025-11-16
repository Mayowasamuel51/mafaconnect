import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { MessageSquare, X } from "lucide-react";

export function MessageNotificationToast({
  senderName,
  message,
  subject,
  conversationId,
  onDismiss,
}) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/messages?conversation=${conversationId}`);
    onDismiss();
  };

  const preview =
    message && message.length > 80
      ? message.substring(0, 80) + "..."
      : message;

  return (
    <Card className="w-[350px] p-4 shadow-lg border-l-4 border-l-primary cursor-pointer">
      <div className="flex gap-3">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <MessageSquare className="h-5 w-5 text-primary" />
          </div>
        </div>

        {/* Text content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{senderName}</p>
              <p className="text-xs text-muted-foreground truncate">
                {subject}
              </p>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                onDismiss();
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-sm mt-2 text-foreground/80 line-clamp-2">
            {preview}
          </p>

          <div className="flex gap-2 mt-3">
            <Button size="sm" className="flex-1" onClick={handleClick}>
              View Message
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default MessageNotificationToast;


// import { useNavigate } from "react-router-dom";
// import { Button } from "@/components/ui/Button";
// import { Card } from "@/components/ui/Card";
// import { MessageSquare, X } from "lucide-react";

// export function MessageNotificationToast({
//   senderName,
//   message,
//   subject,
//   conversationId,
//   onDismiss,
// }) {
//   const navigate = useNavigate();

//   const handleClick = () => {
//     navigate(`/messages?conversation=${conversationId}`);
//     onDismiss();
//   };

//   const preview =
//     message && message.length > 80
//       ? message.substring(0, 80) + "..."
//       : message;

//   return (
//     <Card className="w-[350px] p-4 shadow-lg border-l-4 border-l-primary cursor-pointer">
//       <div className="flex gap-3">
//         {/* Icon */}
//         <div className="flex-shrink-0">
//           <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
//             <MessageSquare className="h-5 w-5 text-primary" />
//           </div>
//         </div>

//         {/* Text content */}
//         <div className="flex-1 min-w-0">
//           <div className="flex items-start justify-between gap-2">
//             <div className="flex-1 min-w-0">
//               <p className="font-semibold text-sm truncate">{senderName}</p>
//               <p className="text-xs text-muted-foreground truncate">
//                 {subject}
//               </p>
//             </div>

//             <Button
//               variant="ghost"
//               size="icon"
//               className="h-6 w-6 flex-shrink-0"
//               onClick={(e) => {
//                 e.stopPropagation();
//                 onDismiss();
//               }}
//             >
//               <X className="h-4 w-4" />
//             </Button>
//           </div>

//           <p className="text-sm mt-2 text-foreground/80 line-clamp-2">
//             {preview}
//           </p>

//           <div className="flex gap-2 mt-3">
//             <Button size="sm" className="flex-1" onClick={handleClick}>
//               View Message
//             </Button>
//           </div>
//         </div>
//       </div>
//     </Card>
//   );
// }
