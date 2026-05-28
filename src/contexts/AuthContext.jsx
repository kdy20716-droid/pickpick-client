import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import { logout as apiLogout, getMe } from "../api/users";

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const savedUser = localStorage.getItem("user");
    if (!savedUser) return null;

    const parsedUser = JSON.parse(savedUser);
    if (parsedUser && typeof parsedUser === "object" && !Array.isArray(parsedUser)) {
      return parsedUser;
    }

    localStorage.removeItem("user");
    localStorage.removeItem("token");
    return null;
  } catch (error) {
    console.warn("저장된 사용자 정보를 초기화합니다.", error);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => readStoredUser());

  const [token, setToken] = useState(() => localStorage.getItem("token"));

  const isLoggedIn = Boolean(token && user);
  const isAdmin = user?.role === "admin";

  // Sync state with localStorage if it changes elsewhere (optional but good for consistency)
  useEffect(() => {
    const handleStorageChange = () => {
      const savedToken = localStorage.getItem("token");
      setUser(readStoredUser());
      setToken(savedToken);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // 최신 사용자 정보 가져오기
  useEffect(() => {
    const fetchLatestUser = async () => {
      if (token) {
        try {
          const res = await getMe();
          if (res.success) {
            setUser(res.user);
            localStorage.setItem("user", JSON.stringify(res.user));
          }
        } catch (error) {
          console.error("최신 사용자 정보 조회 실패:", error);
          // 토큰이 만료되었거나 유효하지 않은 경우 세션 정리
          if (error.response?.status === 401) {
             console.warn("세션이 만료되었습니다. 다시 로그인해주세요.");
             logout(); 
          }
        }
      }
    };

    fetchLatestUser();
  }, [token]);

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
