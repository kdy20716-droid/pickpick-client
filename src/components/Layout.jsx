import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import LogInHeader from "./LogInHeader";

const Layout = () => {
  const location = useLocation();
  const token = localStorage.getItem("token");

  return (
    <div>
      {/* 상단 메뉴바 (Header) - 로그인 상태에 따라 변경 */}
      {token ? <LogInHeader /> : <Header />}

      {/* 하단 페이지 내용 (MainPage, LoginPage 등이 여기에 렌더링됨) */}
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
