import { createBrowserRouter } from "react-router-dom";
import Result from "./pages/Result";
import Layout from "./components/Layout";
import MainPage from "./pages/MainPage";
import VotePage from "./pages/VotePage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true, 
        element: <MainPage/>
      },
      {
        path: "/result",
        element: <Result />,
      },
      {
        path: "/vote",
        element: <VotePage />,
      },
    ],
  },
]);

export default router;
