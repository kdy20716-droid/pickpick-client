import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./MyPage.module.css";
import { useAuth } from "../../contexts/AuthContext";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  updateProfile,
  updateBorder,
} from "../../api/users";
import ProfileEditor from "../../components/ProfileEditor";
import Grade from "./Grade";

import { getImageUrl } from "../../utils/image";

const Profile = () => {
  const [notifications, setNotifications] = useState([]);
  const { user: currentUser, updateUser } = useAuth();
  const navigate = useNavigate();

  // 프로필 편집 관련 상태
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!currentUser) return;
    try {
      const res = await getNotifications(currentUser.id);
      if (res.success) {
        setNotifications(res.notifications);
      }
    } catch (error) {
      console.error("알림 조회 실패:", error);
    }
  }, [currentUser]);

  useEffect(() => {
    const t = setTimeout(() => {
      fetchNotifications();
    }, 0);
    return () => clearTimeout(t);
  }, [fetchNotifications]);

  const handleReadNotification = async (notifId) => {
    try {
      await markNotificationRead(currentUser.id, notifId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, is_read: 1 } : n)),
      );
    } catch (error) {
      console.error("알림 읽음 처리 실패:", error);
    }
  };

  const handleReadAll = async () => {
    try {
      await markAllNotificationsRead(currentUser.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
    } catch (error) {
      console.error("모든 알림 읽음 처리 실패:", error);
    }
  };

  // 프로필 편집 저장
  const handleProfileSave = async (imageBlob, borderId) => {
    try {
      // 1. 테두리 변경 (선택된 테두리가 현재와 다를 때만)
      if (borderId !== currentUser.selected_border) {
        await updateBorder(currentUser.id, borderId);
      }

      // 2. 이미지 변경 (이미지 블롭이 있을 때만)
      if (imageBlob) {
        const formData = new FormData();
        formData.append("profile_image", imageBlob, "profile.jpg");
        const res = await updateProfile(currentUser.id, formData);
        if (res.success) {
          updateUser({ ...res.user, selected_border: borderId });
        }
      } else {
        updateUser({ ...currentUser, selected_border: borderId });
      }

      alert("프로필이 성공적으로 변경되었습니다.");
      setIsEditingProfile(false);
    } catch (error) {
      console.error("프로필 저장 실패:", error);
      alert("프로필 저장에 실패했습니다.");
    }
  };

  const getGradeInfo = (grade) => {
    const g = grade?.toUpperCase() || "브론즈";
    if (g === "SILVER" || g === "실버") return { color: "#C0C0C0", emoji: "🥈" };
    if (g === "GOLD" || g === "골드") return { color: "#FFD700", emoji: "🥇" };
    if (g === "PLATINUM" || g === "플래티넘")
      return { color: "#B4C3D2", emoji: "💎" };
    if (g === "DIAMOND" || g === "다이아몬드")
      return { color: "#70D1F4", emoji: "👑" };
    return { color: "#CD7F32", emoji: "🥉" }; // 브론즈
  };

  const gradeInfo = getGradeInfo(currentUser?.grade || "브론즈");

  return (
    <>
      <div className={styles.topSearchRow}>
        <p className={styles.breadcrumb}>마이페이지 〉 내 프로필</p>
        <div className={styles.searchBar}>
          <input type="text" placeholder="" />
          <span className={styles.searchIcon}>🔍</span>
        </div>
      </div>

      <section className={styles.contentBody}>
        <div className={styles.leftPanel}>
          <div className={styles.profileHeader}>
            <div
              className={`${styles.card} ${styles.profileImgCard}`}
              onClick={() => setIsEditingProfile(true)}
              style={{ cursor: "pointer" }}
            >
              <div className={`${styles.circleBig} ${currentUser?.selected_border ? `profile-border-${currentUser.selected_border}` : ""}`}>
                {currentUser?.profile_image ? (
                  <img
                    src={getImageUrl(currentUser.profile_image)}
                    alt="Profile"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "50%",
                    }}
                  />
                ) : (
                  <div className={styles.silhouette}></div>
                )}
              </div>
              <div className={styles.camIconWrapper}>
                <div className={styles.camIcon}>📷</div>
              </div>
            </div>
            <div className={`${styles.card} ${styles.nicknameCard}`}>
              <div
                className={styles.lvBadge}
                style={{ color: gradeInfo.color }}
              >
                {gradeInfo.emoji} {currentUser?.grade || "브론즈"}{" "}
              </div>
              <h2 className={styles.nickname}>
                {currentUser?.name || "게스트"} 님
              </h2>
              <button
                type="button"
                className={styles.gearIcon}
                onClick={() => navigate("/mypage/profileedit")}
                aria-label="프로필 설정"
              >
                ⚙
              </button>
            </div>
          </div>
          <Grade />
        </div>

        <div className={styles.rightPanel}>
          <div className={`${styles.card} ${styles.notifCard}`}>
            <h3 className={styles.panelTitle}>NOTIFICATION</h3>

            <div className={styles.msgBubbleContainer}>
              {notifications.length === 0 ? (
                <div className={styles.msgGray}>새로운 알림이 없습니다.</div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={notif.is_read ? styles.msgGray : styles.msgPink}
                    onClick={() =>
                      !notif.is_read && handleReadNotification(notif.id)
                    }
                    style={{ cursor: notif.is_read ? "default" : "pointer" }}
                  >
                    {notif.type === "COMMENT_ON_POST" &&
                      `${notif.sender_name}님이 내 투표에 댓글을 남겼습니다: "${notif.comment_content}"`}
                    {notif.type === "REPLY_ON_COMMENT" && (
                      <>
                        <span className={styles.mIcon}>M</span> ↳{" "}
                        {notif.sender_name}님이 내 댓글에 답글을 남겼습니다: "
                        {notif.comment_content}"
                      </>
                    )}
                  </div>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <div
                className={styles.bottomCheck}
                onClick={handleReadAll}
                style={{ cursor: "pointer" }}
              >
                <span className={styles.checkCircle}>✔</span> 확인했어요
              </div>
            )}
          </div>
        </div>
      </section>

      {isEditingProfile && (
        <ProfileEditor
          initialImage={currentUser?.profile_image}
          initialBorder={currentUser?.selected_border}
          userTier={currentUser?.tier}
          unlockedBorders={currentUser?.unlocked_borders}
          isAdmin={currentUser?.role === "admin"}
          onSave={handleProfileSave}
          onCancel={() => setIsEditingProfile(false)}
        />
      )}
    </>
  );
};

export default Profile;
