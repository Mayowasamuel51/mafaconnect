import * as React from "react";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { hapticFeedback } from "@/lib/haptics";
import { useIsMobile } from "@/hooks/use-mobile";

export function SwipeToDelete({
  children,
  onDelete,
  disabled = false,
  deleteThreshold = 100,
  deleteText = "Delete",
  deleteIcon = <Trash2 className="h-5 w-5" />,
  className,
}) {
  const isMobile = useIsMobile();
  const [swipeOffset, setSwipeOffset] = React.useState(0);
  const [isSwiping, setIsSwiping] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const touchStartX = React.useRef(0);
  const touchStartY = React.useRef(0);
  const startTime = React.useRef(0);
  const hasTriggeredHaptic = React.useRef(false);

  // Reset swipe state
  const reset = () => {
    setSwipeOffset(0);
    setIsSwiping(false);
    hasTriggeredHaptic.current = false;
  };

  // Handle touch start
  const handleTouchStart = (e) => {
    if (disabled || !isMobile || isDeleting) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    startTime.current = Date.now();
    hasTriggeredHaptic.current = false;
    hapticFeedback("light");
  };

  // Handle touch move
  const handleTouchMove = (e) => {
    if (disabled || !isMobile || isDeleting) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - touchStartX.current;
    const diffY = currentY - touchStartY.current;

    // Only allow horizontal swipe to the left
    if (Math.abs(diffX) > Math.abs(diffY) && diffX < 0) {
      if (!isSwiping) setIsSwiping(true);

      e.preventDefault(); // Prevent vertical scroll during swipe

      // Apply resistance beyond threshold
      const resistance = Math.abs(diffX) > deleteThreshold ? 0.3 : 1;
      setSwipeOffset(diffX * resistance);

      // Trigger haptic feedback at threshold
      if (Math.abs(diffX) >= deleteThreshold && !hasTriggeredHaptic.current) {
        hapticFeedback("medium");
        hasTriggeredHaptic.current = true;
      }
    }
  };

  // Handle touch end
  const handleTouchEnd = () => {
    if (disabled || !isMobile || isDeleting) return;

    const velocity = swipeOffset / (Date.now() - startTime.current);
    const shouldDelete =
      Math.abs(swipeOffset) >= deleteThreshold || Math.abs(velocity) > 0.5;

    if (shouldDelete) {
      // Animate delete swipe
      setIsDeleting(true);
      setSwipeOffset(-400); // Swipe off screen
      hapticFeedback("heavy");

      setTimeout(() => {
        if (typeof onDelete === "function") onDelete();
        reset();
        setIsDeleting(false);
      }, 300);
    } else {
      reset(); // Return to normal
    }

    setIsSwiping(false);
  };

  // No swipe behavior for desktop
  if (!isMobile) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Delete background */}
      <div
        className={cn(
          "absolute inset-y-0 right-0 flex items-center justify-end gap-2 px-6 bg-destructive text-destructive-foreground transition-transform duration-300",
          Math.abs(swipeOffset) > 0 ? "translate-x-0" : "translate-x-full"
        )}
        style={{ width: "100%" }}
      >
        {deleteIcon}
        <span className="font-semibold">{deleteText}</span>
      </div>

      {/* Swipeable content */}
      <div
        className={cn(
          "relative bg-background transition-transform",
          isSwiping ? "duration-0" : "duration-300 ease-out"
        )}
        style={{
          transform: `translateX(${swipeOffset}px)`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}


// import React from "react";
// import { Trash2 } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { hapticFeedback } from "@/lib/haptics";
// import { useIsMobile } from "@/hooks/use-mobile";



// export function SwipeToDelete({
//   children,
//   onDelete,
//   disabled = false,
//   deleteThreshold = 100,
//   deleteText = "Delete",
//   deleteIcon = <Trash2 className="h-5 w-5" />,
//   className,
// }: SwipeToDeleteProps) {
//   const isMobile = useIsMobile();
//   const [swipeOffset, setSwipeOffset] = React.useState(0);
//   const [isSwiping, setIsSwiping] = React.useState(false);
//   const [isDeleting, setIsDeleting] = React.useState(false);
//   const touchStartX = React.useRef(0);
//   const touchStartY = React.useRef(0);
//   const startTime = React.useRef(0);
//   const hasTriggeredHaptic = React.useRef(false);

//   // Reset function
//   const reset = () => {
//     setSwipeOffset(0);
//     setIsSwiping(false);
//     hasTriggeredHaptic.current = false;
//   };

//   // Handle touch start
//   const handleTouchStart = (e: React.TouchEvent) => {
//     if (disabled || !isMobile || isDeleting) return;
    
//     touchStartX.current = e.touches[0].clientX;
//     touchStartY.current = e.touches[0].clientY;
//     startTime.current = Date.now();
//     hasTriggeredHaptic.current = false;
//     hapticFeedback('light');
//   };

//   // Handle touch move
//   const handleTouchMove = (e: React.TouchEvent) => {
//     if (disabled || !isMobile || isDeleting) return;

//     const currentX = e.touches[0].clientX;
//     const currentY = e.touches[0].clientY;
//     const diffX = currentX - touchStartX.current;
//     const diffY = currentY - touchStartY.current;

//     // Only swipe if more horizontal than vertical
//     if (Math.abs(diffX) > Math.abs(diffY) && diffX < 0) {
//       if (!isSwiping) {
//         setIsSwiping(true);
//       }
      
//       // Prevent scrolling when swiping
//       e.preventDefault();
      
//       // Add resistance after threshold
//       const resistance = Math.abs(diffX) > deleteThreshold ? 0.3 : 1;
//       setSwipeOffset(diffX * resistance);

//       // Haptic feedback when reaching threshold
//       if (Math.abs(diffX) >= deleteThreshold && !hasTriggeredHaptic.current) {
//         hapticFeedback('medium');
//         hasTriggeredHaptic.current = true;
//       }
//     }
//   };

//   // Handle touch end
//   const handleTouchEnd = () => {
//     if (disabled || !isMobile || isDeleting) return;

//     const velocity = swipeOffset / (Date.now() - startTime.current);
//     const shouldDelete = Math.abs(swipeOffset) >= deleteThreshold || Math.abs(velocity) > 0.5;

//     if (shouldDelete) {
//       // Animate delete
//       setIsDeleting(true);
//       setSwipeOffset(-400); // Swipe off screen
//       hapticFeedback('heavy');
      
//       setTimeout(() => {
//         onDelete();
//         reset();
//         setIsDeleting(false);
//       }, 300);
//     } else {
//       // Spring back
//       reset();
//     }

//     setIsSwiping(false);
//   };

//   // Don't apply swipe on desktop
//   if (!isMobile) {
//     return <div className={className}>{children}</div>;
//   }

//   return (
//     <div className={cn("relative overflow-hidden", className)}>
//       {/* Delete background */}
//       <div
//         className={cn(
//           "absolute inset-y-0 right-0 flex items-center justify-end gap-2 px-6 bg-destructive text-destructive-foreground transition-transform duration-300",
//           Math.abs(swipeOffset) > 0 ? "translate-x-0" : "translate-x-full"
//         )}
//         style={{ width: "100%" }}
//       >
//         {deleteIcon}
//         <span className="font-semibold">{deleteText}</span>
//       </div>

//       {/* Swipeable content */}
//       <div
//         className={cn(
//           "relative bg-background transition-transform",
//           isSwiping ? "duration-0" : "duration-300 ease-out"
//         )}
//         style={{
//           transform: `translateX(${swipeOffset}px)`,
//         }}
//         onTouchStart={handleTouchStart}
//         onTouchMove={handleTouchMove}
//         onTouchEnd={handleTouchEnd}
//       >
//         {children}
//       </div>
//     </div>
//   );
// }
