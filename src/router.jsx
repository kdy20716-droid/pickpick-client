import { createBrowserRouter } from "react-router-dom";
import Result from "./pages/Result";
import Layout from "./components/Layout";
import MainPage from "./MainPage.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/result",
        element: <Result />,
      },
    ],
  },
]);

export default router;
