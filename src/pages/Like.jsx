import React, { useState, useEffect } from "react";
import "./Like.css";
import styles from "./MyPage.module.css";
import { getVote, toggleLike } from "../api/posts";

const Like = () => {
  const [likedVotes, setLikedVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");

  const userStr = localStorage.getItem("user");
  const currentUser = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    fetchLikedVotes();
  }, [searchKeyword, currentUser?.id]);

  const fetchLikedVotes = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const data = await getVote(searchKeyword, null, null, currentUser.id, null, true, null);
      setLikedVotes(data);
    } catch (error) {
      console.error("좋아요 목록을 불러오는데 실패했습니다.", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlike = async (postId) => {
    if (!currentUser) return;

    try {
      const res = await toggleLike(postId, currentUser.id);
      if (res.success) {
        // 성공적으로 취소되면 목록에서 해당 항목 제거
        setLikedVotes((prev) => prev.filter((vote) => vote.id !== postId));
      }
    } catch (error) {
      console.error("좋아요 취소 실패:", error);
      alert("좋아요 취소에 실패했습니다.");
    }
  };

  return (
    <div className="like-page-container">
      {/* 상단 검색바 영역 */}
      <div className={styles.topSearchRow}>
        <p className={styles.breadcrumb}>마이페이지 〉 좋아요한 투표</p>
        <div className={styles.searchBar}>
          <input 
            type="text" 
            placeholder="좋아요한 투표 검색" 
            className="like-search-input"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
          <span className={styles.searchIcon}>🔍</span>
        </div>
      </div>

      <div className="like-content">
        <p className="description-text">
          최근 좋아요한 항목부터 순서대로 표시됩니다.
        </p>

        {loading ? (
          <div className="like-list" style={{ textAlign: "center", color: "#bbb", padding: "60px" }}>
            데이터를 불러오는 중입니다...
          </div>
        ) : (
          <div className="like-list">
            {likedVotes.length > 0 ? (
              likedVotes.map((vote) => (
                <div key={vote.id} className="like-item-row">
                  {/* 왼쪽 하트 아이콘 - 클릭 시 좋아요 취소 */}
                  <div 
                    className="like-badge" 
                    onClick={() => handleUnlike(vote.id)}
                    style={{ cursor: "pointer" }}
                    title="좋아요 취소"
                  >
                    <span className="material-icons">favorite</span>
                  </div>

                  {/* 중앙 정보 박스 */}
                  <div className="info-card">
                    <div className="thumb-img">
                      {vote.candidate_a_image ? (
                        <img src={`http://localhost:4000/uploads/${vote.candidate_a_image}`} alt="candidate a" />
                      ) : (
                        <div style={{ width: "100%", height: "100%", background: "#eee", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "12px", color: "#ccc" }}>No Img</div>
                      )}
                    </div>
                    <h3 className="vote-title">{vote.title}</h3>
                    <div className="thumb-img">
                      {vote.candidate_b_image ? (
                        <img src={`http://localhost:4000/uploads/${vote.candidate_b_image}`} alt="candidate b" />
                      ) : (
                        <div style={{ width: "100%", height: "100%", background: "#eee", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "12px", color: "#ccc" }}>No Img</div>
                      )}
                    </div>
                  </div>

                  {/* 오른쪽 댓글 아이콘 버튼 */}
                  <button className="comment-icon-btn">
                    <span className="material-icons">chat_bubble_outline</span>
                  </button>
                </div>
              ))
            ) : (
              <div style={{ textAlign: "center", color: "#bbb", padding: "60px" }}>
                좋아요한 투표가 없습니다.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Like;
