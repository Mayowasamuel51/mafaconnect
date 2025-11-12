import React from "react";
import { Link, useLocation } from "react-router-dom";
import mafaLogo from "@/assets/mafa-logo.png";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Gift,
  BarChart3,
  FileText,
  PackageX,
  MapPin,
  Truck,
  ShoppingBag,
  Menu,
  LogOut,
  Smartphone,
  Wifi,
  WifiOff,
  UserCircle,
  Shield,
  Moon,
  Sun,
  MessageSquare,
  ArrowRightLeft,
  Receipt,
} from "lucide-react";
import { Button } from "@/components/uimain/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/uimain/sheet";
import { Badge } from "@/components/uimain/Badge";
import { useAuth } from "@/hooks/useAuth";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { useTheme } from "@/hooks/useTheme";
import { useConversations } from "@/hooks/useConversations";
import { LowStockAlert } from "./LowStockAlert";
import { ShoppingCartSidebar } from "./ShoppingCartSidebar";
import { NotificationBell } from "./NotificationBell";
// import { MobileBottomNav } from "./MobileBottomNav";

import MobileBottomNav from "./MobileBottomNav";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Customer Orders", href: "/customer-order-management", icon: ShoppingCart },
  { name: "Transactions", href: "/transactions", icon: Receipt },
  { name: "Products", href: "/products", icon: Package },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Messages", href: "/messages", icon: MessageSquare },
  { name: "Returns", href: "/returns", icon: PackageX },
  { name: "Purchase Orders", href: "/purchase-orders", icon: ShoppingBag },
  { name: "Stock Transfers", href: "/stock-transfers", icon: ArrowRightLeft, managerOnly: true },
  { name: "Suppliers", href: "/suppliers", icon: Truck, managerOnly: true },
  { name: "Locations", href: "/locations", icon: MapPin, managerOnly: true },
  { name: "Loyalty", href: "/loyalty", icon: Gift, managerOnly: true },
  { name: "Analytics", href: "/analytics", icon: BarChart3, managerOnly: true },
  { name: "Admin", href: "/admin", icon: Shield, adminOnly: true },
];

const customerNavigation = [
  { name: "Shop", href: "/shop", icon: ShoppingBag },
  { name: "Dashboard", href: "/customer-dashboard", icon: LayoutDashboard },
  { name: "My Orders", href: "/customer-orders", icon: ShoppingCart },
  { name: "My Invoices", href: "/customer-invoices", icon: FileText },
  { name: "Messages", href: "/messages", icon: MessageSquare },
  { name: "Loyalty & Rewards", href: "/loyalty", icon: Gift },
  { name: "Products", href: "/products", icon: Package },
];

export function DashboardLayout({ children }) {
  const location = useLocation();
  const [open, setOpen] = React.useState(false);
  const { user, loading, signOut, roles, isManager, isAdmin, isStaff,role } = useAuth();
  const { isOnline } = useOfflineSync();
  const { theme, toggleTheme } = useTheme();
  const { getUnreadCount } = useConversations();
  const [accountNumber, setAccountNumber] = React.useState("");
  console.log("✅ Auth data:", { user, roles });
  React.useEffect(() => {
    // Dummy API call simulation — replace with your Node API later
    const fetchAccountNumber = async () => {
      if (user) {
        // Example: Simulated API response
        const fakeData = { account_number: "00000123" };
        setAccountNumber(fakeData.account_number);
      }
    };
    fetchAccountNumber();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  const NavContent = () => {
    const navItems = isStaff ? navigation : customerNavigation;

    const filteredNav = navItems.filter((item) => {
      if (item.adminOnly) return isAdmin;
      if (item.managerOnly) return isManager;
      return true;
    });

    const unreadCount = getUnreadCount();

    return (
      <nav className="flex flex-col gap-2">
        {filteredNav.map((item) => {
          const isActive = location.pathname === item.href;
          const showBadge = item.href === "/messages" && unreadCount > 0;

          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.name}</span>
              {showBadge && (
                <Badge variant="destructive" className="ml-auto">
                  {unreadCount}
                </Badge>
              )}
            </Link>
          );
        })}
        {isStaff && (
          <Link
            to="/portal"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-muted-foreground hover:bg-secondary hover:text-foreground border border-dashed"
          >
            <Smartphone className="h-5 w-5" />
            <span className="font-medium">Customer Portal</span>
          </Link>
        )}
      </nav>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 w-full border-b bg-card">
        <div className="flex h-14 items-center gap-4 px-3">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full sm:w-80 p-6">
              <div className="mb-8 flex items-center gap-2">
                <img src={mafaLogo} alt="MAFA Logo" className="h-8 w-8" />
                <h2 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  MAFA Connect
                </h2>
              </div>
              <NavContent />
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2">
            <img src={mafaLogo} alt="MAFA Logo" className="h-5 w-5" />
            <h1 className="text-base font-semibold truncate">MAFA Connect</h1>
          </div>

          <div className="ml-auto flex items-center gap-1">
            {isOnline ? (
              <Wifi className="h-3 w-3 text-success" />
            ) : (
              <WifiOff className="h-3 w-3 text-destructive" />
            )}
            {!isStaff && <ShoppingCartSidebar />}
            {!isStaff && <NotificationBell />}
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9">
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
            <Link to="/profile">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <UserCircle className="h-4 w-4" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={signOut} className="h-9 w-9">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 border-r bg-card min-h-screen sticky top-0">
          <div className="p-6 flex flex-col h-full">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-8">
                <img src={mafaLogo} alt="MAFA Logo" className="h-10 w-10" />
                <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  MAFA Connect
                </h2>
              </div>

              {!isStaff && (
                <div className="mb-6 flex items-center gap-2">
                  <ShoppingCartSidebar />
                  <NotificationBell />
                </div>
              )}

              <NavContent />
            </div>

            <div className="pt-4 border-t">
              {/* <div className="mb-3 flex flex-wrap gap-1">
                {roles.map((role) => (
                  <Badge key={role} variant="secondary" className="text-xs">
                    {role}
                  </Badge>
                ))}
              </div> */}
              <div className="mb-3 flex flex-wrap gap-1">
  {(Array.isArray(roles) && roles.length > 0
    ? roles
    : [role || user?.role || "guest"]
  ).map((r) => (
    <Badge
      key={r}
      variant={r === "admin" ? "secondary" : "destructive"}
      className="text-xs capitalize"
    >
      {r}
    </ Badge>
  ))}
</div>
              {accountNumber && (
                <div className="text-xs font-semibold text-primary mb-2 p-2 bg-primary/5 rounded">
                  MFC-{accountNumber}
                </div>
              )}
              <div className="text-sm text-muted-foreground mb-2 truncate flex items-center gap-2">
                {isOnline ? (
                  <Wifi className="h-3 w-3 text-success" />
                ) : (
                  <WifiOff className="h-3 w-3 text-destructive" />
                )}
                {user.email}
              </div>
              <Button variant="ghost" size="sm" onClick={toggleTheme} className="w-full gap-2 mb-2">
                {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                {theme === "light" ? "Dark" : "Light"} Mode
              </Button>
              <Link to="/profile">
                <Button variant="ghost" size="sm" className="w-full gap-2 mb-2">
                  <UserCircle className="h-4 w-4" />
                  Profile
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={signOut} className="w-full gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
          <LowStockAlert />
          {children}
        </main>
      </div>

      <MobileBottomNav
        isStaff={isStaff}
        unreadCount={getUnreadCount()}
        onMoreClick={() => setOpen(true)}
      />
    </div>
  );
}

// import React from "react";
// import { Link, useLocation } from "react-router-dom";
// import mafaLogo from "@/assets/mafa-logo.png";
// import { cn } from "@/lib/utils";
// import { 
//   LayoutDashboard, 
//   ShoppingCart, 
//   Package, 
//   Users, 
//   Gift, 
//   BarChart3,
//   FileText,
//   PackageX,
//   MapPin,
//   Truck,
//   ShoppingBag,
//   Menu,
//   LogOut,
//   Smartphone,
//   Wifi,
//   WifiOff,
//   UserCircle,
//   Shield,
//   Moon,
//   Sun,
//   MessageSquare,
//   ArrowRightLeft,
//   Receipt
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
// import { Badge } from "@/components/ui/badge";
// import { useAuth } from "@/hooks/useAuth";
// import { useOfflineSync } from "@/hooks/useOfflineSync";
// import { useTheme } from "@/hooks/useTheme";
// import { useConversations } from "@/hooks/useConversations";
// import { supabase } from "@/integrations/supabase/client";
// import { LowStockAlert } from "./LowStockAlert";
// import { ShoppingCartSidebar } from "./ShoppingCartSidebar";
// import { NotificationBell } from "./NotificationBell";
// import { MobileBottomNav } from "./MobileBottomNav";



// const navigation = [
//   { name: "Dashboard", href: "/", icon: LayoutDashboard },
//   { name: "Customer Orders", href: "/customer-order-management", icon: ShoppingCart },
//   { name: "Transactions", href: "/transactions", icon: Receipt, managerOnly: false },
//   { name: "Products", href: "/products", icon: Package },
//   { name: "Customers", href: "/customers", icon: Users },
//   { name: "Messages", href: "/messages", icon: MessageSquare },
//   { name: "Returns", href: "/returns", icon: PackageX },
//   { name: "Purchase Orders", href: "/purchase-orders", icon: ShoppingBag },
//   { name: "Stock Transfers", href: "/stock-transfers", icon: ArrowRightLeft, managerOnly: true },
//   { name: "Suppliers", href: "/suppliers", icon: Truck, managerOnly: true },
//   { name: "Locations", href: "/locations", icon: MapPin, managerOnly: true },
//   { name: "Loyalty", href: "/loyalty", icon: Gift, managerOnly: true },
//   { name: "Analytics", href: "/analytics", icon: BarChart3, managerOnly: true },
//   { name: "Admin", href: "/admin", icon: Shield, adminOnly: true },
// ];

// const customerNavigation = [
//   { name: "Shop", href: "/shop", icon: ShoppingBag },
//   { name: "Dashboard", href: "/customer-dashboard", icon: LayoutDashboard },
//   { name: "My Orders", href: "/customer-orders", icon: ShoppingCart },
//   { name: "My Invoices", href: "/customer-invoices", icon: FileText },
//   { name: "Messages", href: "/messages", icon: MessageSquare },
//   { name: "Loyalty & Rewards", href: "/loyalty", icon: Gift },
//   { name: "Products", href: "/products", icon: Package },
// ];

// export function DashboardLayout({ children }: { children: React.ReactNode }) {
//   const location = useLocation();
//   const [open, setOpen] = React.useState(false);
//   const { user, loading, signOut, roles, isManager, isAdmin, isStaff } = useAuth();
//   const { isOnline } = useOfflineSync();
//   const { theme, toggleTheme } = useTheme();
//   const { getUnreadCount } = useConversations();
//   const [accountNumber, setAccountNumber] = React.useState("");

//   React.useEffect(() => {
//     const fetchAccountNumber = async () => {
//       if (user) {
//         const { data } = await supabase
//           .from('profiles')
//           .select('account_number')
//           .eq('id', user.id)
//           .single();
        
//         if (data?.account_number) {
//           setAccountNumber(data.account_number);
//         }
//       }
//     };
//     fetchAccountNumber();
//   }, [user]);

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
//       </div>
//     );
//   }

//   if (!user) {
//     return null;
//   }

//   const NavContent = () => {
//     // Use customer navigation if user is not staff
//     const navItems = isStaff ? navigation : customerNavigation;
    
//     const filteredNav = navItems.filter(item => {
//       if (item.adminOnly) {
//         return isAdmin;
//       }
//       if (item.managerOnly) {
//         return isManager;
//       }
//       return true;
//     });

//     const unreadCount = getUnreadCount();
    
//     return (
//       <nav className="flex flex-col gap-2">
//         {filteredNav.map((item) => {
//           const isActive = location.pathname === item.href;
//           const showBadge = item.href === "/messages" && unreadCount > 0;
          
//           return (
//             <Link
//               key={item.name}
//               to={item.href}
//               onClick={() => setOpen(false)}
//               className={cn(
//                 "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
//                 isActive
//                   ? "bg-primary text-primary-foreground shadow-sm"
//                   : "text-muted-foreground hover:bg-secondary hover:text-foreground"
//               )}
//             >
//               <item.icon className="h-5 w-5" />
//               <span className="font-medium">{item.name}</span>
//               {showBadge && (
//                 <Badge variant="destructive" className="ml-auto">
//                   {unreadCount}
//                 </Badge>
//               )}
//             </Link>
//           );
//         })}
//         {isStaff && (
//           <Link
//             to="/portal"
//             onClick={() => setOpen(false)}
//             className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-muted-foreground hover:bg-secondary hover:text-foreground border border-dashed"
//           >
//             <Smartphone className="h-5 w-5" />
//             <span className="font-medium">Customer Portal</span>
//           </Link>
//         )}
//       </nav>
//     );
//   };

//   return (
//     <div className="min-h-screen bg-background">
//       {/* Mobile Header - Optimized for more screen space */}
//       <header className="lg:hidden sticky top-0 z-50 w-full border-b bg-card">
//         <div className="flex h-14 items-center gap-4 px-3">
//           <Sheet open={open} onOpenChange={setOpen}>
//             <SheetTrigger asChild>
//               <Button variant="ghost" size="icon" className="h-9 w-9">
//                 <Menu className="h-5 w-5" />
//               </Button>
//             </SheetTrigger>
//             <SheetContent side="left" className="w-full sm:w-80 p-6">
//               <div className="mb-8 flex items-center gap-2">
//                 <img src={mafaLogo} alt="MAFA Logo" className="h-8 w-8" />
//                 <h2 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
//                   MAFA Connect
//                 </h2>
//               </div>
//               <NavContent />
//             </SheetContent>
//           </Sheet>
//           <div className="flex items-center gap-2">
//             <img src={mafaLogo} alt="MAFA Logo" className="h-5 w-5" />
//             <h1 className="text-base font-semibold truncate">MAFA Connect</h1>
//           </div>
//           <div className="ml-auto flex items-center gap-1">
//             {isOnline ? (
//               <Wifi className="h-3 w-3 text-success" />
//             ) : (
//               <WifiOff className="h-3 w-3 text-destructive" />
//             )}
//             {!isStaff && <ShoppingCartSidebar />}
//             {!isStaff && <NotificationBell />}
//             <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9">
//               {theme === "light" ? <Moon className="h-4 w-4" />  = "h-4 w-4" />}
//             </Button>
//             <Link to="/profile">
//               <Button variant="ghost" size="icon" className="h-9 w-9">
//                 <UserCircle className="h-4 w-4" />
//               </Button>
//             </Link>
//             <Button
//               variant="ghost"
//               size="icon"
//               onClick={signOut}
//               className="h-9 w-9"
//             >
//               <LogOut className="h-4 w-4" />
//             </Button>
//           </div>
//         </div>
//       </header>

//       <div className="flex">
//         {/* Desktop Sidebar */}
//         <aside className="hidden lg:block w-64 border-r bg-card min-h-screen sticky top-0">
//           <div className="p-6 flex flex-col h-full">
//             <div className="flex-1">
//               <div className="flex items-center gap-2 mb-8">
//                 <img src={mafaLogo} alt="MAFA Logo" className="h-10 w-10" />
//                 <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
//                   MAFA Connect
//                 </h2>
//               </div>
              
//               {!isStaff && (
//                 <div className="mb-6 flex items-center gap-2">
//                   <ShoppingCartSidebar />
//                   <NotificationBell />
//                 </div>
//               )}
              
//               <NavContent />
//             </div>
//             <div className="pt-4 border-t">
//               <div className="mb-3 flex flex-wrap gap-1">
//                 {roles.map(role => (
//                   <Badge key={role} variant="secondary" className="text-xs">
//                     {role}
//                   </Badge>
//                 ))}
//               </div>
//               {accountNumber && (
//                 <div className="text-xs font-semibold text-primary mb-2 p-2 bg-primary/5 rounded">
//                   MFC-{accountNumber}
//                 </div>
//               )}
//               <div className="text-sm text-muted-foreground mb-2 truncate flex items-center gap-2">
//                 {isOnline ? (
//                   <Wifi className="h-3 w-3 text-success" />
//                 ) : (
//                   <WifiOff className="h-3 w-3 text-destructive" />
//                 )}
//                 {user.email}
//               </div>
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={toggleTheme}
//                 className="w-full gap-2 mb-2"
//               >
//                 {theme === "light" ? <Moon className="h-4 w-4" />  = "h-4 w-4" />}
//                 {theme === "light" ? "Dark" : "Light"} Mode
//               </Button>
//               <Link to="/profile">
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   className="w-full gap-2 mb-2"
//                 >
//                   <UserCircle className="h-4 w-4" />
//                   Profile
//                 </Button>
//               </Link>
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={signOut}
//                 className="w-full gap-2"
//               >
//                 <LogOut className="h-4 w-4" />
//                 Logout
//               </Button>
//             </div>
//           </div>
//         </aside>

//         {/* Main Content - Optimized padding for mobile with bottom nav */}
//         <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
//           <LowStockAlert />
//           {children}
//         </main>
//       </div>

//       {/* Mobile Bottom Navigation */}
//       <MobileBottomNav 
//         isStaff={isStaff} 
//         unreadCount={getUnreadCount()} 
//         onMoreClick={() => setOpen(true)}
//       />
//     </div>
//   );
// }
