import styles from "./MyPage.module.css";
import candLeft from "../assets/candidate-left.jpg";
import candRight from "../assets/candidate-right.jpg";

const Profile = () => {
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
              <div className={styles.msgPink}>HEY PLZ VOTE !</div>
              <div className={styles.msgReply}>
                <span className={styles.mIcon}>M</span> ↳ REPLY
              </div>
            </div>

            <div className={styles.msgGray}>YOU GOT 987 LIKES !</div>
            <div className={styles.msgGray}>MARK POST NEW POLL</div>

            <div className={styles.trendingBox}>
              <p className={styles.trendingTitle}>TRENDING NOW</p>

              <div className={styles.rankRow}>
                <span className={styles.rankLabel}>TOP 1</span>
                <div className={styles.vsFlex}>
                  <div className={styles.charBox}>
                    <img src={candLeft} alt="" />
                  </div>
                  <span className={styles.vsTxt}>VS</span>
                  <div className={styles.charBox}>
                    <img src={candRight} alt="" />
                  </div>
                </div>
              </div>
              <div className={styles.rankRow}>
                <span className={styles.rankLabel}>TOP 2</span>
                <div className={styles.vsFlex}>
                  <div className={styles.charBox}>
                    <img src={candLeft} alt="" />
                  </div>
                  <span className={styles.vsTxt}>VS</span>
                  <div className={styles.charBox}>
                    <img src={candRight} alt="" />
                  </div>
                </div>
              </div>
              <div className={styles.rankRow}>
                <span className={styles.rankLabel}>TOP 3</span>
                <div className={styles.vsFlex}>
                  <div className={styles.charBox}>
                    <img src={candLeft} alt="" />
                  </div>
                  <span className={styles.vsTxt}>VS</span>
                  <div className={styles.charBox}>
                    <img src={candRight} alt="" />
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.bottomCheck}>
              <span className={styles.checkCircle}>✔</span> 확인했어요
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Profile;
