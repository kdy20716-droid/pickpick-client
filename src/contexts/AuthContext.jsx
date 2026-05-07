import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import { logout as apiLogout } from "../api/users";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem("token"));

  const isLoggedIn = Boolean(token && user);
  const isAdmin = user?.role === "admin";

  // Sync state with localStorage if it changes elsewhere (optional but good for consistency)
  useEffect(() => {
    const handleStorageChange = () => {
      const savedUser = localStorage.getItem("user");
      const savedToken = localStorage.getItem("token");
      setUser(savedUser ? JSON.parse(savedUser) : null);
      setToken(savedToken);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Monitor user changes and verify admin role
  useEffect(() => {
    if (user) {
      console.log("✅ 사용자 정보 업데이트:", {
        id: user.id,
        name: user.name,
        role: user.role,
        isAdmin: user.role === "admin",
      });
    }
  }, [user]);

  const login = (userData, userToken) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", userToken);
    setUser(userData);
    setToken(userToken);
  };

  const updateUser = (userData) => {
    const updatedUser = { ...user, ...userData };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setUser(null);
      setToken(null);
    }
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isLoggedIn,
      isAdmin,
      login,
      updateUser,
      logout,
    }),
    [user, token, isLoggedIn, isAdmin],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
