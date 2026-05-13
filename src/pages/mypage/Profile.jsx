import { useState, useEffect, useCallback, useRef } from "react";
import styles from "./MyPage.module.css";
import { useAuth } from "../../contexts/AuthContext";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  updateProfile,
} from "../../api/users";
import ImageCropper from "../../components/ImageCropper";

const Profile = () => {
  const [notifications, setNotifications] = useState([]);
  const { user: currentUser, updateUser } = useAuth();
  
  // 프로필 이미지 관련 상태
  const fileInputRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isCropping, setIsCropping] = useState(false);

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

  // 이미지 선택 핸들러
  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setSelectedImage(reader.result);
        setIsCropping(true);
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // 크롭 완료 핸들러
  const handleCropComplete = async (croppedBlob) => {
    setIsCropping(false);
    setSelectedImage(null);
    
    try {
      const formData = new FormData();
      formData.append("profile_image", croppedBlob, "profile.jpg");
      
      const res = await updateProfile(currentUser.id, formData);
      if (res.success) {
        updateUser(res.user);
        alert("프로필 사진이 변경되었습니다.");
      }
    } catch (error) {
      console.error("프로필 이미지 업로드 실패:", error);
      alert("프로필 사진 변경에 실패했습니다.");
    }
  };

  const handleCropCancel = () => {
    setIsCropping(false);
    setSelectedImage(null);
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
            <div 
              className={`${styles.card} ${styles.profileImgCard}`}
              onClick={handleImageClick}
              style={{ cursor: "pointer" }}
            >
              <div className={styles.circleBig}>
                {currentUser?.profile_image ? (
                  <img 
                    src={(currentUser.profile_image?.startsWith('http') ? currentUser.profile_image : `https://dolphin-app-onqn2.ondigitalocean.app/uploads/${currentUser.profile_image}`)} 
                    alt="Profile" 
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <div className={styles.silhouette}></div>
                )}
              </div>
              <div className={styles.camIconWrapper}>
                <div className={styles.camIcon}>📷</div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={onSelectFile} 
                accept="image/*" 
                style={{ display: "none" }}
              />
            </div>
            <div className={`${styles.card} ${styles.nicknameCard}`}>
              <div className={styles.lvBadge}>
                LV.99 <span className={styles.qMark}>?</span>{" "}
                <span className={styles.playBtn}>▶</span>
              </div>
              <h2 className={styles.nickname}>{currentUser?.name || "게스트"} 님</h2>
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

      {isCropping && (
        <ImageCropper 
          image={selectedImage} 
          onCropComplete={handleCropComplete} 
          onCancel={handleCropCancel}
        />
      )}
    </>
  );
};

export default Profile;
