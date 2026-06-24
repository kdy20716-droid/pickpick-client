import { useEffect, useState } from "react";
import "./IntroOverlay.css";

// 세션 내 한 번만 표시 (새로고침 시 재생, 탭 내 이동 시 스킵)
let _shownThisSession = false;

export function introAlreadyShown() {
  return _shownThisSession;
}

export default function IntroOverlay({ onDone }) {
  // "idle" → "lead" → "accent" → "out"
  const [phase, setPhase] = useState("idle");

  useEffect(() => {
    _shownThisSession = true;

    // "결정하기 어려울 땐?" 등장
    const t1 = setTimeout(() => setPhase("lead"), 80);
    // "픽픽!" 바로 아래에 등장
    const t2 = setTimeout(() => setPhase("accent"), 900);
    // 전체 페이드 아웃
    const t3 = setTimeout(() => setPhase("out"), 2200);
    // 완전 제거
    const t4 = setTimeout(() => onDone(), 2750);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onDone]);

  return (
    <div className={`intro-overlay${phase === "out" ? " intro-overlay--out" : ""}`} aria-hidden="true">
      <div className="intro-text-wrap">
        <p className={`intro-lead${phase !== "idle" ? " is-visible" : ""}`}>
          결정하기 어려울 땐?
        </p>
        <p className={`intro-accent${phase === "accent" || phase === "out" ? " is-visible" : ""}`}>
          픽픽!
        </p>
      </div>
    </div>
  );
}
