import { Link } from "react-router-dom";
import "./Header.css";

const Header = () => {
  return (
    <>
      <header className="navbar">
        <div className="nav-container">
          <Link to="/" className="logo" style={{ textDecoration: "none" }}>
            PICK PICK
          </Link>
          <nav className="nav-menu">
            <a href="index.html" className="active">
              홈
            </a>
            <a href="detail.html">투표하기</a>
            <a href="#">랭킹</a>
            <div className="dropdown">
              <a href="#">마이페이지</a>
              <div className="dropdown-content">
                <a href="Result.html">투표 결과 모아보기</a>
              </div>
            </div>
          </nav>
        </div>
      </header>
    </>
  );
};

export default Header;
