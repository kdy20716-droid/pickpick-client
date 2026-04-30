import { Outlet, useNavigate } from "react-router-dom";
import Menu from "../components/menu";
import styles from "./MyPage.module.css";
import instance from "../api/instance";

const MyPage = () => {
  const navigate = useNavigate();

  const userStr = localStorage.getItem("user");
  const currentUser = userStr ? JSON.parse(userStr) : null;

  const handleLogout = async () => {
    try {
      // 서버에 로그아웃 요청 (토큰 기반이더라도 로그 기록이나 블랙리스트 처리 등 서버 로직을 위함)
      await instance.post("/users/logout");
    } catch (error) {
      console.error("서버 로그아웃 처리 중 에러:", error);
    } finally {
      // 클라이언트 측 정보 삭제
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // 필요하다면 투표 기록 등 다른 개인화된 정보도 삭제
      alert("로그아웃 되었습니다.");
      navigate("/login");
    }
  };

  const handleDeleteAccount = async () => {
    if (!currentUser) {
      alert("로그인 정보가 없습니다.");
      return;
    }

    if (window.confirm("정말로 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없으며 모든 데이터가 삭제됩니다.")) {
      try {
        await instance.delete(`/users/account/${currentUser.id}`);
        alert("회원 탈퇴가 완료되었습니다.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      } catch (error) {
        console.error("회원 탈퇴 에러:", error);
        alert(error.response?.data?.message || "회원 탈퇴 처리에 실패했습니다.");
      }
    }
  };

  return (
    <div className={styles.wrapper}>
      <nav className={styles.sidebar}>
        <div className={styles.navLinks}>
          <Menu />
        </div>
        <div className={styles.sidebarUserWrapper}>
          <button 
            className={styles.logoutBtn} 
            onClick={handleLogout}
          >
            LOGOUT
          </button>
          <button 
            className={styles.deleteBtn} 
            onClick={handleDeleteAccount}
          >
            DELETE ACCOUNT
          </button>
        </div>
      </nav>

      <main className={styles.mainContent}>
        {/* 하위 페이지들이 여기에 렌더링됩니다 */}
        <Outlet />
      </main>
    </div>
  );
};

export default MyPage;
