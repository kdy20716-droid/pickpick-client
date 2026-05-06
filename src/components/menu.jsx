import { Link, useNavigate } from "react-router-dom";

const Menu = () => {
  const navigate = useNavigate();
  
  const userStr = localStorage.getItem("user");
  const currentUser = userStr ? JSON.parse(userStr) : null;
  const isAdmin = currentUser?.role === 'admin';

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    alert("로그아웃 되었습니다.");
    navigate("/login");
  };

  return (
    <nav className="menu-nav">
      <Link to="/mypage/history">HISTORY</Link>
      <Link to="/mypage/like">LIKE</Link>
      <Link to="/mypage/mypoll">MY POLL</Link>
      <Link to="/mypage/contact">CONTACT</Link>
      <Link to="/mypage">MY PAGE</Link>
      {isAdmin && (
        <Link 
          to="/admin/manage"
          style={{
            color: "#ffa500",
            fontWeight: "bold",
            transition: "color 0.3s"
          }}
          onMouseOver={(e) => e.target.style.color = "#ff8c00"}
          onMouseOut={(e) => e.target.style.color = "#ffa500"}
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
          transition: "color 0.3s"
        }}
        onMouseOver={(e) => e.target.style.color = "#ff868a"}
        onMouseOut={(e) => e.target.style.color = "#ff9ea2"}
      >
        LOGOUT
      </a>
    </nav>
  );
};

export default Menu;
