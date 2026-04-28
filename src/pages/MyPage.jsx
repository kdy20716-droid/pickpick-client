import { Outlet } from "react-router-dom";
import Menu from "../components/menu";
import styles from "./MyPage.module.css";

const MyPage = () => {
  return (
    <div className={styles.wrapper}>
      <nav className={styles.sidebar}>
        <div className={styles.navLinks}>
          <Menu />
        </div>
        <div className={styles.sidebarUser}>
          <div className={styles.userThumb}></div>
          <span>
            홍길동 <small className={styles.sideArrow}>〉</small>
          </span>
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
