import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addVote } from "../api/posts.js";
import "./RecipeAddModal.css";

const RecipeAddModal = ({ onClose }) => {
  // 입력창에 들어가는 값들은 state로 관리
  const [title, setTitle] = useState("");
  const [candidateA, setCandidateA] = useState("");
  const [candidateB, setCandidateB] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    await addVote(1, "기타", title, candidateA, null, candidateB, null);
    navigate("/vote");
  };
  return (
    <div className="modal-background" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>투표 추가</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            className="input"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="투표 제목 입력"
          />
          <input
            className="input"
            type="text"
            value={candidateA}
            onChange={(event) => setCandidateA(event.target.value)}
            placeholder="후보 A 이름 입력"
          />
          <input
            className="input"
            type="text"
            value={candidateB}
            onChange={(event) => setCandidateB(event.target.value)}
            placeholder="후보 B 이름 입력"
          />
          <button className="btn">추가하기</button>
        </form>
      </div>
    </div>
  );
};
export default RecipeAddModal;
