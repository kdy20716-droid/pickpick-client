import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addRecipe } from "../api/recipes.js";
import "./RecipeAddModal.css";

const RecipeAddModal = ({ onClose }) => {
  // 입력창에 들어가는 값들은 state로 관리
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    // 레시피 추가 기능
    await addRecipe(name, image, description);
    navigate("/");
  };
  return (
    <div className="modal-background" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>레시피 추가</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            className="input"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="레시피 이름 입력"
          />
          <input
            className="input"
            type="text"
            value={image}
            onChange={(event) => setImage(event.target.value)}
            placeholder="레시피 이미지 URL 입력"
          />
          <input
            className="input"
            type="text"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="레시피 설명 입력"
          />
          <button className="btn">추가하기</button>
        </form>
      </div>
    </div>
  );
};
export default RecipeAddModal;
