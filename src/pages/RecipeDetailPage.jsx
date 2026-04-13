import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getRecipeById,
  getComments,
  addComment,
  toggleLike,
  deleteComment,
} from "../api/recipes";

const RecipeDetailPage = () => {
  const { id } = useParams(); // URL 주소에 있는 id 값을 가져옵니다.
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]); // 댓글 목록 상태
  const [newComment, setNewComment] = useState(""); // 새 댓글 입력 상태
  const [showComments, setShowComments] = useState(false); // 오른쪽 댓글창 표시 여부
  const [windowWidth, setWindowWidth] = useState(window.innerWidth); // 현재 브라우저 창 너비 상태
  const [likeCount, setLikeCount] = useState(0); // 좋아요 수 상태
  const savedUser = localStorage.getItem("user");
  const user = savedUser ? JSON.parse(savedUser) : null;

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const data = await getRecipeById(id);
        setRecipe(data);
        setLikeCount(data.like_count || 0); // 서버에서 받은 좋아요 수 저장

        // 레시피 정보와 함께 댓글 목록도 불러옵니다.
        const commentsData = await getComments(id);
        setComments(commentsData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipe();
  }, [id]);

  // 브라우저 창 크기가 변할 때마다 windowWidth 상태를 업데이트합니다.
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 댓글 등록 처리 함수
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("로그인이 필요한 기능입니다.");
      navigate("/login");
      return;
    }
    if (newComment.trim() === "") return; // 빈 칸은 등록 무시

    try {
      const response = await addComment(id, {
        user_id: user.id,
        content: newComment,
      });
      if (response.ok) {
        setNewComment(""); // 입력창 비우기
        const commentsData = await getComments(id); // 댓글 목록 새로고침
        setComments(commentsData);
      } else {
        alert(
          "댓글 등록에 실패했습니다. DB 테이블이 생성되었는지 확인해주세요!",
        );
      }
    } catch (error) {
      console.error(error);
      alert("댓글 등록 중 서버 통신 오류가 발생했습니다.");
    }
  };

  // 좋아요 처리 함수
  const handleLike = async () => {
    if (!user) {
      alert("로그인이 필요한 기능입니다.");
      navigate("/login");
      return;
    }
    try {
      const response = await toggleLike(id, user.id);
      const data = await response.json();
      if (response.ok) {
        // 서버에서 알려준 상태(isLiked)에 따라 카운트를 올리거나 내립니다.
        if (data.isLiked) {
          setLikeCount((prev) => prev + 1);
        } else {
          setLikeCount((prev) => prev - 1);
        }
      }
    } catch (error) {
      console.error(error);
      alert("좋아요 처리 중 오류가 발생했습니다.");
    }
  };

  // 댓글 삭제 처리 함수
  const handleDeleteComment = async (commentId) => {
    if (window.confirm("댓글을 삭제하시겠습니까?")) {
      try {
        const response = await deleteComment(id, commentId, user.id);
        if (response.ok) {
          // 삭제 성공 시 화면의 댓글 목록에서도 즉시 제거
          setComments(comments.filter((comment) => comment.id !== commentId));
        } else {
          const data = await response.json();
          alert(`삭제 실패: ${data.message}`);
        }
      } catch (error) {
        console.error(error);
        alert("서버 통신 중 오류가 발생했습니다.");
      }
    }
  };

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>로딩 중...</div>
    );
  if (!recipe)
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        레시피 정보를 찾을 수 없습니다.
      </div>
    );

  // 쇼츠 스타일의 동그란 액션 버튼 스타일
  const actionBtnStyle = {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    border: "none",
    backgroundColor: "#f0f0f0",
    cursor: "pointer",
    fontSize: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    transition: "background-color 0.2s",
  };

  const isCompact = windowWidth < 950; // 창 너비가 950px 미만일 경우 모달창 모드로 전환

  // 댓글창 UI를 따로 분리하여 패널(옆면)과 모달(팝업)에서 재사용합니다.
  const commentsUI = (
    <div
      style={{
        width: "350px",
        height: "600px", // 레시피 카드와 높이를 동일하게 맞춤
        backgroundColor: "#fff",
        borderRadius: "12px",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "20px",
          borderBottom: "1px solid #eee",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#f9f9f9",
        }}
      >
        <h3 style={{ margin: 0, fontSize: "18px", color: "#333" }}>
          댓글 ({comments.length})
        </h3>
        {/* X 버튼을 눌러서 댓글창 닫기 */}
        <button
          onClick={() => setShowComments(false)}
          style={{
            border: "none",
            background: "none",
            cursor: "pointer",
            fontSize: "18px",
            fontWeight: "bold",
            color: "#888",
          }}
        >
          X
        </button>
      </div>

      {/* 댓글 목록 리스트 */}
      <ul
        style={{
          listStyle: "none",
          padding: "20px",
          margin: 0,
          flex: 1,
          overflowY: "auto",
        }}
      >
        {comments.map((comment) => (
          <li
            key={comment.id}
            style={{
              marginBottom: "15px",
              paddingBottom: "15px",
              borderBottom: "1px solid #eee",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "5px",
              }}
            >
              <div style={{ fontWeight: "bold", color: "#333" }}>
                {comment.user_name}
                <span
                  style={{
                    fontSize: "12px",
                    color: "#999",
                    fontWeight: "normal",
                    marginLeft: "10px",
                  }}
                >
                  {new Date(comment.created_at).toLocaleString()}
                </span>
              </div>
              {/* 현재 로그인한 사용자가 작성한 댓글에만 삭제 버튼 표시 */}
              {user && user.id === comment.user_id && (
                <button
                  onClick={() => handleDeleteComment(comment.id)}
                  style={{
                    border: "none",
                    background: "none",
                    color: "#dc3545",
                    cursor: "pointer",
                    fontWeight: "bold",
                    padding: "0 5px",
                  }}
                >
                  X
                </button>
              )}
            </div>
            <div
              style={{
                color: "#555",
                fontSize: "15px",
                whiteSpace: "pre-wrap",
              }}
            >
              {comment.content}
            </div>
          </li>
        ))}
      </ul>

      {/* 댓글 작성 폼 (하단 고정) */}
      <div
        style={{
          padding: "20px",
          borderTop: "1px solid #eee",
          backgroundColor: "#f9f9f9",
        }}
      >
        <form
          onSubmit={handleCommentSubmit}
          style={{ display: "flex", gap: "10px" }}
        >
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={user ? "댓글 추가..." : "로그인 후 작성 가능합니다."}
            disabled={!user}
            style={{
              flex: 1,
              padding: "12px",
              border: "1px solid #ccc",
              borderRadius: "20px",
              fontSize: "14px",
            }}
          />
          <button
            type="submit"
            disabled={!user}
            style={{
              padding: "0 15px",
              backgroundColor: user ? "#007bff" : "#ccc",
              color: "white",
              border: "none",
              borderRadius: "20px",
              cursor: user ? "pointer" : "not-allowed",
              fontWeight: "bold",
              whiteSpace: "nowrap",
            }}
          >
            등록
          </button>
        </form>
      </div>
    </div>
  );

  return (
    // minWidth를 부여하여 창을 줄여도 콘텐츠가 찌그러지지 않게 방지합니다.
    <div
      style={{
        position: "relative",
        minWidth: "850px",
        maxWidth: "1000px",
        margin: "0 auto",
        padding: "20px", // 불필요한 상단 여백을 제거하여 카드를 위로 바짝 올립니다.
      }}
    >
      {/* 뒤로 가기 버튼을 절대 위치로 빼서 콘텐츠 높이에 영향을 주지 않게 합니다. */}
      <button
        onClick={() => navigate(-1)} // 이전 페이지로 돌아갑니다.
        style={{
          position: "absolute",
          top: "-18px", // 카드 시작 위치와 높이를 맞춥니다.
          left: "20px",
          padding: "10px 20px",
          cursor: "pointer",
          border: "1px solid #ccc",
          borderRadius: "5px",
          backgroundColor: "#fff",
          fontWeight: "bold",
        }}
      >
        &larr; 뒤로 가기
      </button>

      <div
        style={{
          display: "flex",
          gap: "20px",
          justifyContent: "center",
          alignItems: "flex-end", // 쇼츠처럼 버튼을 아래쪽으로 정렬
        }}
      >
        {/* 1. 레시피 컨텐츠 영역 (칵테일 카드) */}
        <div
          style={{
            width: "450px", // 고정 크기
            height: "600px", // 세로 길이를 너무 길지 않게 줄임
            backgroundColor: "#fff",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {recipe.image && (
            <img
              src={recipe.image}
              alt={recipe.name}
              style={{
                width: "100%",
                height: "300px", // 카드 전체 높이에 맞춰 이미지 높이도 조절
                objectFit: "cover",
                display: "block",
              }}
            />
          )}
          <div style={{ padding: "30px", overflowY: "auto", flex: 1 }}>
            <h2
              style={{
                margin: "0 0 10px 0",
                fontSize: "32px",
                color: "#333",
              }}
            >
              {recipe.name}
            </h2>
            <p
              style={{
                color: "#888",
                fontSize: "14px",
                marginBottom: "20px",
              }}
            >
              작성자: {recipe.author_name || "알 수 없음"}
            </p>
            <div
              style={{
                fontSize: "18px",
                lineHeight: "1.6",
                color: "#444",
                whiteSpace: "pre-wrap",
              }}
            >
              {recipe.description}
            </div>
          </div>
        </div>

        {/* 2. 액션 버튼 5개 (레시피 옆) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px",
            paddingBottom: "10px",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <button style={actionBtnStyle} onClick={handleLike}>
              👍
            </button>
            <span
              style={{
                fontSize: "12px",
                fontWeight: "bold",
                marginTop: "5px",
                display: "block",
              }}
            >
              {likeCount}
            </span>
          </div>
          <div style={{ textAlign: "center" }}>
            <button
              style={actionBtnStyle}
              onClick={() => alert("준비 중인 기능입니다!")}
            >
              👎
            </button>
            <span
              style={{
                fontSize: "12px",
                fontWeight: "bold",
                marginTop: "5px",
                display: "block",
              }}
            >
              싫어요
            </span>
          </div>
          <div style={{ textAlign: "center" }}>
            {/* 댓글 버튼 클릭 시 오른쪽 패널 토글 */}
            <button
              onClick={() => setShowComments(!showComments)}
              style={{
                ...actionBtnStyle,
                backgroundColor: showComments ? "#ddd" : "#f0f0f0",
              }}
            >
              💬
            </button>
            <span
              style={{
                fontSize: "12px",
                fontWeight: "bold",
                marginTop: "5px",
                display: "block",
              }}
            >
              댓글
            </span>
          </div>
          <div style={{ textAlign: "center" }}>
            <button
              style={actionBtnStyle}
              onClick={() => alert("준비 중인 기능입니다!")}
            >
              🔖
            </button>
            <span
              style={{
                fontSize: "12px",
                fontWeight: "bold",
                marginTop: "5px",
                display: "block",
              }}
            >
              찜
            </span>
          </div>
          <div style={{ textAlign: "center" }}>
            <button
              style={actionBtnStyle}
              onClick={() => alert("준비 중인 기능입니다!")}
            >
              🔗
            </button>
            <span
              style={{
                fontSize: "12px",
                fontWeight: "bold",
                marginTop: "5px",
                display: "block",
              }}
            >
              공유
            </span>
          </div>
        </div>

        {/* 3. 토글되는 댓글창 패널 (우측) - 창이 넓을 때만 옆에 표시 */}
        {showComments && !isCompact && (
          <div style={{ paddingBottom: "10px" }}>{commentsUI}</div>
        )}
      </div>

      {/* 4. 모달(팝업) 형태의 댓글 패널 - 창을 줄였을 때(isCompact가 true) 작동 */}
      {showComments && isCompact && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            zIndex: 9999, // 화면 맨 위에 오도록 설정
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {commentsUI}
        </div>
      )}
    </div>
  );
};

export default RecipeDetailPage;
