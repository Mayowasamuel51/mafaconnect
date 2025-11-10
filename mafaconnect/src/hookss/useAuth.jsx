import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState([]);
  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_HOME_OO || "https://your-backend.com/api";

  // ✅ Fetch user info (based on saved token)
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("ACCESS_TOKEN");
      if (!token) {
        navigate("/auth");
        return;
      }

      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        localStorage.removeItem("ACCESS_TOKEN");
        navigate("/auth");
        return;
      }

      const data = await res.json();
      setUser(data.user || data);
      setRoles(data.roles || []);
    } catch (err) {
      console.error("Error fetching user:", err);
      localStorage.removeItem("ACCESS_TOKEN");
      navigate("/auth");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle logout
  const signOut = () => {
    localStorage.removeItem("ACCESS_TOKEN");
    setUser(null);
    navigate("/auth");
  };

  // ✅ Role helpers
  const hasRole = (role) => roles.includes(role);
  const isAdmin = hasRole("admin");
  const isManager = hasRole("manager") || isAdmin;
  const isStaff = roles.some((r) =>
    ["admin", "manager", "sales_agent"].includes(r)
  );

  // ✅ Run on mount
  useEffect(() => {
    fetchUser();
  }, []);

  return {
    user,
    loading,
    roles,
    signOut,
    hasRole,
    isAdmin,
    isManager,
    isStaff,
  };
}
