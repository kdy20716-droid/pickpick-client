import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Menu from "../../components/menu";
import styles from "./MyPage.module.css";
import { useAuth } from "../../contexts/AuthContext";
import instance from "../../api/instance";
import { useRouteAnimation } from "../../hooks/useRouteAnimation";

const MyPage = () => {
  const navigate = useNavigate();
  const { user: currentUser, token, logout } = useAuth();
  const [confirmModal, setConfirmModal] = useState(null); // 'logout', 'delete', or null
  const { displayOutlet, transitionStage, onTransitionEnd, activePath } =
    useRouteAnimation();

  useEffect(() => {
    if (!token) {
      alert("로그인이 필요한 페이지입니다.");
      navigate("/login");
    }
  }, [token, navigate]);

  const executeLogout = async () => {
    setConfirmModal(null);
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("서버 로그아웃 처리 중 에러:", error);
    }
  };

  const executeDeleteAccount = async () => {
    if (!currentUser) return;
    setConfirmModal(null);
    try {
      await instance.delete(`/users/account/${currentUser.id}`);
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("회원 탈퇴 에러:", error);
      alert(error.response?.data?.message || "회원 탈퇴 처리에 실패했습니다.");
    }
  };

  const handleConfirm = () => {
    if (confirmModal === "logout") {
      executeLogout();
    } else if (confirmModal === "delete") {
      executeDeleteAccount();
    }
  };

  return (
    <div className={styles.wrapper}>
      <nav className={styles.sidebar}>
        <div className={styles.navLinks}>
          <Menu />
        </div>
      </nav>

      <main className={styles.mainContent}>
        <div
          key={activePath}
          className={
            transitionStage === "enter"
              ? styles.animateEnter
              : styles.animateExit
          }
          onAnimationEnd={onTransitionEnd}
          style={{ width: "100%" }}
        >
          {displayOutlet}
        </div>
      </main>

      <a href="mailto:support@pickpick.dev" className={styles.supportButton}>
        Support
      </a>

      {confirmModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setConfirmModal(null)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className={styles.modalTitle}>
              {confirmModal === "logout" ? "로그아웃" : "회원 탈퇴"}
            </h3>
            <p className={styles.modalText}>
              {confirmModal === "logout"
                ? "정말로 로그아웃 하시겠습니까?"
                : "정말로 탈퇴하시겠습니까?\n이 작업은 되돌릴 수 없으며 모든 데이터가 삭제됩니다."}
            </p>
            <div className={styles.modalActions}>
              <button
                className={styles.modalCancelBtn}
                onClick={() => setConfirmModal(null)}
              >
                취소
              </button>
              <button
                className={
                  confirmModal === "logout"
                    ? styles.modalConfirmBtn
                    : styles.modalDangerBtn
                }
                onClick={handleConfirm}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPage;
