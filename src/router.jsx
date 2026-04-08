import { createBrowserRouter } from "react-router-dom";
import Result from "./pages/Result";
import Layout from "./components/Layout";
import Signin from "./pages/Signin.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <main />,
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
        path: "/",
        element: <findpass />,
      },
    ],
  },
]);

export default router;
