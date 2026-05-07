import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Menu = () => {
  const navigate = useNavigate();
  const { logout, isAdmin } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      alert("로그아웃 되었습니다.");
      navigate("/login");
    } catch (error) {
      console.error("로그아웃 중 오류:", error);
    }
  };

  return (
    <nav className="menu-nav">
      <Link to="/mypage/history">HISTORY</Link>
      <Link to="/mypage/like">LIKE</Link>
      <Link to="/mypage/mypoll">MY CREATE</Link>
      <Link to="/mypage/contact">CONTACT</Link>
<<<<<<< HEAD
      <Link to="/mypage">MY PAGE</Link>
      {isAdmin && (
        <Link
          to="/admin/manage"
          style={{
            color: "#ffa500",
            fontWeight: "bold",
            transition: "color 0.3s",
          }}
          onMouseOver={(e) => (e.target.style.color = "#ff8c00")}
          onMouseOut={(e) => (e.target.style.color = "#ffa500")}
        >
          MANAGE
        </Link>
      )}
      <a
        onClick={(e) => {
          e.preventDefault();
          handleLogout();
        }}
        style={{
          cursor: "pointer",
          color: "#ff9ea2",
          transition: "color 0.3s",
        }}
        onMouseOver={(e) => (e.target.style.color = "#ff868a")}
        onMouseOut={(e) => (e.target.style.color = "#ff9ea2")}
      >
        LOGOUT
      </a>
=======
      <Link to="/mypage" className="active">
        MY PAGE
      </Link>
      <Link to="/mypage" className="active">
        LOGOUT
      </Link>
>>>>>>> origin/seoyoun
    </nav>
  );
};

export default Menu;
