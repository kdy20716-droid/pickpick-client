import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { addVote, updateVote } from "../api/posts";
import { useAuth } from "../contexts/AuthContext";
import { Pencil, Trash2, Maximize, Minus, Plus } from "lucide-react";
import vsLogo from "../assets/vs-logo.svg";
import "./Create.css";

const Create = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: currentUser, token } = useAuth();
  const authorId = currentUser?.id || null;

  const editData = location.state?.editData || null;
  const isEditing = !!editData;

  useEffect(() => {
    if (!token) {
      alert("로그인이 필요한 페이지입니다.");
      navigate("/login");
    }
  }, [token, navigate]);

  const [title, setTitle] = useState("");
  const [selectedTag, setSelectedTag] = useState("영화 / 드라마");
  const [candidate1, setCandidate1] = useState("");
  const [candidate2, setCandidate2] = useState("");

  const [previewImage1, setPreviewImage1] = useState(null);
  const [previewImage2, setPreviewImage2] = useState(null);
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [mediaType1, setMediaType1] = useState("image"); // 'image', 'video', 'audio'
  const [mediaType2, setMediaType2] = useState("image");

  useEffect(() => {
    if (isEditing) {
      setTitle(editData.title);
      setSelectedTag(editData.category || "기타");
      setCandidate1(editData.candidate_a_name);
      setCandidate2(editData.candidate_b_name);
      setPreviewImage1(editData.candidate_a_image);
      setPreviewImage2(editData.candidate_b_image);
      setMediaType1(editData.candidate_a_type || "image");
      setMediaType2(editData.candidate_b_type || "image");
    }
  }, [isEditing, editData]);

  const [zoom1, setZoom1] = useState(1);
  const [zoom2, setZoom2] = useState(1);
  const [showEdit1, setShowEdit1] = useState(false);
  const [showEdit2, setShowEdit2] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasCandidateNames =
    candidate1.trim().length > 0 && candidate2.trim().length > 0;
  const isPublishDisabled = isSubmitting || !hasCandidateNames;

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

  const handleFileChange = (e, setPreview, setFile, setZoom, setMediaType) => {
    const file = e.target.files[0];
    if (file) {
      const type = file.type.split("/")[0];
      const finalType = type === "video" || type === "audio" ? type : "image";
      
      setFile(file);
      setMediaType(finalType);
      processFile(file, setPreview);
      setZoom(1);
    }
  };

  const handlePaste = (e, setPreview, setFile, setZoom, setMediaType) => {
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    for (const item of items) {
      if (item.kind === "file") {
        const file = item.getAsFile();
        const type = file.type.split("/")[0];
        const finalType = type === "video" || type === "audio" ? type : "image";

        setFile(file);
        setMediaType(finalType);
        processFile(file, setPreview);
        setZoom(1);
        break;
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, setPreview, setFile, setZoom, setMediaType) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const type = file.type.split("/")[0];
      const finalType = type === "video" || type === "audio" ? type : "image";

      setFile(file);
      setMediaType(finalType);
      processFile(file, setPreview);
      setZoom(1);
    }
  };

  const processFile = (file, setPreview) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = (setPreview, setFile, setZoom, setShowEdit, setMediaType) => {
    setPreview(null);
    setFile(null);
    setZoom(1);
    setMediaType("image");
    setShowEdit(false);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (!title.trim() || !candidate1.trim() || !candidate2.trim()) {
      alert("필수 항목을 모두 입력해주세요.");
      return;
    }

    if (!authorId) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditing) {
        await updateVote(
          editData.id,
          authorId,
          selectedTag,
          title,
          candidate1,
          file1,
          candidate2,
          file2,
          mediaType1,
          mediaType2
        );
        alert("투표 게시글이 성공적으로 수정되었습니다!");
      } else {
        await addVote(
          authorId,
          selectedTag,
          title,
          candidate1,
          file1,
          candidate2,
          file2,
          mediaType1,
          mediaType2
        );
        alert("투표 게시글이 성공적으로 등록되었습니다!");
      }

      navigate("/vote");
    } catch (error) {
      console.error("처리 에러:", error);
      alert(isEditing ? "수정에 실패했습니다." : "등록에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
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
                handlePaste(e, setPreviewImage1, setFile1, setZoom1, setMediaType1)
              }
              onDragOver={handleDragOver}
              onDrop={(e) =>
                handleDrop(e, setPreviewImage1, setFile1, setZoom1, setMediaType1)
              }
              tabIndex="0"
            >
              <input
                type="file"
                ref={fileInputRef1}
                style={{ display: "none" }}
                accept="image/*,video/*,audio/*"
                onChange={(e) =>
                  handleFileChange(e, setPreviewImage1, setFile1, setZoom1, setMediaType1)
                }
              />
              {previewImage1 ? (
                <>
                  <div className="image-wrapper">
                    {mediaType1 === "video" ? (
                      <video
                        src={previewImage1}
                        className="candidate-box__img"
                        autoPlay
                        loop
                        muted
                        playsInline
                        style={{ transform: `scale(${zoom1})`, objectFit: "cover" }}
                      />
                    ) : mediaType1 === "audio" ? (
                      <div className="audio-preview-placeholder">
                        <div className="audio-icon">🎵</div>
                        <span>음원 파일 업로드됨</span>
                        <audio src={previewImage1} controls className="audio-preview-player" />
                      </div>
                    ) : (
                      <img
                        src={previewImage1}
                        alt="Preview 1"
                        className="candidate-box__img"
                        style={{ transform: `scale(${zoom1})` }}
                      />
                    )}
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
                          title="교체"
                        >
                          <Maximize size={16} /> <span>교체</span>
                        </button>
                        <button
                          onClick={() =>
                            handleRemoveFile(
                              setPreviewImage1,
                              setFile1,
                              setZoom1,
                              setShowEdit1,
                              setMediaType1
                            )
                          }
                          title="삭제"
                        >
                          <Trash2 size={16} /> <span>삭제</span>
                        </button>
                      </div>
                      {mediaType1 === "image" || mediaType1 === "video" ? (
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
                      ) : null}
                    </div>
                  )}
                </>
              ) : (
                <div className="candidate-box__upload">
                  <button
                    className="upload-button"
                    onClick={() => fileInputRef1.current.click()}
                  >
                    미디어 삽입
                  </button>
                  <h5>이미지, 영상, 음원 지원</h5>
                  <p style={{ fontSize: "11px", color: "#f589b4", marginTop: "5px", textAlign: "center" }}>
                    * 복사/붙여넣기 시 GIF 애니메이션이<br/>정지될 수 있습니다.
                  </p>
                </div>
              )}
              <div className="candidate-box__label">
                {candidate1 || "후보군 이름"}
              </div>
            </div>

            <div className="vs-badge">
              <img src={vsLogo} alt="VS" />
            </div>

            <div
              className="candidate-box"
              onPaste={(e) =>
                handlePaste(e, setPreviewImage2, setFile2, setZoom2, setMediaType2)
              }
              onDragOver={handleDragOver}
              onDrop={(e) =>
                handleDrop(e, setPreviewImage2, setFile2, setZoom2, setMediaType2)
              }
              tabIndex="0"
            >
              <input
                type="file"
                ref={fileInputRef2}
                style={{ display: "none" }}
                accept="image/*,video/*,audio/*"
                onChange={(e) =>
                  handleFileChange(e, setPreviewImage2, setFile2, setZoom2, setMediaType2)
                }
              />
              {previewImage2 ? (
                <>
                  <div className="image-wrapper">
                    {mediaType2 === "video" ? (
                      <video
                        src={previewImage2}
                        className="candidate-box__img"
                        autoPlay
                        loop
                        muted
                        playsInline
                        style={{ transform: `scale(${zoom2})`, objectFit: "cover" }}
                      />
                    ) : mediaType2 === "audio" ? (
                      <div className="audio-preview-placeholder">
                        <div className="audio-icon">🎵</div>
                        <span>음원 파일 업로드됨</span>
                        <audio src={previewImage2} controls className="audio-preview-player" />
                      </div>
                    ) : (
                      <img
                        src={previewImage2}
                        alt="Preview 2"
                        className="candidate-box__img"
                        style={{ transform: `scale(${zoom2})` }}
                      />
                    )}
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
                          title="교체"
                        >
                          <Maximize size={16} /> <span>교체</span>
                        </button>
                        <button
                          onClick={() =>
                            handleRemoveFile(
                              setPreviewImage2,
                              setFile2,
                              setZoom2,
                              setShowEdit2,
                              setMediaType2
                            )
                          }
                          title="삭제"
                        >
                          <Trash2 size={16} /> <span>삭제</span>
                        </button>
                      </div>
                      {mediaType2 === "image" || mediaType2 === "video" ? (
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
                      ) : null}
                    </div>
                  )}
                </>
              ) : (
                <div className="candidate-box__upload">
                  <button
                    className="upload-button"
                    onClick={() => fileInputRef2.current.click()}
                  >
                    미디어 삽입
                  </button>
                  <h5>이미지, 영상, 음원 지원</h5>
                  <p style={{ fontSize: "11px", color: "#f589b4", marginTop: "5px", textAlign: "center" }}>
                    * 복사/붙여넣기 시 GIF 애니메이션이<br/>정지될 수 있습니다.
                  </p>
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

          <button
            className="fab-button"
            onClick={handleSubmit}
            disabled={isPublishDisabled}
          >
            <span>{isEditing ? "Update" : "Upload"}</span>
          </button>
        </section>
      </main>
    </div>
  );
};

export default Create;
