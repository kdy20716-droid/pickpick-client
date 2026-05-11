import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "./Header";
import { useHeaderGlow } from "../hooks/useHeaderGlow";

const Layout = () => {
  const { scaleY, opacity } = useHeaderGlow();

  return (
    <div>
      {/* 화면 전체 배경으로 들어가는 빛 효과 (Header의 z-index에 갇히지 않음) */}
      <motion.div
        className="background-glow"
        aria-hidden="true"
        style={{ scaleY, opacity, transformOrigin: "top" }}
      />
      
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
