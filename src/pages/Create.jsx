import React, { useState, useRef } from "react";
import "./Create.css";

const Create = () => {
  const [selectedTag, setSelectedTag] = useState("영화 / 드라마");
  const [candidate1, setCandidate1] = useState("");
  const [candidate2, setCandidate2] = useState("");

  const [previewImage1, setPreviewImage1] = useState(null);
  const [previewImage2, setPreviewImage2] = useState(null);

  const fileInputRef1 = useRef(null);
  const fileInputRef2 = useRef(null);

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

  // 파일 선택 핸들러
  const handleImageChange = (e, setPreview) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file, setPreview);
    }
  };

  // 붙여넣기 핸들러
  const handlePaste = (e, setPreview) => {
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    for (const item of items) {
      if (item.kind === "file" && item.type.startsWith("image/")) {
        const file = item.getAsFile();
        processFile(file, setPreview);
        break;
      }
    }
  };

  // 파일을 읽어서 미리보기 세팅하는 공통 함수
  const processFile = (file, setPreview) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="create-page-container">
      <main className="main-content">
        <section className="editor-card preview-section">
          <input
            type="text"
            className="editor-card__title-input"
            placeholder="제목을 입력하세요"
          />

          <div className="vs-container">
            {/* 후보군 1 */}
            <div
              className="candidate-box"
              onPaste={(e) => handlePaste(e, setPreviewImage1)}
              tabIndex="0"
            >
              <input
                type="file"
                ref={fileInputRef1}
                style={{ display: "none" }}
                accept="image/*"
                onChange={(e) => handleImageChange(e, setPreviewImage1)}
              />
              {previewImage1 ? (
                <img
                  src={previewImage1}
                  alt="Preview 1"
                  className="candidate-box__img"
                />
              ) : (
                <div className="candidate-box__upload">
                  <button
                    className="upload-button"
                    onClick={() => fileInputRef1.current.click()}
                  >
                    이미지 삽입
                  </button>
                  <h5>웹이미지 붙여넣기 기능을 지원합니다</h5>
                </div>
              )}
              <div className="candidate-box__label">
                {candidate1 || "후보군 이름"}
              </div>
            </div>

            <div className="vs-badge">
              <span className="vs-badge__text">VS</span>
            </div>

            {/* 후보군 2 */}
            <div
              className="candidate-box"
              onPaste={(e) => handlePaste(e, setPreviewImage2)}
              tabIndex="0"
            >
              <input
                type="file"
                ref={fileInputRef2}
                style={{ display: "none" }}
                accept="image/*"
                onChange={(e) => handleImageChange(e, setPreviewImage2)}
              />
              {previewImage2 ? (
                <img
                  src={previewImage2}
                  alt="Preview 2"
                  className="candidate-box__img"
                />
              ) : (
                <div className="candidate-box__upload">
                  <button
                    className="upload-button"
                    onClick={() => fileInputRef2.current.click()}
                  >
                    이미지 삽입
                  </button>
                  <h5>웹이미지 붙여넣기 기능을 지원합니다</h5>
                </div>
              )}
              <div className="candidate-box__label">
                {candidate2 || "후보군 이름"}
              </div>
            </div>
          </div>
        </section>

        <section className="editor-card settings-section">
          <div className="settings-group">
            <h3 className="settings-group__title">후보군 이름</h3>
            <div className="settings-group__list">
              <div className="list-item">
                <span className="list-item__num">1</span>
                <input
                  type="text"
                  className="candidate-name-input"
                  placeholder="이름을 입력하세요"
                  value={candidate1}
                  onChange={(e) => setCandidate1(e.target.value)}
                />
              </div>
              <div className="list-item">
                <span className="list-item__num">2</span>
                <input
                  type="text"
                  className="candidate-name-input"
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

          <button className="fab-button">
            <span>Publish</span>
          </button>
        </section>
      </main>
    </div>
  );
};

export default Create;
