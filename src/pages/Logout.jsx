import React, { useState, useRef, useEffect } from "react";
import "./MyPage.css";

export default function MyPage() {
  const [showLogout, setShowLogout] = useState(false);
  const boxRef = useRef(null);

  const handleToggle = () => {
    setShowLogout((prev) => !prev);
  };

  const handleLogout = () => {
    console.log("로그아웃 실행");
    // 실제 로그아웃 로직 추가 (토큰 삭제, redirect 등)
  };

  // 바깥 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setShowLogout(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="sidebar">
      <div className="user-section" ref={boxRef}>
        {/* 이름 + 화살표 (둘 다 클릭 가능) */}
        <div className="user-trigger" onClick={handleToggle}>
          <div className="user-dot"></div>
          <span className="user-name">홍길동</span>
          <span className="arrow">{">"}</span>
        </div>

        {/* 조건부 (변경 금지) */}
        {showLogout && (
          <div className="logout-box">
            <button className="logout-btn" onClick={handleLogout}>
              로그아웃
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
