import { Outlet } from "react-router-dom";
import Header from "./Header";

const Layout = () => {
  return (
    <div className="page-shell">
      <Header />
      <main className="page-content">
        {/* Outlet 자리에 현재 경로에 element 페이지 컴포넌트가 들어감 */}
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
