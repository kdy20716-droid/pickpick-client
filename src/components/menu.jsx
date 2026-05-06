import { Link } from "react-router-dom";
const Menu = () => {
  return (
    <nav className="menu-nav">
      <Link to="/mypage/history">HISTORY</Link>
      <Link to="/mypage/like">LIKE</Link>
      <Link to="/mypage/mypoll">MY POLL</Link>
      <Link to="/mypage/contact">CONTACT</Link>
      <Link to="/mypage" className="active">
        MY PAGE
      </Link>
      <Link to="/mypage" className="active">
        LOGOUT
      </Link>
    </nav>
  );
};

export default Menu;
