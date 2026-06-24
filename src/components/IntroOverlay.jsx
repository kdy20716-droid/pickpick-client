import { useEffect, useRef, useState } from "react";
import "./IntroOverlay.css";

// SPA 세션 메모리 변수: 페이지 새로고침 시 초기화되므로 새로고침 시 다시 볼 수 있음
let hasShownIntro = false;

// 타이밍 상수 (ms)
const LEAD_ANIM_START   = 200;   // "결정하기 어려울 땐?" 페이드인 시작
const ACCENT_ANIM_START = 1000;  // "픽픽!" 팝 등장
const EXIT_START        = 2100;  // 슬라이드업 퇴장 시작
const EXIT_DURATION     = 650;   // 슬라이드업 길이
const UNMOUNT_DELAY     = EXIT_START + EXIT_DURATION + 50; // DOM 제거

export default function IntroOverlay({ onDone }) {
  const [exiting, setExiting] = useState(false);
  const [popped, setPopped]   = useState(false);
  const timersRef = useRef([]);

  useEffect(() => {
    const t = (fn, ms) => {
      const id = setTimeout(fn, ms);
      timersRef.current.push(id);
      return id;
    };

    // "픽픽!" 글로우 강조 (팝 완료 직후)
    t(() => setPopped(true), ACCENT_ANIM_START + 550);

    // 슬라이드업 퇴장
    t(() => setExiting(true), EXIT_START);

    // DOM 제거 & 부모에 완료 알림
    t(() => {
      hasShownIntro = true;
      onDone?.();
    }, UNMOUNT_DELAY);

    return () => timersRef.current.forEach(clearTimeout);
  }, [onDone]);

  return (
    <div
      className={`intro-overlay${exiting ? " is-exiting" : ""}`}
      aria-hidden="true"
    >
      <span className="intro-lead">결정하기 어려울 땐?</span>
      <span className={`intro-accent${popped ? " is-popped" : ""}`}>픽픽!</span>
    </div>
  );
}

/**
 * 이번 SPA 세션에서 이미 인트로를 보여줬으면 true
 */
export function introAlreadyShown() {
  return hasShownIntro;
}

