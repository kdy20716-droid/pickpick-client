import { createBrowserRouter } from "react-router-dom";
import RecipeAddPage from "./pages/RecipeAddPage";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import MainPage from "./pages/MainPage";
import SignupPage from "./pages/SignupPage";
import RecipeDetailPage from "./pages/RecipeDetailPage";
import MyPage from "./pages/MyPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <MainPage /> },
      {
        path: "/add",
        element: <RecipeAddPage />,
      },
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/signup",
        element: <SignupPage />,
      },
      {
        path: "/mypage",
        element: <MyPage />,
      },
      {
        path: "/recipes/:id",
        element: <RecipeDetailPage />,
      },
    ],
  },
]);

export default router;
