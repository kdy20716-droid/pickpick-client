import { Link } from "react-router-dom";
import "./LogInHeader.css";
import accountIcon from "../assets/account-icon.svg";

const Header = () => {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="brand">
          PICKPICK
        </Link>
        <nav className="site-nav" aria-label="주요 메뉴">
          <Link to="/create">+ CREATE</Link>
          <Link to="/ranking">RANKING</Link>
          <Link to="/login">LOG IN</Link>
          <Link to="/mypage" className="account-link" aria-label="계정">
            <img src={accountIcon} alt="" />
          </Link>
        </nav>
      </div>
      <div className="header-glow" aria-hidden="true" />
    </header>
  );
};

export default Header;
