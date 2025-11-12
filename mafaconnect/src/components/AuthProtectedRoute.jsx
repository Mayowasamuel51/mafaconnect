import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth"; // ✅ Make sure folder is "hooks", not "hookss"
import { Loader2 } from "lucide-react";

export default function AuthProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}

// import { useEffect } from "react";
// import { ReactNode } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "@/hookss/useAuth";
// import { Loader2 } from "lucide-react";



// export function AuthProtectedRoute({ children }: AuthProtectedRouteProps) {
//   const { user, loading } = useAuth();
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (!loading && !user) {
//       navigate("/auth");
//     }
//   }, [user, loading, navigate]);

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <Loader2 className="h-12 w-12 animate-spin text-primary" />
//       </div>
//     );
//   }

//   if (!user) {
//     return null;
//   }

//   return <>{children}</>;
// }
