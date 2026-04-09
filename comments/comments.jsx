import React from "react";
import "./comments.css";

export default function CommentsModal({ onClose }) {
  return (
    <div className="overlay">
      <div className="modal">
        {/* 헤더 */}
        <div className="modal-comment-header">
          <h2>댓글</h2>
          <span className="comment-count">(133)</span>
          <button className="close" onClick={onClose}>
            ×
          </button>
        </div>

        {/* 댓글 리스트 */}
        <div className="comment-list">
          {[1, 2, 3, 4].map((i) => (
            <div className="comment" key={i}>
              <div className="avatar"></div>

              <div className="content">
                <div className="top">
                  <span className="name">사용자 {i}</span>
                  <span className="menu">⋯</span>
                </div>

                <p>댓글 내용입니다</p>

                <div className="actions">
                  <span>👍 {i * 10}</span>
                  <span>💬 {i}</span>
                </div>

                <div className="reply">답글 {i}개</div>
              </div>
            </div>
          ))}
        </div>

        {/* 입력 */}
        <div className="comment-input">
          <div className="avatar small"></div>
          <input type="text" placeholder="댓글 추가..." />
        </div>
      </div>
    </div>
  );
}
