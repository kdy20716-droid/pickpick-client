import React, { useState, useEffect, useCallback } from "react";
import styles from "./MyPage.module.css";
import "./MyCreate.css";
import { useAuth } from "../../contexts/AuthContext";
import { getVote } from "../../api/posts";

const MyCreate = () => {
  const [myVotes, setMyVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();

  const fetchMyVotes = useCallback(async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      // author_id 파라미터를 사용하여 본인이 만든 투표만 조회
      const data = await getVote(
        null,
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
  }, [currentUser]);

  useEffect(() => {
    fetchMyVotes();
  }, [fetchMyVotes]);

  return (
    <div className="my-create-container">
      <div className={styles.topSearchRow}>
        <p className={styles.breadcrumb}>마이페이지 〉 내가 만든 투표</p>
      </div>

      <div className="my-create-content">
        <p className="description-text">본인이 직접 생성한 투표 목록입니다.</p>

        {loading ? (
          <div className="loading-state">데이터를 불러오는 중입니다...</div>
        ) : (
          <div className="my-vote-list">
            {myVotes.length > 0 ? (
              myVotes.map((vote) => (
                <div key={vote.id} className="my-vote-item">
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
                  </div>
                  <div className="vote-preview">
                    {vote.candidate_a_image ? (
                      <img src={vote.candidate_a_image} alt="a" />
                    ) : (
                      <div className="no-img">No Img</div>
                    )}
                    <span className="vs-text">VS</span>
                    {vote.candidate_b_image ? (
                      <img src={vote.candidate_b_image} alt="b" />
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
