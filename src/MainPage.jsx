import { useRef } from "react";
import "./MainPage.css";
import accountIcon from "./assets/account-icon.svg";
import vsLogo from "./assets/vs-logo.svg";
import leftCandidateImage from "./assets/candidate-left.jpg";
import rightCandidateImage from "./assets/candidate-right.jpg";
import { useMainPageAnimations } from "./useMainPageAnimations.js";

const copy = {
  navLabel: "주요 메뉴",
  accountLabel: "계정",
  heroLead: "결정하기 어려울 땐",
  heroAccent: "픽픽!",
  heroDescription:
    "가볍게 비교하고 빠르게 고르세요. 직관적인 투표 한 번으로 오늘의 선택을 끝낼 수 있어요.",
  voteLabel: "인기 투표",
  voteTitle: "오늘의 최애 결정전",
  candidateSuffix: " 후보",
  nextVote: "다음 투표 보러가기",
};

const candidates = [
  {
    name: "사쵸",
    image: leftCandidateImage,
  },
  {
    name: "외노자",
    image: rightCandidateImage,
  },
];

const [leftCandidate, rightCandidate] = candidates;

export default function MainPage() {
  const pageRef = useRef(null);

  useMainPageAnimations(pageRef);

  return (
    <div ref={pageRef}>
      <header className="site-header">
        <div className="header-inner">
          <a href="#" className="brand">
            PICKPICK
          </a>
          <nav className="site-nav" aria-label={copy.navLabel}>
            <a href="#">+ CREATE</a>
            <a href="#">RANKING</a>
            <a href="#">LOG IN</a>
            <a href="#" className="account-link" aria-label={copy.accountLabel}>
              <img src={accountIcon} alt="" />
            </a>
          </nav>
        </div>
        <div className="header-glow" aria-hidden="true" />
      </header>

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
              <a
                href="#"
                className="candidate-card"
                aria-label={`${leftCandidate.name}${copy.candidateSuffix}`}
              >
                <img src={leftCandidate.image} alt={leftCandidate.name} />
                <span className="candidate-name">{leftCandidate.name}</span>
              </a>

              <div className="vs-mark" aria-hidden="true">
                <img src={vsLogo} alt="" />
              </div>

              <a
                href="#"
                className="candidate-card"
                aria-label={`${rightCandidate.name}${copy.candidateSuffix}`}
              >
                <img src={rightCandidate.image} alt={rightCandidate.name} />
                <span className="candidate-name">{rightCandidate.name}</span>
              </a>
            </div>
          </article>
        </section>

        <a href="#" className="next-vote">
          {copy.nextVote}
        </a>
      </main>
    </div>
  );
}
