import { useRef } from "react";
import { Link } from "react-router-dom";
import "./MainPage.css";
import vsLogo from "../assets/vs-logo.svg";
import { mainRouteTransitions } from "../routeTransitions.js";
import { useMainPageAnimations } from "../useMainPageAnimations.js";
import { useScrollToVote } from "../useScrollToVote.js";
import { featuredVote } from "../data/votes.js";

const copy = {
  navLabel: "주요 메뉴",
  accountLabel: "계정",
  heroLead: "결정하기 어려울 땐",
  heroAccent: "픽픽!",
  heroDescription:
    "가볍게 비교하고 빠르게 골라보세요. 직관적인 투표 한 번으로 오늘의 선택을 완성할 수 있어요.",
  voteLabel: "인기 투표",
  voteTitle: featuredVote.title,
  candidateSuffix: " 후보",
  nextVote: "상세 투표 보러가기",
};

const { leftCandidate, rightCandidate } = featuredVote;

const voteLinkState = { transition: mainRouteTransitions.link };

export default function MainPage() {
  const pageRef = useRef(null);

  useMainPageAnimations(pageRef);
  const isLeavingForVote = useScrollToVote();

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
            <h2>{copy.voteTitle}</h2>

            <div className="vote-match">
              <Link
                to="/vote"
                state={voteLinkState}
                className="candidate-card"
                aria-label={`${leftCandidate.name}${copy.candidateSuffix}`}
              >
                <img src={leftCandidate.image} alt={leftCandidate.name} />
                <span className="candidate-name">{leftCandidate.name}</span>
              </Link>

              <div className="vs-mark" aria-hidden="true">
                <img src={vsLogo} alt="" />
              </div>

              <Link
                to="/vote"
                state={voteLinkState}
                className="candidate-card"
                aria-label={`${rightCandidate.name}${copy.candidateSuffix}`}
              >
                <img src={rightCandidate.image} alt={rightCandidate.name} />
                <span className="candidate-name">{rightCandidate.name}</span>
              </Link>
            </div>
          </article>
        </section>

        <Link
          to="/vote"
          state={voteLinkState}
          className="next-vote"
        >
          {copy.nextVote}
        </Link>
      </main>
    </div>
  );
}
