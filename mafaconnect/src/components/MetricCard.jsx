import React from "react";
import { Card, CardContent } from "@/components/uimain/card";
import { cn } from "@/lib/utils";

export function MetricCard({
  title,
  value,
  change,
  changeType = "neutral",
  Icon,
  iconColor = "text-primary",
}) {
  return (
    <Card className="shadow-card hover:shadow-elevated transition-all duration-300">
      <CardContent className="p-3 sm:p-6">
        <div className="flex items-start justify-between">
          {/* Left section (title, value, change) */}
          <div className="flex-1">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 sm:mb-2">
              {title}
            </p>
            <h3 className="text-xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">
              {value}
            </h3>

            {change && (
              <p
                className={cn(
                  "text-xs sm:text-sm font-medium",
                  changeType === "positive" && "text-success",
                  changeType === "negative" && "text-destructive",
                  changeType === "neutral" && "text-muted-foreground"
                )}
              >
                {change}
              </p>
            )}
          </div>

          {/* Right section (icon) */}
          <div
            className={cn(
              "p-2 sm:p-3 rounded-xl bg-gradient-to-br",
              iconColor === "text-primary" && "from-primary/10 to-accent/10",
              iconColor === "text-success" && "from-success/10 to-success/20",
              iconColor === "text-warning" && "from-warning/10 to-warning/20"
            )}
          >
            {Icon && <Icon className={cn("h-5 w-5 sm:h-6 sm:w-6", iconColor)} />}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


// import { Card, CardContent } from "@/components/uimain/card";
// import { cn } from "@/lib/utils";
// import { LucideIcon } from "lucide-react";



// export function MetricCard({
//   title,
//   value,
//   change,
//   changeType = "neutral",
//   icon = "text-primary",
// }: MetricCardProps) {
//   return (
//     <Card className="shadow-card hover:shadow-elevated transition-all duration-300">
//       <CardContent className="p-3 sm:p-6">
//         <div className="flex items-start justify-between">
//           <div className="flex-1">
//             <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 sm:mb-2">
//               {title}
//             </p>
//             <h3 className="text-xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">
//               {value}
//             </h3>
//             {change && (
//               <p
//                 className={cn(
//                   "text-xs sm:text-sm font-medium",
//                   changeType === "positive" && "text-success",
//                   changeType === "negative" && "text-destructive",
//                   changeType === "neutral" && "text-muted-foreground"
//                 )}
//               >
//                 {change}
//               </p>
//             )}
//           </div>
//           <div
//             className={cn(
//               "p-2 sm:p-3 rounded-xl bg-gradient-to-br",
//               iconColor === "text-primary" && "from-primary/10 to-accent/10",
//               iconColor === "text-success" && "from-success/10 to-success/20",
//               iconColor === "text-warning" && "from-warning/10 to-warning/20"
//             )}
//           >
//             <Icon className={cn("h-5 w-5 sm:h-6 sm:w-6", iconColor)} />
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }
