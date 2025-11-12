import { formatDistanceToNow } from "date-fns";



export function MessageBubble({
  content,
  senderType,
  senderName,
  createdAt,
  isOwn,
}: MessageBubbleProps) {
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`max-w-[70%] rounded-lg px-4 py-2 ${
          isOwn
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        }`}
      >
        {!isOwn && (
          <div className="text-xs font-medium mb-1 opacity-70">
            {senderName} ({senderType})
          </div>
        )}
        <div className="text-sm whitespace-pre-wrap break-words">{content}</div>
        <div className={`text-xs mt-1 ${isOwn ? "opacity-70" : "opacity-50"}`}>
          {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
        </div>
      </div>
    </div>
  );
}
