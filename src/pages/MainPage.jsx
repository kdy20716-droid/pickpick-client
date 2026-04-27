import { Link } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import "./MainPage.css";
import vsLogo from "../assets/vs-logo.svg";
import { useMainPageAnimations } from "../hooks/useMainPageAnimations.js";
import { useScrollToVote } from "./animations/useScrollToVote.js";
import { mainRouteTransitions } from "./animations/routeTransitions.js";
import { getVote } from "../api/posts.js";

const voteLinkState = { transition: mainRouteTransitions.link };

const copy = {
  navLabel: "주요 메뉴",
  accountLabel: "계정",
  heroLead: "결정하기 어려울 땐",
  heroAccent: "픽픽!",
  heroDescription:
    "가볍게 비교하고 빠르게 골라보세요. 직관적인 투표 한 번으로 오늘의 선택을 완성할 수 있어요.",
  voteLabel: "인기 투표",
  candidateSuffix: " 후보",
  nextVote: "상세 투표 보러가기",
};

export default function MainPage() {
  const pageRef = useRef(null);
  const [featuredVote, setFeaturedVote] = useState(null);

  useMainPageAnimations(pageRef);
  const isLeavingForVote = useScrollToVote();

  useEffect(() => {
    const fetchPopularVote = async () => {
      try {
        const data = await getVote();
        if (data && data.length > 0) {
          // 조회수 또는 투표수가 가장 높은 게시물을 인기 투표로 선정 (여기서는 총 투표수로 정렬)
          const sortedData = data.sort((a, b) => {
            const totalA = (a.candidate_a_count || 0) + (a.candidate_b_count || 0);
            const totalB = (b.candidate_a_count || 0) + (b.candidate_b_count || 0);
            return totalB - totalA;
          });
          
          const item = sortedData[0];
          setFeaturedVote({
            title: item.title,
            leftCandidate: {
              name: item.candidate_a_name,
              image: item.candidate_a_image ? `http://localhost:4000/uploads/${item.candidate_a_image}` : null,
            },
            rightCandidate: {
              name: item.candidate_b_name,
              image: item.candidate_b_image ? `http://localhost:4000/uploads/${item.candidate_b_image}` : null,
            },
          });
        }
      } catch (error) {
        console.error("인기 투표를 불러오는데 실패했습니다.", error);
      }
    };
    fetchPopularVote();
  }, []);

  return (
    <div
      ref={pageRef}
      className={`main-page${isLeavingForVote ? " is-leaving-for-vote" : ""}`}
    >
      <main className="page-main">
        <section className="hero">
          <h1>
            {copy.heroLead} <span>{copy.heroAccent}</span>
          </h1>
          <p>{copy.heroDescription}</p>
        </section>

        <section className="vote-section" aria-label={copy.voteLabel}>
          <div className="rank-badge">
            <span className="rank-badge-inner">1st</span>
          </div>

          <article className="vote-card">
            <h2>{featuredVote ? featuredVote.title : "로딩 중..."}</h2>

            <div className="vote-match">
              {featuredVote && (
                <>
                  <Link
                    to="/vote"
                    state={voteLinkState}
                    className="candidate-card"
                    aria-label={`${featuredVote.leftCandidate.name}${copy.candidateSuffix}`}
                  >
                    {featuredVote.leftCandidate.image && (
                      <img src={featuredVote.leftCandidate.image} alt={featuredVote.leftCandidate.name} />
                    )}
                    <span className="candidate-name">{featuredVote.leftCandidate.name}</span>
                  </Link>

                  <div className="vs-mark" aria-hidden="true">
                    <img src={vsLogo} alt="" />
                  </div>

                  <Link
                    to="/vote"
                    state={voteLinkState}
                    className="candidate-card"
                    aria-label={`${featuredVote.rightCandidate.name}${copy.candidateSuffix}`}
                  >
                    {featuredVote.rightCandidate.image && (
                      <img src={featuredVote.rightCandidate.image} alt={featuredVote.rightCandidate.name} />
                    )}
                    <span className="candidate-name">{featuredVote.rightCandidate.name}</span>
                  </Link>
                </>
              )}
            </div>
          </article>
        </section>

        <Link to="/vote" state={voteLinkState} className="next-vote">
          {copy.nextVote}
        </Link>
      </main>
    </div>
  );
}
