import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getRecipesByUserId, deleteRecipe } from "../api/recipes";
import "./MainPage.css"; // 메인페이지와 동일한 스타일 재사용

const MyPage = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (!savedUser) {
      alert("로그인이 필요한 기능입니다.");
      navigate("/login");
      return;
    }
    const currentUser = JSON.parse(savedUser);
    setUser(currentUser);

    const fetchMyRecipes = async () => {
      try {
        const data = await getRecipesByUserId(currentUser.id);
        setRecipes(data);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    fetchMyRecipes();
  }, [navigate]);

  const handleDelete = async (id) => {
    if (window.confirm("정말로 이 레시피를 삭제하시겠습니까?")) {
      try {
        const response = await deleteRecipe(id, user.email);
        if (response.ok) {
          alert("삭제되었습니다.");
          setRecipes(recipes.filter((recipe) => recipe.id !== id));
        } else {
          const data = await response.json();
          alert(`삭제 실패: ${data.message}`);
        }
      } catch (error) {
        console.error("삭제 중 오류 발생:", error);
        alert("삭제 중 서버 통신 오류가 발생했습니다.");
      }
    }
  };

  return (
    <div className="main-container">
      {user && <h2 className="section-title">{user.name}님의 레시피</h2>}
      {loading && <p>레시피를 불러오는 중...</p>}
      {error && <p>레시피를 불러오는데 오류가 발생했습니다: {error.message}</p>}
      {!loading && !error && (
        <>
          {recipes.length === 0 ? (
            <p>작성한 레시피가 없습니다.</p>
          ) : (
            <ul className="recipe-list">
              {recipes.map((recipe) => (
                <li key={recipe.id} className="recipe-card">
                  {recipe.image && (
                    <img
                      src={recipe.image}
                      alt={recipe.name}
                      className="recipe-image"
                    />
                  )}
                  <div className="recipe-content">
                    <h4>{recipe.name}</h4>
                    <p>{recipe.description}</p>
                    <button
                      onClick={() => handleDelete(recipe.id)}
                      className="delete-button"
                    >
                      삭제
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
};

export default MyPage;
