import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./Like.css";
import styles from "./MyPage.module.css";
import { useAuth } from "../../contexts/AuthContext";
import { getVote, toggleLike } from "../../api/posts";
import Comments from "../../components/Comments.jsx";
import { getImageUrl } from "../../utils/image";

const Like = () => {
  const [likedVotes, setLikedVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");
  const { user: currentUser } = useAuth();
  const [selectedVoteForComments, setSelectedVoteForComments] = useState(null);
  const navigate = useNavigate();

  const fetchLikedVotes = useCallback(async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const data = await getVote(
        searchKeyword,
        null,
        null,
        currentUser.id,
        null,
        true,
        null,
      );
      setLikedVotes(data);
    } catch (error) {
      console.error("좋아요 목록을 불러오는데 실패했습니다.", error);
    } finally {
      setLoading(false);
    }
  }, [currentUser, searchKeyword]);

  useEffect(() => {
    fetchLikedVotes();
  }, [fetchLikedVotes]);

  const handleUnlike = async (postId) => {
    if (!currentUser) return;

    try {
      const res = await toggleLike(postId, currentUser.id);
      if (res.success) {
        // 성공적으로 취소되면 목록에서 해당 항목 제거
        setLikedVotes((prev) => prev.filter((vote) => vote.id !== postId));

        // VotePage와 좋아요 상태 동기화 (localStorage 업데이트)
        const userId = currentUser.id;
        const savedActions = localStorage.getItem(`cardActions_${userId}`);
        if (savedActions) {
          const actions = JSON.parse(savedActions);
          const cardId = postId.toString();
          if (actions[cardId]) {
            actions[cardId].like = false;
            // 로컬 카운트도 1 감소 (VotePage에서 표시용)
            if (typeof actions[cardId].likeCount === "number") {
              actions[cardId].likeCount = Math.max(
                0,
                actions[cardId].likeCount - 1,
              );
            }
            localStorage.setItem(
              `cardActions_${userId}`,
              JSON.stringify(actions),
            );
          }
        }
      }
    } catch (error) {
      console.error("좋아요 취소 실패:", error);
      alert("좋아요 취소에 실패했습니다.");
    }
  };

  const handleToggleComments = (vote) => {
    if (selectedVoteForComments?.id === vote.id) {
      setSelectedVoteForComments(null);
    } else {
      setSelectedVoteForComments(vote);
    }
  };

  return (
    <div className="like-page-container">
      {/* 상단 브레드크럼 */}
      <div className={styles.topSearchRow} style={{ marginBottom: "20px" }}>
        <p className={styles.breadcrumb}>마이페이지 〉 좋아요한 투표</p>
      </div>

      {/* 검색바 영역 - Result 페이지와 구조 통일 */}
      <div className="like-search-section">
        <div className="like-search-bar">
          <input
            type="text"
            placeholder="좋아요한 투표 검색"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
          <span className="like-search-icon">🔍</span>
        </div>
      </div>

      <div className="like-content">
        <p className="description-text">
          최근 좋아요한 항목부터 순서대로 표시됩니다.
        </p>

        {loading ? (
          <div
            className="like-list"
            style={{ textAlign: "center", color: "#bbb", padding: "60px" }}
          >
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
                  <div
                    className="info-card"
                    onClick={() => navigate(`/vote/${vote.id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="thumb-img">
                      {vote.candidate_a_image ? (
                        <img
                          src={getImageUrl(vote.candidate_a_image)}
                          alt="candidate a"
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            background: "#eee",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            fontSize: "12px",
                            color: "#ccc",
                          }}
                        >
                          No Img
                        </div>
                      )}
                    </div>
                    <h3 className="vote-title">{vote.title}</h3>
                    <div className="thumb-img">
                      {vote.candidate_b_image ? (
                        <img
                          src={getImageUrl(vote.candidate_b_image)}
                          alt="candidate b"
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            background: "#eee",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            fontSize: "12px",
                            color: "#ccc",
                          }}
                        >
                          No Img
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    className={`icon-btn${selectedVoteForComments?.id === vote.id ? " active" : ""}`}
                    onClick={() => handleToggleComments(vote)}
                  >
                    <span className="material-icons">chat_bubble_outline</span>
                  </button>
                </div>
              ))
            ) : (
              <div
                style={{ textAlign: "center", color: "#bbb", padding: "60px" }}
              >
                좋아요한 투표가 없습니다.
              </div>
            )}
          </div>
        )}
      </div>
      {selectedVoteForComments && (
        <Comments
          title={selectedVoteForComments.title}
          targetCardId={`vote-item-${selectedVoteForComments.id}`}
          postDbId={selectedVoteForComments.id}
          onClose={() => setSelectedVoteForComments(null)}
          isCentered={true}
        />
      )}
    </div>
  );
};

export default Like;
