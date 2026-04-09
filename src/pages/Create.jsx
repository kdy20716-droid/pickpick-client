import React, { useState } from "react";
import "./Create.css";

const Create = () => {
  const [selectedTag, setSelectedTag] = useState("영화 / 드라마");
  const [candidate1, setCandidate1] = useState("");
  const [candidate2, setCandidate2] = useState("");

  const tags = [
    "연예",
    "음식",
    "애니메이션",
    "동물",
    "스포츠",
    "일상",
    "게임",
    "음악",
    "영화 / 드라마",
    "웹툰 / 웹소설",
    "유튜버 / 스트리머",
    "밸런스 게임",
    "밈",
    "기타",
  ];

  return (
    <div className="create-page-container">
      <main className="main-content">
        {/* Left: Preview Area */}
        <section className="editor-card preview-section">
          <div className="title-input-wrapper">
            <input
              type="text"
              className="editor-card__title-input"
              placeholder="제목을 입력하세요"
            />
          </div>

          <div className="vs-container">
            <div className="candidate-box">
              <div className="candidate-box__upload">
                <span className="icon-placeholder">+</span>
              </div>
              <div className="candidate-box__label">
                {candidate1 || "후보군 이름"}
              </div>
            </div>

            <div className="vs-badge">
              <span className="vs-badge__text">VS</span>
            </div>

            <div className="candidate-box">
              <div className="candidate-box__upload">
                <span className="icon-placeholder">+</span>
              </div>
              <div className="candidate-box__label">
                {candidate2 || "후보군 이름"}
              </div>
            </div>
          </div>
        </section>

        {/* Right: Settings Area */}
        <section className="editor-card settings-section">
          <div className="settings-group">
            <h3 className="settings-group__title">후보군 이름</h3>
            <div className="settings-group__list">
              <div className="list-item">
                <span className="list-item__num">1</span>
                <input
                  type="text"
                  style={{
                    border: "none",
                    outline: "none",
                    fontSize: "15px",
                    color: "#333",
                    width: "100%",
                    background: "transparent",
                  }}
                  placeholder="이름을 입력하세요"
                  value={candidate1}
                  onChange={(e) => setCandidate1(e.target.value)}
                />
              </div>
              <div className="list-item">
                <span className="list-item__num">2</span>
                <input
                  type="text"
                  style={{
                    border: "none",
                    outline: "none",
                    fontSize: "15px",
                    color: "#333",
                    width: "100%",
                    background: "transparent",
                  }}
                  placeholder="이름을 입력하세요"
                  value={candidate2}
                  onChange={(e) => setCandidate2(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="settings-group">
            <h3 className="settings-group__title">TAG</h3>
            <div className="tag-cloud">
              {tags.map((tag) => (
                <button
                  key={tag}
                  className={`tag-button ${selectedTag === tag ? "tag-button--active" : ""}`}
                  onClick={() => setSelectedTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Floating Action Button */}
          <button className="fab-button">
            <span className="icon-placeholder">↑</span>
          </button>
        </section>
      </main>
    </div>
  );
};

export default Create;
