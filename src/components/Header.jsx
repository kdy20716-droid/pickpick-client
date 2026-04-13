import { Link } from "react-router-dom";
import "./Header.css";

const Header = () => {
  return (
    <>
      <header className="site-header">
        <div className="site-header__brand">
          <Link to="/" className="site-header__logo">
            칵테일 레시피
          </Link>
        </div>

        <nav className="site-header__nav">
          <Link className="site-header__link" to="/add">
            레시피 추가
          </Link>

          <Link className="site-header__link" to="/login">
            로그인
          </Link>

          <Link className="site-header__link" to="/signup">
            회원가입
          </Link>
        </nav>
      </header>
    </>
  );
};
export default Header;
