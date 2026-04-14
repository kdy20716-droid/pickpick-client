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
        path: "/mypage",
        element: <MyPage />,
      },
    ],
  },
]);

export default router;
