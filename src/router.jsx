import { createBrowserRouter } from "react-router-dom";

// ── 레이아웃 / 보호 라우트 ─────────────────────────────────────────
import Layout         from "./components/Layout";
import ProtectedRoute, { AdminRoute } from "./components/ProtectedRoute";

// ── 공개 페이지 ────────────────────────────────────────────────────
import MainPage from "./pages/MainPage";
import Login    from "./pages/auth/Login";
import Signin   from "./pages/auth/Signin";
import Findpass from "./pages/auth/Findpass";
import Ranking  from "./pages/Ranking";
import VotePage from "./pages/VotePage";

// ── 법적/정보성 페이지 ─────────────────────────────────────────────
import About   from "./pages/info/About";
import Privacy from "./pages/info/Privacy";
import Faq     from "./pages/info/Faq";
import Terms   from "./pages/info/Terms";

// ── 보호 페이지 (로그인 필요) ──────────────────────────────────────
import Create   from "./pages/Create";
import Admin    from "./pages/Admin";
import MyPage   from "./pages/mypage/MyPage";
import Profile  from "./pages/mypage/Profile";
import Default  from "./pages/mypage/Default";
import Like     from "./pages/mypage/Like";
import MyCreate from "./pages/mypage/MyCreate";
import Result   from "./pages/mypage/Result";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      // ── 공개 ──
      { index: true, element: <MainPage /> },
      { path: "login",   element: <Login /> },
      { path: "signin",  element: <Signin /> },
      { path: "findpass", element: <Findpass /> },
      { path: "ranking", element: <Ranking /> },
      { path: "vote",           element: <VotePage /> },
      { path: "vote/:postId",   element: <VotePage /> },
      { path: "post/:postId",   element: <VotePage /> },

      // ── 법적/정보성 ──
      { path: "about",   element: <About /> },
      { path: "privacy", element: <Privacy /> },
      { path: "terms",   element: <Terms /> },
      { path: "faq",     element: <Faq /> },

      // ── 로그인 필요 ──
      {
        path: "create",
        element: <ProtectedRoute><Create /></ProtectedRoute>,
      },
      {
        path: "admin",
        element: <AdminRoute><Admin /></AdminRoute>,
      },
      {
        path: "mypage",
        element: <ProtectedRoute><MyPage /></ProtectedRoute>,
        children: [
          { index: true,          element: <Profile /> },
          { path: "history",      element: <Result /> },
          { path: "like",         element: <Like /> },
          { path: "profileedit",  element: <Default /> },
          { path: "mypoll",       element: <MyCreate /> },
          { path: "faq",          element: <Faq /> },
        ],
      },
    ],
  },
]);

export default router;
