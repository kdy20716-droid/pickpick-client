import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./MyPage.module.css";
import "./MyCreate.css";
import { useAuth } from "../../contexts/AuthContext";
import { getVote, deleteVote } from "../../api/posts";
import { getCandidateThumbnail } from "../../utils/image";

const MyCreate = () => {
  const [myVotes, setMyVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const fetchMyVotes = useCallback(async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      // author_id 파라미터 및 searchKeyword를 사용하여 본인이 만든 투표 조회
      const data = await getVote(
        searchKeyword,
        null,
        null,
        null,
        null,
        null,
        currentUser.id,
      );
      setMyVotes(data);
    } catch (error) {
      console.error("내가 만든 투표를 불러오는데 실패했습니다.", error);
    } finally {
      setLoading(false);
    }
  }, [currentUser, searchKeyword]);

  useEffect(() => {
    fetchMyVotes();
  }, [fetchMyVotes]);

  const handleVoteClick = (postId) => {
    navigate(`/vote/${postId}`);
  };

  const handleDelete = async (e, postId) => {
    e.stopPropagation();
    if (!window.confirm("정말로 이 투표를 삭제하시겠습니까?")) return;

    try {
      await deleteVote(postId, currentUser.id);
      alert("투표가 삭제되었습니다.");
      setMyVotes((prev) => prev.filter((v) => v.id !== postId));
    } catch (error) {
      console.error("투표 삭제 에러:", error);
      alert("투표 삭제에 실패했습니다.");
    }
  };

  return (
    <div className="my-create-container">
      <div className={styles.topSearchRow} style={{ marginBottom: "20px" }}>
        <p className={styles.breadcrumb}>마이페이지 〉 내가 만든 투표</p>
      </div>

      <div className="mycreate-search-section">
        <div className="mycreate-search-bar">
          <input
            type="text"
            placeholder="내가 만든 투표 검색"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
          <span className="mycreate-search-icon">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fc92c7"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
        </div>
      </div>

      <div className="my-create-content">
        <p className="description-text">본인이 직접 생성한 투표 목록입니다.</p>

        {loading ? (
          <div className="loading-state">데이터를 불러오는 중입니다...</div>
        ) : (
          <div className="my-vote-list">
            {myVotes.length > 0 ? (
              myVotes.map((vote) => (
                <div
                  key={vote.id}
                  className="my-vote-item"
                  onClick={() => handleVoteClick(vote.id)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="vote-info">
                    <span className="vote-category">
                      [{vote.category || "기타"}]
                    </span>
                    <h3 className="vote-title">{vote.title}</h3>
                    <div className="vote-stats">
                      <span>조회수 {vote.view_count || 0}</span>
                      <span>
                        투표수{" "}
                        {(vote.candidate_a_count || 0) +
                          (vote.candidate_b_count || 0)}
                      </span>
                      <span>
                        작성일 {new Date(vote.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="vote-actions">
                      <button
                        className="delete-btn"
                        onClick={(e) => handleDelete(e, vote.id)}
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                  <div className="vote-preview">
                    {vote.candidate_a_image ? (
                      <img
                        src={getCandidateThumbnail(
                          vote.candidate_a_image,
                          vote.candidate_a_type,
                        )}
                        alt="a"
                      />
                    ) : (
                      <div className="no-img">No Img</div>
                    )}
                    <span className="vs-text">VS</span>
                    {vote.candidate_b_image ? (
                      <img
                        src={getCandidateThumbnail(
                          vote.candidate_b_image,
                          vote.candidate_b_type,
                        )}
                        alt="b"
                      />
                    ) : (
                      <div className="no-img">No Img</div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">생성한 투표가 없습니다.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCreate;
