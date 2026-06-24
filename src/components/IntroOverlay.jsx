import { useEffect, useState } from "react";
import "./IntroOverlay.css";

// 세션 내 한 번만 표시 (새로고침 시 재생, 탭 내 이동 시 스킵)
let _shownThisSession = false;

export function introAlreadyShown() {
  return _shownThisSession;
}

export default function IntroOverlay({ onDone }) {
  const [phase, setPhase] = useState("lead"); // "lead" | "accent" | "out"

  useEffect(() => {
    _shownThisSession = true;

    // 1단계: "결정하기 어려울 땐?" 표시 (1.1s)
    const t1 = setTimeout(() => setPhase("accent"), 1100);
    // 2단계: "픽픽!" 표시 (1.0s)
    const t2 = setTimeout(() => setPhase("out"), 2100);
    // 3단계: 페이드 아웃 후 제거 (0.5s transition)
    const t3 = setTimeout(() => onDone(), 2650);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onDone]);

  return (
    <div className={`intro-overlay${phase === "out" ? " intro-overlay--out" : ""}`} aria-hidden="true">
      <div className="intro-text-wrap">
        <p className={`intro-lead${phase === "lead" ? " is-visible" : ""}`}>
          결정하기 어려울 땐?
        </p>
        <p className={`intro-accent${phase === "accent" || phase === "out" ? " is-visible" : ""}`}>
          픽픽!
        </p>
      </div>
    </div>
  );
}
