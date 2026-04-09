import "./Header.css";
import accountIcon from "../assets/account-icon.svg";

const Header = () => {
  return (
    <header className="site-header">
      <div className="header-inner">
        <a href="#" className="brand">
          PICKPICK
        </a>
        <nav className="site-nav" aria-label="주요 메뉴">
          <a href="#">+ CREATE</a>
          <a href="#">RANKING</a>
          <a href="#">LOG IN</a>
          <a href="#" className="account-link" aria-label="계정">
            <img src={accountIcon} alt="" />
          </a>
        </nav>
      </div>
      <div className="header-glow" aria-hidden="true" />
    </header>
  );
};

export default Header;
