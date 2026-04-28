import React from "react";
import "./Result.css";

const Result = () => {
  // 예시 데이터 (이미지 주소는 실제 프로젝트 경로로 수정하세요)
  const voteResults = [
    {
      id: 1,
      title: "오늘 점심 뭐 먹을까?",
      leftVotes: 456,
      rightVotes: 201,
      leftImg: "https://via.placeholder.com/150",
      rightImg: "https://via.placeholder.com/150",
    },
    {
      id: 2,
      title: "주말에 가기 좋은 여행지는?",
      leftVotes: 320,
      rightVotes: 512,
      leftImg: "https://via.placeholder.com/150",
      rightImg: "https://via.placeholder.com/150",
    },
    {
      id: 3,
      title: "최애 간식 투표",
      leftVotes: 456,
      rightVotes: 201,
      leftImg: "https://via.placeholder.com/150",
      rightImg: "https://via.placeholder.com/150",
    },
  ];

  return (
    <div className="result-container">
      <div className="search-section">
        <div className="search-bar">
          <input type="text" placeholder="투표 결과 모아보기" />
          <span className="material-icons search-icon">search</span>
        </div>
      </div>

      <main className="result-card">
        {voteResults.map((vote) => {
          const total = vote.leftVotes + vote.rightVotes;
          const leftPercent = Math.round((vote.leftVotes / total) * 100);
          const rightPercent = 100 - leftPercent;
          const isLeftWinner = vote.leftVotes > vote.rightVotes;

          return (
            <div key={vote.id} className="result-item">
              <h3 className="result-title">{vote.title}</h3>
              <div className="result-row">
                {/* 왼쪽 후보 */}
                <div className="candidate">
                  {isLeftWinner && <div className="crown">👑</div>}
                  <div className="img-wrapper">
                    <img src={vote.leftImg} alt="left" />
                  </div>
                  <span className="percent">{leftPercent}%</span>
                </div>

                {/* 중앙 게이지 */}
                <div className="gauge-track">
                  <div
                    className="gauge-fill left-fill"
                    style={{ width: `${leftPercent}%` }}
                  >
                    <span className="count">{vote.leftVotes} 표</span>
                  </div>
                  <div
                    className="gauge-fill right-fill"
                    style={{ width: `${rightPercent}%` }}
                  >
                    <span className="count">{vote.rightVotes} 표</span>
                  </div>
                </div>

                {/* 오른쪽 후보 */}
                <div className="candidate">
                  {!isLeftWinner && <div className="crown">👑</div>}
                  <div className="img-wrapper">
                    <img src={vote.rightImg} alt="right" />
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
        })}
      </main>
    </div>
  );
};

export default Result;
