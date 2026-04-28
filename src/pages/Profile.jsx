import { useState, useEffect } from "react";
import styles from "./MyPage.module.css";
import candLeft from "../assets/candidate-left.jpg";
import candRight from "../assets/candidate-right.jpg";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../api/users";

const Profile = () => {
  const [notifications, setNotifications] = useState([]);

  const userStr = localStorage.getItem("user");
  const currentUser = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
    }
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications(currentUser.id);
      if (res.success) {
        setNotifications(res.notifications);
      }
    } catch (error) {
      console.error("알림 조회 실패:", error);
    }
  };

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
            <div className={`${styles.card} ${styles.profileImgCard}`}>
              <div className={styles.circleBig}>
                <div className={styles.silhouette}></div>
              </div>
              <div className={styles.camIconWrapper}>
                <div className={styles.camIcon}>📷</div>
              </div>
            </div>
            <div className={`${styles.card} ${styles.nicknameCard}`}>
              <div className={styles.lvBadge}>
                LV.99 <span className={styles.qMark}>?</span>{" "}
                <span className={styles.playBtn}>▶</span>
              </div>
              <h2 className={styles.nickname}>홍길동 님</h2>
              <span className={styles.gearIcon}>⚙</span>
            </div>
          </div>
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
    </>
  );
};

export default Profile;
