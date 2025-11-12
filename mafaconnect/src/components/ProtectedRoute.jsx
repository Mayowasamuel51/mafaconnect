// new one below
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function ProtectedRoute({
  children,
  requireAdmin = false,
  requireManager = false,
  requireSalesAgent = false,
}) {
  const { user, role, loading, isAdmin, isManager, isSalesAgent } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate("/auth", { replace: true });
      return;
    }

    if (requireAdmin && !isAdmin) {
      navigate("/portal", { replace: true });
      return;
    }

    if (requireManager && !isManager) {
      navigate("/portal", { replace: true });
      return;
    }

    if (requireSalesAgent && !isSalesAgent) {
      navigate("/portal", { replace: true });
      return;
    }
  }, [
    user,
    role,
    isAdmin,
    isManager,
    isSalesAgent,
    loading,
    navigate,
    requireAdmin,
    requireManager,
    requireSalesAgent,
  ]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
