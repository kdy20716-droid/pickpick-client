import { createBrowserRouter } from "react-router-dom";
import Layout from "./components/Layout";
import MainPage from "./pages/MainPage";
import Login from "./pages/Login";
import Signin from "./pages/Signin";
import Findpass from "./pages/Findpass";
import Ranking from "./pages/Ranking";
import Result from "./pages/Result";
import Create from "./pages/Create";
import VotePage from "./pages/VotePage";
import MyPage from "./pages/MyPage";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <MainPage /> },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/signin",
        element: <Signin />,
      },
      {
        path: "/findpass",
        element: <Findpass />,
      },
      {
        path: "/ranking",
        element: <Ranking />,
      },
      {
        path: "/result",
        element: <Result />,
      },
      {
        path: "/create",
        element: <Create />,
      },
      {
        path: "/vote",
        element: <VotePage />,
      },
      {
        path: "/admin/manage",
        element: <Admin />,
      },
      {
        path: "/mypage",
        element: <MyPage />,
        children: [
          { index: true, element: <Profile /> },
          {
            path: "history",
            element: <Result />,
          },
          {
            path: "like",
            element: (
              <div style={{ padding: "40px" }}>LIKE PAGE (COMING SOON)</div>
            ),
          },
          {
            path: "mypoll",
            element: (
              <div style={{ padding: "40px" }}>MY POLL PAGE (COMING SOON)</div>
            ),
          },
          {
            path: "contact",
            element: (
              <div style={{ padding: "40px" }}>CONTACT PAGE (COMING SOON)</div>
            ),
          },
        ],
      },
    ],
  },
]);

export default router;
