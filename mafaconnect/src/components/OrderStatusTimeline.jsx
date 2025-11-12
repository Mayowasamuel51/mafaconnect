import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";



>;
}

const STATUS_FLOW: Array<{ status; label: string }> = [
  { status: "pending", label: "Pending" },
  { status: "confirmed", label: "Confirmed" },
  { status: "processing", label: "Processing" },
  { status: "packed", label: "Packed" },
  { status: "shipped", label: "Shipped" },
  { status: "out_for_delivery", label: "Out for Delivery" },
  { status: "delivered", label: "Delivered" },
];

export function OrderStatusTimeline({
  currentStatus,
  statusHistory,
}: OrderStatusTimelineProps) {
  // Handle cancelled/returned status separately
  if (currentStatus === "cancelled" || currentStatus === "returned") {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-destructive flex items-center justify-center text-destructive-foreground">
              <Circle className="h-4 w-4" />
            </div>
          </div>
          <div className="flex-1">
            <p className="font-semibold capitalize">{currentStatus}</p>
            <p className="text-sm text-muted-foreground">
              This order has been {currentStatus}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentIndex = STATUS_FLOW.findIndex((s) => s.status === currentStatus);

  return (
    <div className="space-y-0">
      {STATUS_FLOW.map((step, index) => {
        const isCompleted = index <= currentIndex;
        const isCurrent = step.status === currentStatus;
        const historyEntry = statusHistory?.find((h) => h.to_status === step.status);

        return (
          <div key={step.status} className="flex items-start gap-4 relative">
            {/* Connector line */}
            {index < STATUS_FLOW.length - 1 && (
              <div
                className={cn(
                  "absolute left-4 top-8 w-0.5 h-12",
                  isCompleted ? "bg-primary" : "bg-muted"
                )}
              />
            )}

            {/* Status icon */}
            <div className="flex flex-col items-center relative z-10">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors",
                  isCompleted
                    ? "bg-primary border-primary text-primary-foreground"
                    : "bg-background border-muted"
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Circle className="h-3 w-3" />
                )}
              </div>
            </div>

            {/* Status info */}
            <div className={cn("flex-1 pb-8", !isCompleted && "opacity-50")}>
              <p className={cn("font-semibold", isCurrent && "text-primary")}>
                {step.label}
              </p>
              {historyEntry && (
                <>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(historyEntry.created_at), "PPp")}
                  </p>
                  {historyEntry.notes && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {historyEntry.notes}
                    </p>
                  )}
                </>
              )}
              {!historyEntry && isCompleted && (
                <p className="text-sm text-muted-foreground">Completed</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
