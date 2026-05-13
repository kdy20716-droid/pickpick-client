import { useState, useEffect } from "react";
import "./ranking.css";
import goldMedal from "../assets/1위 메달.png";
import silverMedal from "../assets/2위메달.png";
import bronzeMedal from "../assets/3위 메달.png";
import vsImage from "../assets/vs.png";
import { getRanking } from "../api/posts.js";

function Ranking() {
  const [topRankings, setTopRankings] = useState([]);
  const [rankingItems, setRankingItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const data = await getRanking();

        // 데이터 포맷팅
        const formatted = data.map((item) => ({
          id: item.id,
          title: item.title,
          topImage: item.candidate_a_image
            ? item.candidate_a_image?.startsWith("http")
              ? item.candidate_a_image
              : `https://dolphin-app-onqn2.ondigitalocean.app/uploads/${item.candidate_a_image}`
            : null,
          bottomImage: item.candidate_b_image
            ? item.candidate_b_image?.startsWith("http")
              ? item.candidate_b_image
              : `https://dolphin-app-onqn2.ondigitalocean.app/uploads/${item.candidate_b_image}`
            : null,
          leftImage: item.candidate_a_image
            ? item.candidate_a_image?.startsWith("http")
              ? item.candidate_a_image
              : `https://dolphin-app-onqn2.ondigitalocean.app/uploads/${item.candidate_a_image}`
            : null,
          rightImage: item.candidate_b_image
            ? item.candidate_b_image?.startsWith("http")
              ? item.candidate_b_image
              : `https://dolphin-app-onqn2.ondigitalocean.app/uploads/${item.candidate_b_image}`
            : null,
        }));

        // 1, 2, 3위 분리 (순서: 2위, 1위, 3위로 화면에 배치됨)
        const top3 = [];
        if (formatted.length >= 2)
          top3.push({
            ...formatted[1],
            rankClass: "second",
            medal: silverMedal,
            medalAlt: "silver medal",
            isBig: false,
          });
        if (formatted.length >= 1)
          top3.push({
            ...formatted[0],
            rankClass: "first",
            medal: goldMedal,
            medalAlt: "gold medal",
            isBig: true,
          });
        if (formatted.length >= 3)
          top3.push({
            ...formatted[2],
            rankClass: "third",
            medal: bronzeMedal,
            medalAlt: "bronze medal",
            isBig: false,
          });

        setTopRankings(top3);
        setRankingItems(formatted.slice(3));
      } catch (error) {
        console.error("랭킹을 불러오는데 실패했습니다.", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRanking();
  }, []);

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: "100px", color: "white" }}>
        랭킹 로딩 중...
      </div>
    );

  return (
    <>
      <section className="ranking-section">
        <div className="top3">
          {topRankings.map((ranking) => (
            <div key={ranking.id} className={`rank-card ${ranking.rankClass}`}>
              <img
                src={ranking.medal}
                className="medal"
                alt={ranking.medalAlt}
              />

              <div className={`card${ranking.isBig ? " big" : ""}`}>
                {ranking.topImage && (
                  <img
                    src={ranking.topImage}
                    className="img top"
                    alt="candidate A"
                  />
                )}
                <img src={vsImage} className="vs" alt="vs" />
                {ranking.bottomImage && (
                  <img
                    src={ranking.bottomImage}
                    className="img bottom"
                    alt="candidate B"
                  />
                )}
              </div>
              <div className="vote-title">{ranking.title}</div>
            </div>
          ))}
        </div>

        <div className="ranking-list">
          {rankingItems.map((item, index) => (
            <div key={item.id} className="item">
              <div className="num">{index + 4}</div>

              <div className="vs-row">
                {item.leftImage && (
                  <img src={item.leftImage} alt="candidate A" />
                )}
                <img src={vsImage} className="vs-small" alt="vs" />
                {item.rightImage && (
                  <img src={item.rightImage} alt="candidate B" />
                )}
              </div>

              <div className="title">{item.title}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export default Ranking;
