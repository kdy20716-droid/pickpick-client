import { Link, Outlet } from "react-router-dom";

const Layout = () => {
  // 1. localStorage에서 로그인한 사용자 정보를 확인합니다.
  const savedUser = localStorage.getItem("user");
  const user = savedUser ? JSON.parse(savedUser) : null;

  // 2. 로그아웃 처리 함수
  const handleLogout = () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      localStorage.removeItem("user"); // 브라우저에서 사용자 정보 삭제
      alert("로그아웃 되었습니다.");
      window.location.href = "/"; // 메인 페이지로 이동하면서 새로고침
    }
  };

  return (
    <div>
      {/* 상단 메뉴바 (Header) */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "15px 30px",
          borderBottom: "1px solid #e1e4e8",
          marginBottom: "20px",
        }}
      >
        <h1 style={{ margin: 0 }}>
          <Link to="/" style={{ textDecoration: "none", color: "#333" }}>
            🍸 칵테일 레시피
          </Link>
        </h1>

        <nav style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <Link
            to="/add"
            style={{
              textDecoration: "none",
              color: "#007bff",
              fontWeight: "bold",
            }}
          >
            레시피 추가
          </Link>

          {/* 3. user 정보가 있으면(로그인됨) 마이페이지/로그아웃, 없으면 로그인/회원가입 표시 */}
          {user ? (
            <>
              <Link
                to="/mypage"
                style={{
                  textDecoration: "none",
                  color: "#333",
                  fontWeight: "bold",
                }}
              >
                마이페이지
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  background: "none",
                  border: "none",
                  color: "#dc3545",
                  cursor: "pointer",
                  fontSize: "16px",
                  padding: 0,
                  fontWeight: "bold",
                }}
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                style={{
                  textDecoration: "none",
                  color: "#333",
                  fontWeight: "bold",
                }}
              >
                로그인
              </Link>
              <Link
                to="/signup"
                style={{
                  textDecoration: "none",
                  color: "#333",
                  fontWeight: "bold",
                }}
              >
                회원가입
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* 하단 페이지 내용 (MainPage, LoginPage 등이 여기에 렌더링됨) */}
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
