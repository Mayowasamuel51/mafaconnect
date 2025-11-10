import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import { useAuth } from "@/hooks/useAuth"; // ✅ make sure folder name is 'hooks' not 'hookss'
import { Loader2 } from "lucide-react";
// import { useAuth } from "@/hooks/hooks/useAuth";
import { useAuth } from "@/hooks/useAuth";

 function ProtectedRoute({ children, requireAdmin, requireManager }) {
  const { user, loading, isAdmin, isManager, isStaff } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/auth");
      } else if (!isStaff) {
        // Non-staff users (customers) should not access staff-only routes
        navigate("/customer-dashboard");
      } else if (requireAdmin && !isAdmin) {
        navigate("/");
      } else if (requireManager && !isManager) {
        navigate("/");
      }
    }
  }, [user, loading, isAdmin, isManager, isStaff, requireAdmin, requireManager, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isStaff) {
    return null;
  }

  if (requireAdmin && !isAdmin) {
    return null;
  }

  if (requireManager && !isManager) {
    return null;
  }

  return <>{children}</>;
}
export default ProtectedRoute;


// import React from "react";
// import { ReactNode } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "@/hookss/useAuth";
// import { Loader2 } from "lucide-react";



// export function ProtectedRoute({ children, requireAdmin, requireManager }: ProtectedRouteProps) {
//   const { user, loading, isAdmin, isManager, isStaff } = useAuth();
//   const navigate = useNavigate();

//   React.useEffect(() => {
//     if (!loading) {
//       if (!user) {
//         navigate("/auth");
//       } else if (!isStaff) {
//         // Non-staff users (customers) should not access staff-only routes
//         navigate("/customer-dashboard");
//       } else if (requireAdmin && !isAdmin) {
//         navigate("/");
//       } else if (requireManager && !isManager) {
//         navigate("/");
//       }
//     }
//   }, [user, loading, isAdmin, isManager, isStaff, requireAdmin, requireManager, navigate]);

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <Loader2 className="h-12 w-12 animate-spin text-primary" />
//       </div>
//     );
//   }

//   if (!user || !isStaff) {
//     return null;
//   }

//   if (requireAdmin && !isAdmin) {
//     return null;
//   }

//   if (requireManager && !isManager) {
//     return null;
//   }

//   return <>{children}</>;
// }
