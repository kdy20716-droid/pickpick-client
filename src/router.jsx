import { createBrowserRouter } from "react-router-dom";
import Result from "./pages/Result";
import Layout from "./components/Layout";
import MainPage from "./pages/MainPage.jsx";
import Login from "./pages/Login.jsx";
import Signin from "./pages/Signin.jsx";
import Findpass from "./pages/Findpass.jsx";
import Ranking from "./pages/Ranking.jsx";
import MyPage from "./pages/MyPage.jsx";
import Create from "./pages/Create.jsx";
import VotePage from "./pages/VotePage.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <MainPage />,
      },
      {
        path: "/result",
        element: <Result />,
      },
      {
        path: "/signin",
        element: <Signin />,
      },
      {
        path: "/login",
        element: <Login />,
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
        path: "/mypage",
        element: <MyPage />,
      },
      {
        path: "/create",
        element: <Create />,
      },
      {
        path: "/vote",
        element: <VotePage />,
      },
    ],
  },
]);

export default router;
