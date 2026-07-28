import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

/**
 * 로그인이 필요한 페이지를 보호하는 래퍼 컴포넌트
 * 비로그인 상태에서 접근 시 /login으로 리다이렉트하며,
 * 로그인 후 원래 경로로 돌아올 수 있도록 state에 from을 전달합니다.
 *
 * @example
 * <Route path="/create" element={<ProtectedRoute><Create /></ProtectedRoute>} />
 */
export default function ProtectedRoute({ children }) {
  const { isLoggedIn } = useAuth();
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

/**
 * 관리자 전용 페이지를 보호하는 래퍼 컴포넌트
 * 비관리자 접근 시 메인(/)으로 리다이렉트합니다.
 *
 * @example
 * <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
 */
export function AdminRoute({ children }) {
  const { isLoggedIn, isAdmin } = useAuth();
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
