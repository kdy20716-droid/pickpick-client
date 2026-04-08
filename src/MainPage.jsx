import { useRef } from "react";
import "./MainPage.css";
import accountIcon from "./assets/account-icon.svg";
import vsLogo from "./assets/vs-logo.svg";
import leftCandidateImage from "./assets/candidate-left.jpg";
import rightCandidateImage from "./assets/candidate-right.jpg";
import { useMainPageAnimations } from "./useMainPageAnimations.js";

const copy = {
  navLabel: "\uC8FC\uC694 \uBA54\uB274",
  accountLabel: "\uACC4\uC815",
  heroLead: "\uACB0\uC815\uD558\uAE30 \uC5B4\uB824\uC6B8 \uB550",
  heroAccent: "\uD53D\uD53D!",
  heroDescription:
    "\uAC00\uBCD1\uAC8C \uBE44\uAD50\uD558\uACE0 \uBE60\uB974\uAC8C \uACE0\uB974\uC138\uC694. \uC9C1\uAD00\uC801\uC778 \uD22C\uD45C \uD55C \uBC88\uC73C\uB85C \uC624\uB298\uC758 \uC120\uD0DD\uC744 \uB05D\uB0BC \uC218 \uC788\uC5B4\uC694.",
  voteLabel: "\uC778\uAE30 \uD22C\uD45C",
  voteTitle: "\uC624\uB298\uC758 \uCD5C\uC560 \uACB0\uC815\uC804",
  candidateSuffix: " \uD6C4\uBCF4",
  nextVote: "\uB2E4\uC74C \uD22C\uD45C \uBCF4\uB7EC\uAC00\uAE30",
};

const candidates = [
  {
    name: "\uC0AC\uCD08",
    image: leftCandidateImage,
  },
  {
    name: "\uC678\uB178\uC790",
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
          <div className="rank-badge">1st</div>

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
