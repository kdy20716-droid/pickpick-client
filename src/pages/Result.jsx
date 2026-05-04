import React, { useEffect, useState } from "react";
import "./Result.css";
import { getVote } from "../api/posts";

const Result = () => {
  const [voteResults, setVoteResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const data = await getVote(searchKeyword);
        setVoteResults(data);
      } catch (error) {
        console.error("결과를 불러오는데 실패했습니다.", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [searchKeyword]);

  if (loading) {
    return <div className="result-container" style={{ color: "white", textAlign: "center", padding: "50px" }}>로딩 중...</div>;
  }

  return (
    <div className="result-container">
      <div className="search-section">
        <div className="search-bar">
          <input 
            type="text" 
            placeholder="투표 결과 모아보기" 
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
          <span className="material-icons search-icon">search</span>
        </div>
      </div>

      <main className="result-card">
        {voteResults.length > 0 ? (
          voteResults.map((vote) => {
            const leftVotes = vote.candidate_a_count || 0;
            const rightVotes = vote.candidate_b_count || 0;
            const total = leftVotes + rightVotes;
            const leftPercent = total === 0 ? 50 : Math.round((leftVotes / total) * 100);
            const rightPercent = total === 0 ? 50 : 100 - leftPercent;
            const isLeftWinner = leftVotes > rightVotes;
            const isRightWinner = rightVotes > leftVotes;

            return (
              <div key={vote.id} className="result-item">
                <h3 className="result-title">{vote.title}</h3>
                <div className="result-row">
                  {/* 왼쪽 후보 */}
                  <div className="candidate">
                    {isLeftWinner && <div className="crown">👑</div>}
                    <div className="img-wrapper">
                      {vote.candidate_a_image ? (
                        <img src={`http://localhost:4000/uploads/${vote.candidate_a_image}`} alt="left" />
                      ) : (
                        <div className="img-placeholder">{vote.candidate_a_name?.slice(0, 1)}</div>
                      )}
                    </div>
                    <span className="percent">{leftPercent}%</span>
                  </div>

                  {/* 중앙 게이지 */}
                  <div className="gauge-track">
                    <div
                      className="gauge-fill left-fill"
                      style={{ width: `${leftPercent}%` }}
                    >
                      <span className="count">{leftVotes} 표</span>
                    </div>
                    <div
                      className="gauge-fill right-fill"
                      style={{ width: `${rightPercent}%` }}
                    >
                      <span className="count">{rightVotes} 표</span>
                    </div>
                  </div>

                  {/* 오른쪽 후보 */}
                  <div className="candidate">
                    {isRightWinner && <div className="crown">👑</div>}
                    <div className="img-wrapper">
                      {vote.candidate_b_image ? (
                        <img src={`http://localhost:4000/uploads/${vote.candidate_b_image}`} alt="right" />
                      ) : (
                        <div className="img-placeholder">{vote.candidate_b_name?.slice(0, 1)}</div>
                      )}
                    </div>
                    <span className="percent">{rightPercent}%</span>
                  </div>

                  {/* 댓글 버튼 */}
                  <button className="icon-btn">
                    <span className="material-icons">chat_bubble_outline</span>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ color: "white", textAlign: "center", padding: "50px" }}>결과가 없습니다.</div>
        )}
      </main>
    </div>
  );
};

export default Result;
