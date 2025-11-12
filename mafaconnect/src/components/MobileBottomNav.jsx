import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  MessageSquare,
  ShoppingBag,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/uimain/Badge";

export default function MobileBottomNav({ isStaff, unreadCount, onMoreClick }) {
  const location = useLocation();

  const staffNavItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Orders", href: "/customer-order-management", icon: ShoppingCart },
    { name: "Products", href: "/products", icon: Package },
    { name: "Messages", href: "/messages", icon: MessageSquare },
  ];

  const customerNavItems = [
    { name: "Shop", href: "/shop", icon: ShoppingBag },
    { name: "Dashboard", href: "/customer-dashboard", icon: LayoutDashboard },
    { name: "Orders", href: "/customer-orders", icon: ShoppingCart },
    { name: "Messages", href: "/messages", icon: MessageSquare },
  ];

  const navItems = isStaff ? staffNavItems : customerNavItems;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          const showBadge = item.href === "/messages" && unreadCount > 0;

          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all flex-1 max-w-[80px] relative",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive && "scale-110")} />
              <span className="text-[10px] font-medium leading-tight">
                {item.name}
              </span>
              {showBadge && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 right-2 h-5 min-w-5 px-1 text-[10px] flex items-center justify-center"
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Badge>
              )}
            </Link>
          );
        })}

        <button
          onClick={onMoreClick}
          className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all flex-1 max-w-[80px] text-muted-foreground hover:text-foreground"
        >
          <MoreHorizontal className="h-5 w-5" />
          <span className="text-[10px] font-medium leading-tight">More</span>
        </button>
      </div>
    </nav>
  );
}

// import { Link, useLocation } from "react-router-dom";
// import { 
//   LayoutDashboard, 
//   ShoppingCart, 
//   Package, 
//   MessageSquare,
//   ShoppingBag,
//   MoreHorizontal
// } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { Badge } from "@/components/uimain/Badge";



// export function MobileBottomNav({ isStaff, unreadCount, onMoreClick }: MobileBottomNavProps) {
//   const location = useLocation();

//   const staffNavItems = [
//     { name: "Dashboard", href: "/", icon: LayoutDashboard },
//     { name: "Orders", href: "/customer-order-management", icon: ShoppingCart },
//     { name: "Products", href: "/products", icon: Package },
//     { name: "Messages", href: "/messages", icon: MessageSquare },
//   ];

//   const customerNavItems = [
//     { name: "Shop", href: "/shop", icon: ShoppingBag },
//     { name: "Dashboard", href: "/customer-dashboard", icon: LayoutDashboard },
//     { name: "Orders", href: "/customer-orders", icon: ShoppingCart },
//     { name: "Messages", href: "/messages", icon: MessageSquare },
//   ];

//   const navItems = isStaff ? staffNavItems : customerNavItems;

//   return (
//     <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t pb-safe">
//       <div className="flex items-center justify-around h-16 px-2">
//         {navItems.map((item) => {
//           const isActive = location.pathname === item.href;
//           const showBadge = item.href === "/messages" && unreadCount > 0;
          
//           return (
//             <Link
//               key={item.name}
//               to={item.href}
//               className={cn(
//                 "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all flex-1 max-w-[80px] relative",
//                 isActive
//                   ? "text-primary"
//                   : "text-muted-foreground"
//               )}
//             >
//               <item.icon className={cn("h-5 w-5", isActive && "scale-110")} />
//               <span className="text-[10px] font-medium leading-tight">{item.name}</span>
//               {showBadge && (
//                 <Badge 
//                   variant="destructive" 
//                   className="absolute -top-1 right-2 h-5 min-w-5 px-1 text-[10px] flex items-center justify-center"
//                 >
//                   {unreadCount > 99 ? "99+" : unreadCount}
//                 </Badge>
//               )}
//             </Link>
//           );
//         })}
        
//         <button
//           onClick={onMoreClick}
//           className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all flex-1 max-w-[80px] text-muted-foreground hover:text-foreground"
//         >
//           <MoreHorizontal className="h-5 w-5" />
//           <span className="text-[10px] font-medium leading-tight">More</span>
//         </button>
//       </div>
//     </nav>
//   );
// }
