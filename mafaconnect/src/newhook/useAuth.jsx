import React from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = React.useState(null);
  const [session, setSession] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [roles, setRoles] = React.useState([]);
  const [rolesLoaded, setRolesLoaded] = React.useState(false);
  const navigate = useNavigate();

  const fetchUserRoles = async (userId) => {
    try {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);
      
      if (data) {
        setRoles(data.map(r => r.role));
      }
      setRolesLoaded(true);
    } catch (error) {
      console.error("Error fetching roles:", error);
      setRolesLoaded(true);
    }
  };

  React.useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setRolesLoaded(false);
          setTimeout(() => fetchUserRoles(session.user.id), 0);
        } else {
          setRoles([]);
          setRolesLoaded(true);
        }
        
        if (event === "SIGNED_OUT") {
          navigate("/auth");
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchUserRoles(session.user.id);
      } else {
        setRolesLoaded(true);
        navigate("/auth");
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Only set loading to false when both session and roles are ready
  React.useEffect(() => {
    if (rolesLoaded) {
      setLoading(false);
    }
  }, [rolesLoaded]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const hasRole = (role) => roles.includes(role);
  const isAdmin = hasRole('admin');
  const isManager = hasRole('manager') || isAdmin;
  const isStaff = roles.some(role => ['admin', 'manager', 'sales_agent'].includes(role));

  return { user, session, loading, signOut, roles, hasRole, isAdmin, isManager, isStaff };
}
