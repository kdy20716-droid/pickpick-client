import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { addVote } from "../api/posts";
import { Pencil, Trash2, Maximize, Minus, Plus } from "lucide-react";
import "./Create.css";

const Create = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");

  // localStorage에서 실제 로그인된 유저 정보 가져오기
  const userStr = localStorage.getItem("user");
  const currentUser = userStr ? JSON.parse(userStr) : null;
  const authorId = currentUser ? currentUser.id : null;

  const [selectedTag, setSelectedTag] = useState("영화 / 드라마");
  const [candidate1, setCandidate1] = useState("");
  const [candidate2, setCandidate2] = useState("");

  const [previewImage1, setPreviewImage1] = useState(null);
  const [previewImage2, setPreviewImage2] = useState(null);
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);

  const [zoom1, setZoom1] = useState(1);
  const [zoom2, setZoom2] = useState(1);
  const [showEdit1, setShowEdit1] = useState(false);
  const [showEdit2, setShowEdit2] = useState(false);

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

  const handleImageChange = (e, setPreview, setFile, setZoom) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      processFile(file, setPreview);
      setZoom(1); // Reset zoom on new image
    }
  };

  const handlePaste = (e, setPreview, setFile, setZoom) => {
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    for (const item of items) {
      if (item.kind === "file" && item.type.startsWith("image/")) {
        const file = item.getAsFile();
        setFile(file);
        processFile(file, setPreview);
        setZoom(1);
        break;
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, setPreview, setFile, setZoom) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        setFile(file);
        processFile(file, setPreview);
        setZoom(1);
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

  const handleRemoveImage = (setPreview, setFile, setZoom, setShowEdit) => {
    setPreview(null);
    setFile(null);
    setZoom(1);
    setShowEdit(false);
  };

  const handleSubmit = async () => {
    if (!title || !candidate1 || !candidate2) {
      alert("필수 항목을 모두 입력해주세요.");
      return;
    }

    if (!authorId) {
      alert("로그인이 필요합니다.");
      navigate("/login");
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
        navigate("/vote");
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
              onPaste={(e) =>
                handlePaste(e, setPreviewImage1, setFile1, setZoom1)
              }
              onDragOver={handleDragOver}
              onDrop={(e) =>
                handleDrop(e, setPreviewImage1, setFile1, setZoom1)
              }
              tabIndex="0"
            >
              <input
                type="file"
                ref={fileInputRef1}
                style={{ display: "none" }}
                accept="image/*"
                onChange={(e) =>
                  handleImageChange(e, setPreviewImage1, setFile1, setZoom1)
                }
              />
              {previewImage1 ? (
                <>
                  <div className="image-wrapper">
                    <img
                      src={previewImage1}
                      alt="Preview 1"
                      className="candidate-box__img"
                      style={{ transform: `scale(${zoom1})` }}
                    />
                  </div>
                  <button
                    className="image-edit-trigger"
                    onClick={() => setShowEdit1(!showEdit1)}
                  >
                    <Pencil size={18} />
                  </button>
                  {showEdit1 && (
                    <div className="image-edit-overlay">
                      <div className="edit-controls">
                        <button
                          onClick={() => fileInputRef1.current.click()}
                          title="이미지 교체"
                        >
                          <Maximize size={16} /> <span>교체</span>
                        </button>
                        <button
                          onClick={() =>
                            handleRemoveImage(
                              setPreviewImage1,
                              setFile1,
                              setZoom1,
                              setShowEdit1,
                            )
                          }
                          title="이미지 삭제"
                        >
                          <Trash2 size={16} /> <span>삭제</span>
                        </button>
                      </div>
                      <div className="zoom-control">
                        <Minus
                          size={14}
                          onClick={() => setZoom1(Math.max(0.5, zoom1 - 0.1))}
                        />
                        <input
                          type="range"
                          min="0.5"
                          max="3"
                          step="0.1"
                          value={zoom1}
                          onChange={(e) => setZoom1(parseFloat(e.target.value))}
                        />
                        <Plus
                          size={14}
                          onClick={() => setZoom1(Math.min(3, zoom1 + 0.1))}
                        />
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="candidate-box__upload">
                  <button
                    className="upload-button"
                    onClick={() => fileInputRef1.current.click()}
                  >
                    이미지 삽입
                  </button>
                  <h5>붙여넣기 및 드래그 앤 드롭 지원</h5>
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
              onPaste={(e) =>
                handlePaste(e, setPreviewImage2, setFile2, setZoom2)
              }
              onDragOver={handleDragOver}
              onDrop={(e) =>
                handleDrop(e, setPreviewImage2, setFile2, setZoom2)
              }
              tabIndex="0"
            >
              <input
                type="file"
                ref={fileInputRef2}
                style={{ display: "none" }}
                accept="image/*"
                onChange={(e) =>
                  handleImageChange(e, setPreviewImage2, setFile2, setZoom2)
                }
              />
              {previewImage2 ? (
                <>
                  <div className="image-wrapper">
                    <img
                      src={previewImage2}
                      alt="Preview 2"
                      className="candidate-box__img"
                      style={{ transform: `scale(${zoom2})` }}
                    />
                  </div>
                  <button
                    className="image-edit-trigger"
                    onClick={() => setShowEdit2(!showEdit2)}
                  >
                    <Pencil size={18} />
                  </button>
                  {showEdit2 && (
                    <div className="image-edit-overlay">
                      <div className="edit-controls">
                        <button
                          onClick={() => fileInputRef2.current.click()}
                          title="이미지 교체"
                        >
                          <Maximize size={16} /> <span>교체</span>
                        </button>
                        <button
                          onClick={() =>
                            handleRemoveImage(
                              setPreviewImage2,
                              setFile2,
                              setZoom2,
                              setShowEdit2,
                            )
                          }
                          title="이미지 삭제"
                        >
                          <Trash2 size={16} /> <span>삭제</span>
                        </button>
                      </div>
                      <div className="zoom-control">
                        <Minus
                          size={14}
                          onClick={() => setZoom2(Math.max(0.5, zoom2 - 0.1))}
                        />
                        <input
                          type="range"
                          min="0.5"
                          max="3"
                          step="0.1"
                          value={zoom2}
                          onChange={(e) => setZoom2(parseFloat(e.target.value))}
                        />
                        <Plus
                          size={14}
                          onClick={() => setZoom2(Math.min(3, zoom2 + 0.1))}
                        />
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="candidate-box__upload">
                  <button
                    className="upload-button"
                    onClick={() => fileInputRef2.current.click()}
                  >
                    이미지 삽입
                  </button>
                  <h5>붙여넣기 및 드래그 앤 드롭 지원</h5>
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
