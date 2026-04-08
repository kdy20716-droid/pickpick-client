import React from "react";
import CommentsModal from "./CommentsModal";

function App() {
  return (
    <div>
      {/* 헤더 */}
      <header className="header">
        <div className="logo">PICKPICK</div>
        <nav>
          <a href="#">+ CREATE</a>
          <a href="#" className="active">
            RANKING
          </a>
          <a href="#">LOG IN</a>
          <div className="profile-icon"></div>
        </nav>
      </header>

      {/* 댓글 모달 */}
      <CommentsModal />
    </div>
  );
}

export default App;
