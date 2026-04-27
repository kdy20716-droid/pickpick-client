import React, { useState, useRef } from "react";
import { addVote } from "../api/posts";
import "./Create.css";

const Create = () => {
  const [title, setTitle] = useState("");
  const [authorId, setAuthorId] = useState("1"); // 임시 작성자 ID
  const [selectedTag, setSelectedTag] = useState("영화 / 드라마");
  const [candidate1, setCandidate1] = useState("");
  const [candidate2, setCandidate2] = useState("");

  const [previewImage1, setPreviewImage1] = useState(null);
  const [previewImage2, setPreviewImage2] = useState(null);
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);

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

  const handleImageChange = (e, setPreview, setFile) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      processFile(file, setPreview);
    }
  };

  const handlePaste = (e, setPreview, setFile) => {
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    for (const item of items) {
      if (item.kind === "file" && item.type.startsWith("image/")) {
        const file = item.getAsFile();
        setFile(file);
        processFile(file, setPreview);
        break;
      }
    }
  };

  const processFile = (file, setPreview) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // alert (추후 바꾸기)

  const handleSubmit = async () => {
    if (!title || !candidate1 || !candidate2) {
      alert("필수 항목을 모두 입력해주세요.");
      return;
    }

    try {
      const response = await addVote(
        authorId,
        selectedTag,
        title,
        candidate1,
        file1,
        candidate2,
        file2,
      );

      if (response.success) {
        alert("투표 게시글이 성공적으로 등록되었습니다!");
      }
    } catch (error) {
      console.error("등록 에러:", error);
      alert("등록에 실패했습니다.");
    }
  };

  return (
    <div className="create-page-container">
      <main className="main-content">
        <section className="editor-card preview-section">
          <input
            type="text"
            className="editor-card__title-input"
            placeholder="제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="vs-container">
            <div
              className="candidate-box"
              onPaste={(e) => handlePaste(e, setPreviewImage1, setFile1)}
              tabIndex="0"
            >
              <input
                type="file"
                ref={fileInputRef1}
                style={{ display: "none" }}
                accept="image/*"
                onChange={(e) =>
                  handleImageChange(e, setPreviewImage1, setFile1)
                }
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

            <div
              className="candidate-box"
              onPaste={(e) => handlePaste(e, setPreviewImage2, setFile2)}
              tabIndex="0"
            >
              <input
                type="file"
                ref={fileInputRef2}
                style={{ display: "none" }}
                accept="image/*"
                onChange={(e) =>
                  handleImageChange(e, setPreviewImage2, setFile2)
                }
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

          <button className="fab-button" onClick={handleSubmit}>
            <span>Publish</span>
          </button>
        </section>
      </main>
    </div>
  );
};

export default Create;
