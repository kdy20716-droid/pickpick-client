import { createBrowserRouter } from "react-router-dom";
import Result from "./pages/Result";
import Layout from "./components/Layout";

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
