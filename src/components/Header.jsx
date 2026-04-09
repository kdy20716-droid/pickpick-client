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
          <Link to="/create">+ CREATE</Link>
          <Link to="/ranking" className="active">
            RANKING
          </Link>
          <Link to="/signin">LOG IN</Link>
          <div className="dropdown">
            <Link to="/mypage" className="account-link" aria-label="계정">
              <img src={accountIcon} alt="마이페이지" />
            </Link>
            <div className="dropdown-content">
              <Link to="/result">투표 결과 모아보기</Link>
            </div>
          </div>
        </nav>
      </div>
      <div className="header-glow" aria-hidden="true" />
    </header>
  );
};

export default Header;
