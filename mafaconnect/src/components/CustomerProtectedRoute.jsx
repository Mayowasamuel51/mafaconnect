import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

export function CustomerProtectedRoute({ children }) {
  const { user, loading, isStaff } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/auth");
      } else if (isStaff) {
        // Staff users should use the staff dashboard
        navigate("/");
      }
    }
  }, [user, loading, isStaff, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || isStaff) {
    return null;
  }

  return <>{children}</>;
}

// import React from "react";
// import { ReactNode } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "@/hookss/useAuth";
// import { Loader2 } from "lucide-react";



// export function CustomerProtectedRoute({ children }: CustomerProtectedRouteProps) {
//   const { user, loading, isStaff } = useAuth();
//   const navigate = useNavigate();

//   React.useEffect(() => {
//     if (!loading) {
//       if (!user) {
//         navigate("/auth");
//       } else if (isStaff) {
//         // Staff users should use the staff dashboard
//         navigate("/");
//       }
//     }
//   }, [user, loading, isStaff, navigate]);

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <Loader2 className="h-12 w-12 animate-spin text-primary" />
//       </div>
//     );
//   }

//   if (!user || isStaff) {
//     return null;
//   }

//   return <>{children}</>;
// }
