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
  const [mediaType1, setMediaType1] = useState("image"); // 'image', 'youtube'
  const [mediaType2, setMediaType2] = useState("image");
  const [youtubeUrl1, setYoutubeUrl1] = useState("");
  const [youtubeUrl2, setYoutubeUrl2] = useState("");

  useEffect(() => {
    if (isEditing) {
      setTitle(editData.title);
      setSelectedTag(editData.category || "기타");
      setCandidate1(editData.candidate_a_name);
      setCandidate2(editData.candidate_b_name);
      setPreviewImage1(editData.candidate_a_image);
      setPreviewImage2(editData.candidate_b_image);
      const type1 = editData.candidate_a_type || "image";
      const type2 = editData.candidate_b_type || "image";
      setMediaType1(type1 === "video" || type1 === "audio" ? "youtube" : type1);
      setMediaType2(type2 === "video" || type2 === "audio" ? "youtube" : type2);
      if (type1 === "youtube") setYoutubeUrl1(editData.candidate_a_image);
      if (type2 === "youtube") setYoutubeUrl2(editData.candidate_b_image);
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

  const getYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleFileChange = (e, setPreview, setFile, setZoom, setMediaType) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      setMediaType("image");
      processFile(file, setPreview);
      setZoom(1);
    }
  };

  const handlePaste = (e, setPreview, setFile, setZoom, setMediaType) => {
    const text = e.clipboardData.getData("text");
    const youtubeId = getYouTubeId(text);

    if (youtubeId) {
      setMediaType("youtube");
      setPreview(`https://img.youtube.com/vi/${youtubeId}/0.jpg`);
      setFile(null);
      if (setPreview === setPreviewImage1) setYoutubeUrl1(youtubeId);
      else setYoutubeUrl2(youtubeId);
      setZoom(1);
      return;
    }

    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    for (const item of items) {
      if (item.kind === "file") {
        const file = item.getAsFile();
        setFile(file);
        setMediaType("image");
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
      setFile(file);
      setMediaType("image");
      processFile(file, setPreview);
      setZoom(1);
    }
  };

  const handleYoutubeInput = (url, setPreview, setFile, setZoom, setMediaType, setYoutubeUrl) => {
    const youtubeId = getYouTubeId(url);
    if (youtubeId) {
      setMediaType("youtube");
      setPreview(`https://img.youtube.com/vi/${youtubeId}/0.jpg`);
      setFile(null);
      setYoutubeUrl(youtubeId);
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

  const handleRemoveFile = (setPreview, setFile, setZoom, setShowEdit, setMediaType, setYoutubeUrl) => {
    setPreview(null);
    setFile(null);
    setZoom(1);
    setMediaType("image");
    setYoutubeUrl("");
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
      const f1 = mediaType1 === "youtube" ? youtubeUrl1 : file1;
      const f2 = mediaType2 === "youtube" ? youtubeUrl2 : file2;

      if (isEditing) {
        await updateVote(
          editData.id,
          authorId,
          selectedTag,
          title,
          candidate1,
          f1,
          candidate2,
          f2,
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
          f1,
          candidate2,
          f2,
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
                accept="image/*"
                onChange={(e) =>
                  handleFileChange(e, setPreviewImage1, setFile1, setZoom1, setMediaType1)
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
                    {mediaType1 === "youtube" && (
                      <div className="youtube-badge">YouTube</div>
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
                          title="이미지 교체"
                        >
                          <Maximize size={16} /> <span>이미지</span>
                        </button>
                        <button
                          onClick={() =>
                            handleRemoveFile(
                              setPreviewImage1,
                              setFile1,
                              setZoom1,
                              setShowEdit1,
                              setMediaType1,
                              setYoutubeUrl1
                            )
                          }
                          title="삭제"
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
                  <div className="upload-buttons">
                    <button
                      className="upload-button"
                      onClick={() => fileInputRef1.current.click()}
                    >
                      이미지 삽입
                    </button>
                  </div>
                  <div className="youtube-input-group">
                    <input 
                      type="text" 
                      placeholder="유튜브 링크 붙여넣기"
                      onChange={(e) => handleYoutubeInput(e.target.value, setPreviewImage1, setFile1, setZoom1, setMediaType1, setYoutubeUrl1)}
                      className="youtube-url-input"
                    />
                  </div>
                  <p style={{ fontSize: "11px", color: "#f589b4", marginTop: "8px", textAlign: "center" }}>
                    * 이미지 드래그/붙여넣기 지원<br/>
                    * 유튜브 링크 입력 시 영상 자동 연결
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
                accept="image/*"
                onChange={(e) =>
                  handleFileChange(e, setPreviewImage2, setFile2, setZoom2, setMediaType2)
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
                    {mediaType2 === "youtube" && (
                      <div className="youtube-badge">YouTube</div>
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
                          title="이미지 교체"
                        >
                          <Maximize size={16} /> <span>이미지</span>
                        </button>
                        <button
                          onClick={() =>
                            handleRemoveFile(
                              setPreviewImage2,
                              setFile2,
                              setZoom2,
                              setShowEdit2,
                              setMediaType2,
                              setYoutubeUrl2
                            )
                          }
                          title="삭제"
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
                  <div className="upload-buttons">
                    <button
                      className="upload-button"
                      onClick={() => fileInputRef2.current.click()}
                    >
                      이미지 삽입
                    </button>
                  </div>
                  <div className="youtube-input-group">
                    <input 
                      type="text" 
                      placeholder="유튜브 링크 붙여넣기"
                      onChange={(e) => handleYoutubeInput(e.target.value, setPreviewImage2, setFile2, setZoom2, setMediaType2, setYoutubeUrl2)}
                      className="youtube-url-input"
                    />
                  </div>
                  <p style={{ fontSize: "11px", color: "#f589b4", marginTop: "8px", textAlign: "center" }}>
                    * 이미지 드래그/붙여넣기 지원<br/>
                    * 유튜브 링크 입력 시 영상 자동 연결
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
