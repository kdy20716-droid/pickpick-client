import "./ranking.css";
import goldMedal from "../assets/1위 메달.png";
import silverMedal from "../assets/2위메달.png";
import bronzeMedal from "../assets/3위 메달.png";
import vsImage from "../assets/vs.png";
import sachoImage from "../assets/사초.png";
import workerImage from "../assets/외노자.png";

const topRankings = [
  {
    id: 2,
    rankClass: "second",
    medal: silverMedal,
    medalAlt: "silver medal",
    topImage: sachoImage,
    bottomImage: workerImage,
    title: "오늘의 밸런스 게임",
    isBig: false,
  },
  {
    id: 1,
    rankClass: "first",
    medal: goldMedal,
    medalAlt: "gold medal",
    topImage: workerImage,
    bottomImage: sachoImage,
    title: "직장인 최애 점심 메뉴",
    isBig: true,
  },
  {
    id: 3,
    rankClass: "third",
    medal: bronzeMedal,
    medalAlt: "bronze medal",
    topImage: sachoImage,
    bottomImage: workerImage,
    title: "주말 집콕 vs 외출",
    isBig: false,
  },
];

const rankingItems = [
  {
    id: 4,
    leftImage: sachoImage,
    rightImage: workerImage,
    title: "야식으로 떡볶이 vs 치킨",
  },
  {
    id: 5,
    leftImage: workerImage,
    rightImage: sachoImage,
    title: "아침형 인간 vs 올빼미형 인간",
  },
  {
    id: 6,
    leftImage: sachoImage,
    rightImage: workerImage,
    title: "여행은 계획형 vs 즉흥형",
  },
];

function Ranking() {
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
                <img
                  src={ranking.topImage}
                  className="img top ranking-card-image"
                  alt="character 1"
                />
                <img src={vsImage} className="vs" alt="vs" />
                <img
                  src={ranking.bottomImage}
                  className="img bottom ranking-card-image"
                  alt="character 2"
                />
              </div>
              <div className="vote-title">{ranking.title}</div>
            </div>
          ))}
        </div>

        <div className="ranking-list">
          {rankingItems.map((item) => (
            <div key={item.id} className="item">
              <div className="num">{item.id}</div>

              <div className="vs-row">
                <img
                  src={item.leftImage}
                  className="ranking-list-image"
                  alt="character 1"
                />
                <img src={vsImage} className="vs-small" alt="vs" />
                <img
                  src={item.rightImage}
                  className="ranking-list-image"
                  alt="character 2"
                />
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
