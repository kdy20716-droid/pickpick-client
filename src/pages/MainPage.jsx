import React, { useState, useEffect } from "react";
import "./MainPage.css";

const MainPage = () => {
  const [posts, setPosts] = useState([]); // 투표 목록 데이터
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 임시 유저 ID (추후 로그인 기능 연동 시 변경)
  const userId = 1;

  // 1. 픽픽 서버에서 쇼츠 투표 피드 불러오기
  const fetchFeed = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/posts/feed?userId=${userId}`);
      if (!response.ok) throw new Error("투표 피드를 불러오는데 실패했습니다.");
      const data = await response.json();
      setPosts(data);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  // 2. 항목 투표하기
  const handleVote = async (postId, optionId) => {
    try {
      const response = await fetch(`/api/votes/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, optionId }),
      });
      const data = await response.json();
      if (data.success) {
        // 투표 성공 시 투표한 항목을 목록에서 제거 (다음 쇼츠로 넘어가듯)
        setPosts(posts.filter((post) => post.id !== postId));
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
      alert("투표 중 오류가 발생했습니다.");
    }
  };

  // 3. 스킵하기
  const handleSkip = async (postId) => {
    try {
      const response = await fetch(`/api/skip/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await response.json();
      if (data.success) {
        // 스킵 성공 시 화면에서 지우기
        setPosts(posts.filter((post) => post.id !== postId));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="main-container">
      <h2 className="section-title">픽픽(PickPick) 투표 🚀</h2>

      {loading && <p>투표 목록을 불러오는 중...</p>}
      {error && <p>오류가 발생했습니다: {error.message}</p>}
      {!loading && !error && posts.length === 0 && (
        <p>현재 참여할 수 있는 새로운 투표가 없습니다!</p>
      )}

      {!loading && !error && posts.length > 0 && (
        <div
          className="shorts-container"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "30px",
            alignItems: "center",
          }}
        >
          {posts.map((post) => (
            <div
              key={post.id}
              className="vote-card"
              style={{
                width: "100%",
                maxWidth: "450px",
                border: "1px solid #ddd",
                borderRadius: "12px",
                padding: "20px",
                background: "#fff",
                boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
              }}
            >
              <h3 style={{ margin: "0 0 10px 0" }}>
                {post.title || "무엇을 선택하시겠습니까?"}
              </h3>
              <p
                style={{
                  color: "#888",
                  fontSize: "14px",
                  marginBottom: "20px",
                }}
              >
                작성자: {post.author_name}
              </p>

              <div className="options" style={{ display: "flex", gap: "10px" }}>
                {post.options?.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleVote(post.id, option.id)}
                    style={{
                      flex: 1,
                      padding: "15px",
                      background: "#f9f9f9",
                      border: "1px solid #007bff",
                      borderRadius: "8px",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      transition: "0.2s",
                    }}
                  >
                    {option.image_url && (
                      <img
                        src={option.image_url}
                        alt="옵션"
                        style={{
                          width: "100%",
                          borderRadius: "4px",
                          marginBottom: "8px",
                          objectFit: "cover",
                        }}
                      />
                    )}
                    <strong
                      style={{
                        fontSize: "16px",
                        marginBottom: "5px",
                        color: "#333",
                      }}
                    >
                      {option.content}
                    </strong>
                    <span style={{ fontSize: "12px", color: "#666" }}>
                      👍 {option.vote_count}명 선택
                    </span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => handleSkip(post.id)}
                style={{
                  marginTop: "20px",
                  width: "100%",
                  padding: "12px",
                  background: "#eee",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  color: "#555",
                }}
              >
                건너뛰기 (스킵)
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MainPage;
