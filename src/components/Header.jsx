import { Link } from "react-router-dom";
import { motion, useScroll, useVelocity, useSpring, useTransform } from "framer-motion";
import "./Header.css";
import accountIcon from "../assets/account-icon.svg";
import { useAuth } from "../contexts/AuthContext";

const Header = () => {
  const { isLoggedIn, user } = useAuth();
  
  // 스크롤 애니메이션을 위한 훅
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400
  });

  // 스크롤 방향과 속도에 따른 빛 높이/불투명도 조절
  // 속도 < 0 (스크롤 올림): 빛이 아래로 퍼짐 (scaleY 증가, 투명도 증가)
  // 속도 = 0 (정지): 기본 상태
  // 속도 > 0 (스크롤 내림): 빛이 위로 올라감 (scaleY 감소, 투명도 감소)
  const scaleY = useTransform(smoothVelocity, [-800, 0, 800], [2.2, 1, 0]);
  const opacity = useTransform(smoothVelocity, [-800, 0, 800], [1, 0.7, 0]);

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="brand">
          PICKPICK
        </Link>
        <nav className="site-nav" aria-label="주요 메뉴">
          <Link to="/create">+ CREATE</Link>
          <Link to="/ranking">RANKING</Link>
          {!isLoggedIn ? (
            <Link to="/login">LOG IN</Link>
          ) : (
            <Link to="/mypage" className="account-link" aria-label="계정">
              {user?.profile_image ? (
                <img 
                  src={(user.profile_image?.startsWith('http') ? user.profile_image : `http://localhost:4000/uploads/${user.profile_image}`)} 
                  alt="" 
                  className="profile-img-small" 
                />
              ) : (
                <img src={accountIcon} alt="" />
              )}
            </Link>
          )}
        </nav>
      </div>
      <motion.div 
        className="header-glow" 
        aria-hidden="true" 
        style={{ scaleY, opacity, transformOrigin: "top" }}
      />
    </header>
  );
};

export default Header;
