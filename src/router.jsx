import { createBrowserRouter } from "react-router-dom";
import Result from "./pages/Result";
import Layout from "./components/Layout";
import MainPage from "./pages/MainPage.jsx";
import Signin from "./pages/Signin.jsx";
import Findpass from "./pages/Findpass.jsx";
import Ranking from "./pages/Ranking.jsx";

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
        path: "/findpass",
        element: <Findpass />,
      },
      {
        path: "/ranking",
        element: <Ranking />,
      },
    ],
  },
]);

export default router;
