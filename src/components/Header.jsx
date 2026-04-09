import "./Header.css";
import accountIcon from "../assets/account-icon.svg";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="brand">
          PICKPICK
        </Link>
        <nav className="site-nav" aria-label="주요 메뉴">
          <a href="#">+ CREATE</a>
          <Link to="/ranking" className="active">
            RANKING
          </Link>
          <a href="#">LOG IN</a>  
          <Link to="/mypage" className="account-link" aria-label="계정">
           <img src={accountIcon} alt="" /></Link>
        </nav>  
      </div>
      <div className="header-glow" aria-hidden="true" />
    </header>
  );
};

export default Header;
