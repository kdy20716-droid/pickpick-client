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
  const [promotionInfo, setPromotionInfo] = useState(null); // { oldGrade, newGrade } or null
  const { displayOutlet, transitionStage, onTransitionEnd, activePath } = useRouteAnimation();

  // 등급 순서 (비교용)
  const gradeOrder = ["UNRANKED", "BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND"];
  const getGradeEmoji = (grade) => {
    const g = grade?.toUpperCase();
    if (g === "BRONZE") return "🥉";
    if (g === "SILVER") return "🥈";
    if (g === "GOLD") return "🥇";
    if (g === "PLATINUM") return "💎";
    if (g === "DIAMOND") return "👑";
    return "⚪";
  };

  useEffect(() => {
    if (!token) {
      alert("로그인이 필요한 페이지입니다.");
      navigate("/login");
      return;
    }

    // 등업 체크 로직
    if (currentUser) {
      const storedGrade = localStorage.getItem(`prevGrade_${currentUser.id}`);
      const currentGrade = currentUser.grade?.toUpperCase() || "UNRANKED";

      if (storedGrade && storedGrade !== currentGrade) {
        const oldIndex = gradeOrder.indexOf(storedGrade);
        const newIndex = gradeOrder.indexOf(currentGrade);

        // 등급이 상승했을 때만 축하 (UnRanked -> BRONZE 등)
        if (newIndex > oldIndex && oldIndex !== -1) {
          setPromotionInfo({
            oldGrade: storedGrade,
            newGrade: currentGrade,
          });
        }
      }
      // 현재 등급을 저장 (다음 비교를 위해)
      localStorage.setItem(`prevGrade_${currentUser.id}`, currentGrade);
    }
  }, [token, navigate, currentUser?.grade, currentUser?.id]);

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
          className={transitionStage === "enter" ? styles.animateEnter : styles.animateExit}
          onAnimationEnd={onTransitionEnd}
          style={{ width: "100%" }}
        >
          {displayOutlet}
        </div>
      </main>

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

      {promotionInfo && (
        <div className={styles.promoOverlay} onClick={() => setPromotionInfo(null)}>
          <div className={styles.confettiContainer}>
            {[...Array(20)].map((_, i) => (
              <div key={i} className={styles.confetti} />
            ))}
          </div>
          <div className={styles.promoContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.promoEmoji}>{getGradeEmoji(promotionInfo.newGrade)}</div>
            <h2 className={styles.promoTitle}>등급 상승 축하드려요!</h2>
            <p className={styles.promoText}>
              <span className={styles.oldGrade}>{promotionInfo.oldGrade}</span>
              <span className={styles.arrow}>→</span>
              <span className={styles.newGrade}>{promotionInfo.newGrade}</span>
            </p>
            <p className={styles.promoSubText}>꾸준한 활동으로 다음 등급에도 도전해보세요!</p>
            <button className={styles.promoBtn} onClick={() => setPromotionInfo(null)}>
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPage;
