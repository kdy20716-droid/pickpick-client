import { Outlet } from "react-router-dom";
import Header from "./Header";

const Layout = () => {
  return (
    <div>
      {/* 상단 메뉴바 (Header) */}
      <Header />

      {/* 하단 페이지 내용 (MainPage, LoginPage 등이 여기에 렌더링됨) */}
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
