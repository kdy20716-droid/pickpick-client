import { Link } from "react-router-dom";
import "./Header.css";
import accountIcon from "../assets/account-icon.svg";
import { useAuth } from "../contexts/AuthContext";

const Header = () => {
  const { isLoggedIn, user } = useAuth();

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="brand">
          PICKPICK
        </Link>
        <nav className="site-nav" aria-label="주요 메뉴">
          <Link to="/create" data-label="+ CREATE">+ CREATE</Link>
          <Link to="/ranking" data-label="RANKING">RANKING</Link>
          {!isLoggedIn ? (
            <Link to="/login" data-label="LOG IN">LOG IN</Link>
          ) : (
            <Link to="/mypage" className="account-link" aria-label="계정">
              {user?.profile_image ? (
                <img 
                  src={(user.profile_image?.startsWith('http') ? user.profile_image : `https://dolphin-app-onqn2.ondigitalocean.app/uploads/${user.profile_image}`)} 
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
    </header>
  );
};

export default Header;
